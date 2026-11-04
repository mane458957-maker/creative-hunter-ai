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
async function getText(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
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
  const place = normalizeText(item.location || "");
  const workMode = normalizeText(item.type || "");
  if (/france|french|dubai|abu dhabi|sharjah|ajman|ras al khaimah|united arab emirates|uae|emirates/.test(place)) return true;
  if (/anywhere|worldwide|remote international|global remote/.test(place)) return true;
  if (!/remote|work from home|telecommut/.test(place + " " + workMode)) return false;
  if (/united states|remote.{0,5}(?:us|usa)|(?:us|usa).{0,5}remote|us only|canada|united kingdom|remote[ -]?uk|uk only|germany|japan|singapore|portugal|san francisco|new york|austin|berlin|tokyo/.test(place)) return false;
  return true;
}
function classify(text, explicitType = "") {
  const type = explicitType.toLowerCase();
  if (type.includes("freelance") || type.includes("contractor") || type.includes("project-based")) return "freelance";
  return "job";
}
function isRecentListing(item) {
  if (!item.date) return false;
  const raw = String(item.date).trim();
  const numeric = Number(raw);
  const timestamp = Number.isFinite(numeric) && numeric > 0
    ? (numeric > 1e12 ? numeric : numeric > 1e9 ? numeric * 1000 : NaN)
    : Date.parse(raw);
  if (!Number.isFinite(timestamp)) return false;
  const age = Date.now() - timestamp;
  return age >= 0 && age <= 30 * 24 * 60 * 60 * 1000;
}
function score(text) {
  const haystack = text.toLowerCase();
  const matched = uniqueSkills.filter((skill) => haystack.includes(skill));
  const titleMatches = profile.matching.employment.targetTitles.filter((title) => haystack.includes(title.toLowerCase())).length;
  const locationBoost = /remote|dubai|united arab emirates|france|europe|worldwide/.test(haystack) ? 5 : 0;
  return Math.min(97, Math.max(35, 55 + matched.length * 12 + titleMatches * 10 + locationBoost));
}
function normalize({ id, title, company, url, applicationUrl, location, type, salary, description, date, source, budgetMinimum, budgetMaximum, budgetCurrency, clientCountry, bidCount, kind }) {
  if (!title || !url) return null;
  try { if (new URL(url).protocol !== "https:") return null; } catch { return null; }
  let safeApplicationUrl = "";
  try { if (new URL(applicationUrl).protocol === "https:") safeApplicationUrl = applicationUrl; } catch {}
  const summary = plainText(description).slice(0, 260);
  const text = [title, company, location, type, summary].join(" ");
  return {
    id: source.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + String(id || url).replace(/[^a-z0-9]+/gi, "-"),
    kind: kind || classify(text, type),
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
    applicationUrl: safeApplicationUrl,
    source,
    date: date ? String(date) : ""
  };
}
const sourceStatus = [];
const listings = [];
async function source(name, request, mapItems) {
  try {
    const payload = Array.isArray(request) ? await Promise.all(request.map(getJson)) : await getJson(request);
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
async function fetchWeWorkRemotely() {
  const name = "We Work Remotely";
  try {
    const xml = await getText("https://weworkremotely.com/remote-jobs.rss");
    const blocks = xml.split("<item>").slice(1).map((block) => block.split("</item>")[0]);
    const field = (block, tag) => {
      const open = block.indexOf("<" + tag);
      if (open < 0) return "";
      const start = block.indexOf(">", open) + 1;
      const end = block.indexOf("</" + tag + ">", start);
      return end < 0 ? "" : plainText(block.slice(start, end));
    };
    const items = blocks.map((block) => {
      const rawTitle = field(block, "title");
      const parts = rawTitle.split(": ");
      const region = field(block, "region");
      const country = field(block, "country");
      return {
        id: field(block, "guid") || field(block, "link"),
        title: parts.length > 1 ? parts.slice(1).join(": ") : rawTitle,
        company: parts.length > 1 ? parts[0] : name,
        url: field(block, "link"),
        location: [region, country].filter(Boolean).join(" · ") || "Remote",
        type: field(block, "type") || "Remote",
        description: field(block, "description"),
        date: field(block, "pubDate")
      };
    }).filter((item) => !hasUnsupportedLanguageRequirement([item.title, item.description].join(" ")))
      .map((item) => normalize({ ...item, source: name })).filter(Boolean);
    listings.push(...items);
    sourceStatus.push({ name, status: "connected", count: items.length });
  } catch (error) {
    sourceStatus.push({ name, status: "temporarily_unavailable", count: 0, detail: String(error.message || error).slice(0, 100) });
  }
}
const freelancerOnly = process.env.FREELANCER_ONLY === "true";
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
const fetchActiveVacancies = () => {
  const searches = [
    { q: "designer", location: "France" }, { q: "video", location: "France" }, { q: "animation", location: "France" },
    { q: "designer", location: "United Arab Emirates" }, { q: "video", location: "United Arab Emirates" }, { q: "animation", location: "United Arab Emirates" },
    { q: "designer", remote: "remote" }, { q: "video", remote: "remote" },
    { q: "content creator", remote: "remote" }, { q: "social media", remote: "remote" }
  ].map((params) => "https://activevacancies.com/api/v1/jobs?" + new URLSearchParams({ ...params, limit: "50", sort: "recent" }));
  return source("Active Vacancies", searches, (payloads) => payloads.flatMap((data) => data.data || []).map((job) => ({
    id: job.id || job.slug, title: job.title, company: job.company?.name || "Employer",
    url: job.url, applicationUrl: job.applyUrl,
    location: job.location || "Not specified",
    type: "Employment · " + [job.employmentType, job.remoteStatus].filter(Boolean).join(" · "),
    salary: job.salary ? [job.salary.min, job.salary.max].filter((value) => value != null).join("–") + " " + (job.salary.currency || "") + " / " + (job.salary.interval || "").replace("yearly", "year").replace("monthly", "month") : "",
    description: job.description || job.department || job.team || "", date: job.postedAt,
    kind: "job"
  })));
};
async function fetch101Careers() {
  const endpoints = ["design", "marketing", "animation"].map((tag) => "https://101.careers/api/v1/jobs?" + new URLSearchParams({ tag, per_page: "100", page: "1" }));
  await source("101 Careers", endpoints, (payloads) => payloads.flatMap((data) => data.jobs || data.data || [])
    .filter((job) => {
      const origin = typeof job.source === "string" ? job.source : job.source?.name;
      return normalizeText(origin || "") === "101 careers";
    })
    .map((job) => ({
      id: job.id || job.guid || job.slug, title: job.title, company: job.company || job.companyName || "Employer",
      url: job.url || job.link, applicationUrl: job.applicationLink || job.applyUrl,
      location: job.location || job.country || "Remote",
      type: "Remote employment · " + (job.employmentType || "Remote"),
      salary: job.salary || "", description: job.description || job.excerpt || "",
      date: job.posted_at || job.postedAt || job.publishedAt || job.pubDate || job.date, kind: "job"
    })));
}
async function fetchAdzunaFrance() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    sourceStatus.push({ name: "Adzuna France", status: "credentials_required", count: 0, detail: "Add ADZUNA_APP_ID and ADZUNA_APP_KEY as private GitHub Actions secrets." });
    return;
  }
  const searches = ["designer", "video editor", "animation", "content creator", "social media", "web designer"].map((what) => {
    const params = new URLSearchParams({ app_id: appId, app_key: appKey, what, results_per_page: "50", "content-type": "application/json" });
    return "https://api.adzuna.com/v1/api/jobs/fr/search/1?" + params;
  });
  await source("Adzuna France", searches, (payloads) => payloads.flatMap((data) => data.results || []).map((job) => ({
    id: job.id, title: job.title, company: job.company?.display_name || "Employer", url: job.redirect_url,
    location: job.location?.display_name || "France",
    type: "Employment · " + [job.contract_time, job.contract_type].filter(Boolean).join(" · "),
    salary: job.salary_min != null && job.salary_max != null ? Math.round(job.salary_min) + "–" + Math.round(job.salary_max) + " EUR" + (job.salary_type ? " / " + job.salary_type : "") : "",
    description: job.description, date: job.created, kind: "job"
  })));
}
const fetchFreelancer = () => source("Freelancer.com", [
  "https://www.freelancer.com/api/projects/0.1/projects/active/?limit=100&sort_field=time_updated&order=desc",
  "https://www.freelancer.com/api/projects/0.1/projects/active/?limit=100&sort_field=time_updated&order=desc&query=animation"
], (payloads) =>
  [...new Map(payloads.flatMap((data) => data.result?.projects || []).map((project) => [project.id, project])).values()].map((project) => ({
    id: project.id,
    title: project.title,
    company: "Client · Freelancer.com",
    url: project.seo_url ? "https://www.freelancer.com/projects/" + project.seo_url : "",
    type: "Freelance project",
    salary: project.budget?.minimum != null && project.budget?.maximum != null
      ? String(project.currency?.code || "") + " " + project.budget.minimum + "-" + project.budget.maximum : "",
    budgetMinimum: project.budget?.minimum,
    budgetMaximum: project.budget?.maximum,
    budgetCurrency: project.currency?.code,
    clientCountry: project.client?.country?.name || project.client?.country?.code || (typeof project.client?.country === "string" ? project.client.country : "") || project.location?.country?.name || project.location?.country?.code || (typeof project.location?.country === "string" ? project.location.country : "") || "",
    bidCount: project.bid_stats?.bid_count,
    location: [project.location?.city, project.location?.country?.name || project.location?.country?.code || (typeof project.location?.country === "string" ? project.location.country : "")].filter(Boolean).join(" · ") || "Remote · international",
    description: project.preview_description || project.description || "",
    date: project.submitdate ? new Date(project.submitdate * 1000).toISOString() : ""
  })));

if (freelancerOnly) {
  const previous = await getJson("https://mane458957-maker.github.io/creative-hunter-ai/data/opportunities.json").catch(() => null);
  await fetchFreelancer();
  if (previous) {
    listings.push(...(previous.opportunities || []).filter((item) => item.source !== "Freelancer.com"));
    sourceStatus.push(...(previous.sources || []).filter((item) => item.name !== "Freelancer.com"));
  }
} else if (expandedOnly || jobicyOnly) {
  const previous = await getJson("https://mane458957-maker.github.io/creative-hunter-ai/data/opportunities.json").catch(() => null);
  const refreshedSources = expandedOnly ? ["Jobicy", "Remote OK", "Himalayas", "Freelancer.com", "We Work Remotely", "Active Vacancies", "101 Careers", "Adzuna France"] : ["Jobicy"];
  await Promise.all([fetchJobicy(), ...(expandedOnly ? [fetchRemoteOk(), fetchHimalayas(), fetchFreelancer(), fetchWeWorkRemotely(), fetchActiveVacancies(), fetch101Careers(), fetchAdzunaFrance()] : [])]);
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
    fetchActiveVacancies(),
    fetch101Careers(),
    fetchAdzunaFrance(),
    fetchRemoteOk(),
    fetchHimalayas(),
    fetchFreelancer(),
    fetchWeWorkRemotely()
  ]);
};
const unique = [...new Map(listings.map((item) => [item.applicationUrl || item.url, item])).values()].filter(isRecentListing);
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
    const hasBudget = item.budgetMinimum != null || item.budgetMaximum != null;
    if (hasBudget && (!Number.isFinite(item.budgetMinimumEur) || item.budgetMinimumEur < 200)) return false;
  }
  const title = item.title.toLowerCase();
  const body = [item.title, item.type, item.summary, ...item.tags].join(" ").toLowerCase();
  const roleInTitle = targetTitles.some((term) => title.includes(term));
  const skillInTitle = uniqueSkills.some((skill) => title.includes(skill));
  const relevantSkills = uniqueSkills.filter((skill) => body.includes(skill)).length;
  const creativeRole = /video|film|motion|content creator|content producer|social media|web design|shopify|webflow|e-?commerce|visual|creative|graphic|seo|animat|cartoon|character/.test(title);
  const clearlyUnrelatedRole = /software engineer|machine learning|\\bdeveloper\\b|\\bprogrammer\\b|product manager|audiovisual operations|\\bdata scientist\\b|\\bml manager\\b/.test(title);
  if (item.kind === "job") return !clearlyUnrelatedRole && (roleInTitle || skillInTitle || creativeRole || relevantSkills >= 2);
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