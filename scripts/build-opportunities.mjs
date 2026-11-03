import fs from "node:fs/promises";

const profile = JSON.parse(await fs.readFile("config/candidate-profile.json", "utf8"));
const uniqueSkills = [...new Set([
  ...profile.matching.employment.prioritySkills,
  ...profile.matching.freelance.prioritySkills
].map((value) => value.toLowerCase()))];
const targetTitles = [
  ...profile.matching.employment.targetTitles,
  ...profile.matching.freelance.targetServices
].map((value) => value.toLowerCase());
const headers = { "user-agent": "CreativeHunterAI/1.0 (public opportunity discovery dashboard)" };

async function getJson(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
function plainText(value = "") {
  return String(value)
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function normalizeText(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
const allowedLanguages = (profile.matching.employment.workingLanguages || []).map(normalizeText);
const languageAliases = [
  { name: "english", words: /\b(?:english|anglais|englisch)\b/ },
  { name: "french", words: /\b(?:french|francais|franzoesisch)\b/ },
  { name: "german", words: /\b(?:german|deutsch\w*|allemand\w*)\b/ },
  { name: "dutch", words: /\b(?:dutch|nederlands?\w*|neerlandais\w*|hollandais\w*)\b/ },
  { name: "spanish", words: /\b(?:spanish|espanol|espagnol)\b/ },
  { name: "arabic", words: /\b(?:arabic|arabe)\b/ }
];
const strongLanguageRequirement = /\b(?:c1|c2|b2|fluent|native|advanced|proficient|excellent|very good|good knowledge|strong command|must speak|required|kenntnisse|sprachkenntnisse|sehr gute|gute kenntnisse|fliessend|verhandlungssicher|courant|maitrise|bilingue|vloeiend|moedertaal)\b/i;
function hasUnsupportedLanguageRequirement(value = "") {
  const text = normalizeText(value);
  return languageAliases.some((language) => {
    if (allowedLanguages.includes(language.name)) return false;
    for (const match of text.matchAll(new RegExp(language.words.source, "g"))) {
      const start = Math.max(0, match.index - 100);
      const end = Math.min(text.length, match.index + match[0].length + 100);
      if (strongLanguageRequirement.test(text.slice(start, end))) return true;
    }
    return false;
  });
}
function employmentLocationAllowed(item) {
  if (item.kind !== "job") return true;
  const place = normalizeText([item.location, item.type, item.summary].join(" "));
  if (!place || /not specified|non precise|unspecified/.test(place)) return true;
  if (/remote|work from home|worldwide|anywhere|distributed|telecommut/.test(place)) return true;
  return /france|french|dubai|abu dhabi|sharjah|ajman|ras al khaimah|united arab emirates|\buae\b|emirates/.test(place);
}
function classify(text, explicitType = "") {
  const type = explicitType.toLowerCase();
  if (type.includes("freelance") || type.includes("contractor") || type.includes("project-based")) return "freelance";
  return "job";
}
function score(text) {
  const haystack = text.toLowerCase();
  const matched = uniqueSkills.filter((skill) => haystack.includes(skill));
  const titleMatches = profile.matching.employment.targetTitles.filter((title) => haystack.includes(title.toLowerCase())).length;
  const locationBoost = /remote|dubai|united arab emirates|france|europe|worldwide/.test(haystack) ? 5 : 0;
  return Math.min(97, Math.max(35, 55 + matched.length * 12 + titleMatches * 10 + locationBoost));
}
function normalize({ id, title, company, url, location, type, salary, description, date, source, budgetMinimum, budgetMaximum, budgetCurrency, clientCountry, bidCount }) {
  if (!title || !url) return null;
  try { if (new URL(url).protocol !== "https:") return null; } catch { return null; }
  const summary = plainText(description).slice(0, 260);
  const text = [title, company, location, type, summary].join(" ");
  return {
    id: source.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + String(id || url).replace(/[^a-z0-9]+/gi, "-"),
    kind: classify(text, type),
    company: company || source,
    initial: (company || source).trim().slice(0, 1).toUpperCase(),
    title,
    location: location || "Not specified",
    type: type || "Not specified",
    pay: salary || "Not specified",
    budgetMinimum: budgetMinimum == null ? null : Number(budgetMinimum),
    budgetMaximum: budgetMaximum == null ? null : Number(budgetMaximum),
    budgetCurrency: budgetCurrency || "",
    clientCountry: clientCountry || "",
    bidCount: bidCount == null ? null : Number(bidCount),
    score: score(text),
    tags: uniqueSkills.filter((skill) => text.toLowerCase().includes(skill)).slice(0, 4),
    summary,
    url,
    source,
    date: date ? String(date) : ""
  };
}
const sourceStatus = [];
const listings = [];
async function source(name, request, mapItems) {
  try {
    const payload = await getJson(request);
    const items = mapItems(payload)
      .filter((item) => !hasUnsupportedLanguageRequirement([item.title, item.description].join(" ")))
      .map((item) => normalize({ ...item, source: name }))
      .filter(Boolean);
    listings.push(...items);
    sourceStatus.push({ name, status: "connected", count: items.length });
  } catch (error) {
    sourceStatus.push({ name, status: "temporarily_unavailable", count: 0, detail: String(error.message || error).slice(0, 100) });
  }
}
const fetchJobicy = () => source("Jobicy", "https://jobicy.com/api/jobs?count=100", (data) =>
  (data.jobs || []).map((job) => ({
    id: job.id, title: job.jobTitle, company: job.companyName, url: job.url,
    location: job.jobGeo, type: Array.isArray(job.jobType) ? job.jobType.join(", ") : "",
    salary: job.salaryMin && job.salaryMax ? `${job.salaryCurrency || ""} ${job.salaryMin}-${job.salaryMax} ${job.salaryPeriod || ""}`.trim() : "",
    description: job.jobExcerpt || job.jobDescription, date: job.pubDate
  })));
const expandedOnly = process.env.EXPANDED_ONLY === "true";
const jobicyOnly = process.env.JOBICY_ONLY === "true";
const fetchRemoteOk = () => source("Remote OK", "https://remoteok.com/api", (data) =>
  (Array.isArray(data) ? data.slice(1) : []).map((job) => ({
    id: job.id, title: job.position, company: job.company, url: job.url,
    location: job.location || "Remote", type: job.type || "",
    salary: job.salary_min && job.salary_max ? `${job.salary_min}-${job.salary_max}` : "",
    description: job.description, date: job.date
  })));
const fetchHimalayas = () => source("Himalayas", "https://himalayas.app/jobs/api?limit=20&offset=0", (data) =>
  (data.jobs || []).map((job) => ({
    id: job.guid, title: job.title, company: job.companyName, url: job.applicationLink,
    location: (job.locationRestrictions || []).join(", ") || "Remote",
    type: job.employmentType,
    salary: job.minSalary && job.maxSalary ? `${job.currency || ""} ${job.minSalary}-${job.maxSalary} / ${job.salaryPeriod || "year"}`.trim() : "",
    description: job.excerpt || job.description, date: job.pubDate
  })));
const fetchFreelancer = () => source("Freelancer.com", "https://www.freelancer.com/api/projects/0.1/projects/active/?limit=100&sort_field=time_updated&order=desc", (data) =>
  (data.result?.projects || []).map((project) => ({
    id: project.id,
    title: project.title,
    company: "Client · Freelancer.com",
    url: project.seo_url ? "https://www.freelancer.com/projects/" + project.seo_url : "",
    location: "Remote · international",
    type: "Freelance project",
    salary: project.budget?.minimum != null && project.budget?.maximum != null
      ? String(project.currency?.code || "") + " " + project.budget.minimum + "-" + project.budget.maximum : "",
    budgetMinimum: project.budget?.minimum,
    budgetMaximum: project.budget?.maximum,
    budgetCurrency: project.currency?.code,
    clientCountry: project.client?.country?.name || project.client?.country || project.location?.country?.name || project.location?.country || project.owner_country || "",
    bidCount: project.bid_stats?.bid_count,
    description: project.preview_description || project.description || "",
    date: project.submitdate ? new Date(project.submitdate * 1000).toISOString() : ""
  })));

if (expandedOnly || jobicyOnly) {
  const previous = await getJson("https://mane458957-maker.github.io/creative-hunter-ai/data/opportunities.json").catch(() => null);
  const refreshedSources = expandedOnly ? ["Jobicy", "Remote OK", "Himalayas", "Freelancer.com"] : ["Jobicy"];
  await Promise.all([fetchJobicy(), ...(expandedOnly ? [fetchRemoteOk(), fetchHimalayas(), fetchFreelancer()] : [])]);
  if (previous) {
    listings.push(...(previous.opportunities || []).filter((item) => !refreshedSources.includes(item.source)));
    sourceStatus.push(...(previous.sources || []).filter((item) => !refreshedSources.includes(item.name)));
  }
} else {
  await Promise.all([
    source("Remotive", "https://remotive.com/api/remote-jobs?limit=500", (data) =>
      (data.jobs || []).map((job) => ({
        id: job.id, title: job.title, company: job.company_name, url: job.url,
        location: job.candidate_required_location || "Remote", type: job.job_type,
        salary: job.salary, description: job.description, date: job.publication_date
      }))),
    source("Arbeitnow Europe", "https://www.arbeitnow.com/api/job-board-api", (data) =>
      (data.data || []).map((job) => ({
        id: job.slug, title: job.title, company: job.company_name, url: job.url,
        location: job.location, type: Array.isArray(job.job_types) ? job.job_types.join(", ") : "",
        description: job.description, date: job.created_at
      }))),
    fetchJobicy(),
    fetchRemoteOk(),
    fetchHimalayas(),
    fetchFreelancer()
  ]);
};
const unique = [...new Map(listings.map((item) => [item.url, item])).values()];
let eurRates = { EUR: 1 };
try {
  const rates = await getJson("https://api.frankfurter.dev/v2/rates?base=EUR");
  for (const entry of rates) eurRates[entry.quote] = entry.rate;
} catch {}
for (const item of unique.filter((listing) => listing.kind === "freelance")) {
  const rate = eurRates[item.budgetCurrency];
  if (rate && item.budgetMinimum != null) item.budgetMinimumEur = item.budgetMinimum / rate;
  if (rate && item.budgetMaximum != null) item.budgetMaximumEur = item.budgetMaximum / rate;
}
const relevant = unique.filter((item) => {
  if (hasUnsupportedLanguageRequirement([item.title, item.summary].join(" "))) return false;
  if (!employmentLocationAllowed(item)) return false;
  if (item.kind === "freelance") {
    const clientCountry = normalizeText(item.clientCountry);
    if (clientCountry.includes("india") || clientCountry === "in") return false;
    if (!Number.isFinite(item.budgetMinimumEur) || item.budgetMinimumEur < 400) return false;
  }
  const title = item.title.toLowerCase();
  const body = [item.title, item.type, item.summary, ...item.tags].join(" ").toLowerCase();
  const roleInTitle = targetTitles.some((term) => title.includes(term));
  const skillInTitle = uniqueSkills.some((skill) => title.includes(skill));
  const relevantSkills = uniqueSkills.filter((skill) => body.includes(skill)).length;
  const creativeRole = /video|film|motion|content creator|content producer|social media|web design|shopify|webflow|e-?commerce|visual|creative|graphic|seo/.test(title);
  if (item.kind === "job") return roleInTitle || skillInTitle || creativeRole || relevantSkills >= 2;
  return roleInTitle || skillInTitle || creativeRole || relevantSkills >= 1;
});
const capped = relevant.sort((a, b) => {
  if (a.kind === "freelance" && b.kind === "freelance") {
    return (b.budgetMaximumEur || b.budgetMinimumEur || 0) - (a.budgetMaximumEur || a.budgetMinimumEur || 0)
      || (a.bidCount ?? Number.MAX_SAFE_INTEGER) - (b.bidCount ?? Number.MAX_SAFE_INTEGER)
      || (b.date || "").localeCompare(a.date || "");
  }
  return (b.date || "").localeCompare(a.date || "");
}).slice(0, 300);
await fs.mkdir("_site/data", { recursive: true });
await fs.writeFile("_site/data/opportunities.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  sources: sourceStatus,
  opportunities: capped
}, null, 2));
console.log(`Published ${capped.length} matching opportunities from ${sourceStatus.filter((item) => item.status === "connected").length} live feeds.`);