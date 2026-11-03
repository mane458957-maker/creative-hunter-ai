import fs from "node:fs/promises";

const profile = JSON.parse(await fs.readFile("config/candidate-profile.json", "utf8"));
const allSkills = [
  ...profile.matching.employment.prioritySkills,
  ...profile.matching.freelance.prioritySkills,
  ...profile.skills
].map((value) => value.toLowerCase());
const uniqueSkills = [...new Set(allSkills)];
const targetTerms = [
  ...profile.matching.employment.targetTitles,
  ...profile.matching.freelance.targetServices,
  ...uniqueSkills
].map((value) => value.toLowerCase());
const terms = [...new Set(targetTerms)];
const headers = { "user-agent": "CreativeHunterAI/1.0 (public opportunity discovery dashboard)" };

async function getJson(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
function plainText(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
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
  return Math.min(97, Math.max(35, Math.round(45 + matched.length * 5 + titleMatches * 7)));
}
function normalize({ id, title, company, url, location, type, salary, description, date, source }) {
  if (!title || !url) return null;
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
    const items = mapItems(payload).map((item) => normalize({ ...item, source: name })).filter(Boolean);
    listings.push(...items);
    sourceStatus.push({ name, status: "connected", count: items.length });
  } catch (error) {
    sourceStatus.push({ name, status: "temporarily_unavailable", count: 0, detail: String(error.message || error).slice(0, 100) });
  }
}
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
    })))
]);
const unique = [...new Map(listings.map((item) => [item.url, item])).values()];
const relevant = unique.filter((item) => {
  const text = [item.title, item.company, item.location, item.type, item.summary, ...item.tags].join(" ").toLowerCase();
  return terms.some((term) => text.includes(term)) || /video|content|creative|design|social|shopify|webflow|digital|editor/.test(text);
});
const capped = relevant.sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 300);
await fs.mkdir("_site/data", { recursive: true });
await fs.writeFile("_site/data/opportunities.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  sources: sourceStatus,
  opportunities: capped
}, null, 2));
console.log(`Published ${capped.length} matching opportunities from ${sourceStatus.filter((item) => item.status === "connected").length} live feeds.`);
