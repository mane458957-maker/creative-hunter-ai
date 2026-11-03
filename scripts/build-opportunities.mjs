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
function normalize({ id, title, company, url, location, type, salary, description, date, source }) {
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
  const title = item.title.toLowerCase();
  const body = [item.title, item.type, item.summary, ...item.tags].join(" ").toLowerCase();
  const roleInTitle = targetTitles.some((term) => title.includes(term));
  const skillInTitle = uniqueSkills.some((skill) => title.includes(skill));
  const relevantSkills = uniqueSkills.filter((skill) => body.includes(skill)).length;
  return roleInTitle || skillInTitle || relevantSkills >= 2;
});
const capped = relevant.sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 300);
await fs.mkdir("_site/data", { recursive: true });
await fs.writeFile("_site/data/opportunities.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  sources: sourceStatus,
  opportunities: capped
}, null, 2));
console.log(`Published ${capped.length} matching opportunities from ${sourceStatus.filter((item) => item.status === "connected").length} live feeds.`);
