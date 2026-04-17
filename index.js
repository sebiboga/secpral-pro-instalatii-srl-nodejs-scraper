import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath } from "url";
import { load } from "cheerio";
import { validateAndGetCompany, addCompanyToCompanyCore } from "./company.js";
import { querySOLR, upsertJobs } from "./solr.js";
import { ocrImageFromUrl } from "./ocr.js";

const COMPANY_CIF = "10166281";
const TIMEOUT = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

const CAREERS_PAGE = "https://spishop.ro/ro/content/12-cariere";
const BASE_URL = "https://spishop.ro";

let COMPANY_NAME = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const JOB_IMAGES = [
  {
    url: "https://spishop.ro/img/cms/cariere/feb-2026/anunturi%20angajare%20Administrator%20platform%C4%83%20E-Commerce%20feb%202026.png",
    title: "Administrator Platforma E-Commerce"
  },
  {
    url: "https://spishop.ro/img/cms/cariere/martie-2026/ASISTENT_DIRECTOR_TEHNIC.jpeg",
    title: "Asistent Director Tehnic"
  },
  {
    url: "https://spishop.ro/img/cms/cariere/martie-2026/ECONOMIST.jpeg",
    title: "Economist"
  },
  {
    url: "https://spishop.ro/img/cms/cariere/martie-2026/SOFER-CHIAJNA.jpeg",
    title: "Sofer Chiajna"
  },
  {
    url: "https://spishop.ro/img/cms/cariere/martie-2026/GESTIONAR-CHIAJNA.jpeg",
    title: "Gestionar Chiajna"
  }
];

async function fetchCareersPage() {
  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Retry ${attempt}/${MAX_RETRIES} for careers page...`);
        await sleep(RETRY_DELAY * attempt);
      }
      
      const res = await fetch(CAREERS_PAGE, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,ro;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Cache-Control": "max-age=0"
        }
      });
      
      if (!res.ok) {
        lastError = new Error(`Fetch error: ${res.status}`);
        console.log(`Attempt ${attempt} failed: ${res.status}`);
        continue;
      }
      
      return await res.text();
    } catch (err) {
      lastError = err;
      console.log(`Attempt ${attempt} error: ${err.message}`);
    }
  }
  
  throw lastError || new Error("Failed to fetch careers page after retries");
}

function parseJobsFromHtml(html) {
  const $ = load(html);
  const jobs = [];
  
  $('img[src*="cariere"]').each((i, el) => {
    const $el = $(el);
    const src = $el.attr('src');
    const alt = $el.attr('alt');
    
    if (src && src.includes('cariere')) {
      const fullUrl = src.startsWith('http') ? src : new URL(src, BASE_URL).href;
      const title = alt || src.split('/').pop()?.split('.')[0] || `Job ${i + 1}`;
      
      if (!jobs.find(j => j.imageUrl === fullUrl)) {
        jobs.push({
          url: fullUrl,
          title: title,
          imageUrl: fullUrl
        });
      }
    }
  });
  
  console.log(`Found ${jobs.length} job images from HTML`);
  return jobs;
}

async function scrapeJobs(testOnlyOnePage = false) {
  let htmlJobs = [];
  
  try {
    console.log("Fetching careers page to verify structure...");
    const html = await fetchCareersPage();
    htmlJobs = parseJobsFromHtml(html);
  } catch (err) {
    console.log(`Warning: Could not fetch careers page: ${err.message}`);
    console.log("Using fallback job list...");
  }
  
  const jobsToProcess = htmlJobs.length > 0 ? htmlJobs : JOB_IMAGES;
  console.log(`Processing ${jobsToProcess.length} jobs...`);
  
  const processedJobs = [];
  
  for (let i = 0; i < jobsToProcess.length; i++) {
    const job = jobsToProcess[i];
    console.log(`[${i + 1}/${jobsToProcess.length}] Processing: ${job.title}`);
    console.log(`  URL: ${job.imageUrl || job.url}`);
    
    try {
      let imageUrl = job.imageUrl || job.url;
      if (!imageUrl.startsWith('http')) {
        imageUrl = new URL(imageUrl, BASE_URL).href;
      }
      const ocrText = await ocrImageFromUrl(imageUrl, i + 1);
      
      processedJobs.push({
        url: imageUrl,
        title: job.title,
        description: ocrText,
        rawOcr: ocrText
      });
      
      console.log(`  OCR length: ${ocrText.length} chars`);
      await sleep(500);
    } catch (err) {
      console.log(`  Error processing job: ${err.message}`);
      processedJobs.push({
        url: job.imageUrl || job.url,
        title: job.title,
        description: "",
        error: err.message
      });
    }
  }
  
  return processedJobs;
}

function cleanOcrLine(line) {
  return line
    .replace(/[|]/g, 'I')
    .replace(/o_o/g, 'a')
    .replace(/0(?=[a-zA-Z])/g, 'O')
    .replace(/_+/g, ' ')
    .replace(/[^\w\săâîșțĂÂÎȘȚ-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitleFromOcr(ocrText, fallbackTitle) {
  const rawLines = ocrText.split('\n').slice(0, 20);
  
  const titleEndPatterns = [
    /^in\s+(cluj|bucurești|chiajna|timișoara|iași|brașov)/i,
    /^in\s+\w/i,
    /^(de ce|despre|candidat|principalele|responsabilități|ce îți)/i,
    /^(•|\*|©|\+)/,
    /^[\[\(][^\]]{0,3}[\]\)]$/,
    /^(nn?|ss?|ii?|aa?|mm?)$/i
  ];
  
  let allWords = [];
  for (const rawLine of rawLines) {
    if (titleEndPatterns.some(p => p.test(rawLine.trim()))) break;
    
    const cleaned = cleanOcrLine(rawLine);
    if (cleaned.length > 1) {
      allWords.push(...cleaned.split(/\s+/).filter(w => w.length > 0));
    }
  }
  
  let title = fallbackTitle;
  
  if (allWords.length > 0) {
    const cleaned = allWords.join(' ');
    if (cleaned.length > 5) {
      title = cleaned;
    }
  }
  
  return title;
}

function extractJobInfoFromOcr(ocrText, fallbackTitle) {
  let title = extractTitleFromOcr(ocrText, fallbackTitle);
  
  let location = "Cluj-Napoca";
  let remote = false;
  
  const locationPatterns = [
    { pattern: /Chiajna/i, loc: "Chiajna" },
    { pattern: /București/i, loc: "București" },
    { pattern: /Bucuresti/i, loc: "București" },
    { pattern: /Cluj[- ]Napoca/i, loc: "Cluj-Napoca" },
    { pattern: /^Cluj$/i, loc: "Cluj-Napoca" },
    { pattern: /Timișoara/i, loc: "Timișoara" },
    { pattern: /Iași/i, loc: "Iași" },
    { pattern: /Brașov/i, loc: "Brașov" }
  ];
  
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    for (const { pattern, loc } of locationPatterns) {
      if (pattern.test(line)) {
        location = loc;
        break;
      }
    }
  }
  
  if (/remote|la distanță|telefon|home office|hybid/i.test(ocrText)) {
    remote = true;
  }
  
  return { title, location, remote, description: ocrText };
}

function mapToJobModel(rawJob, cif, companyName = COMPANY_NAME) {
  const jobInfo = extractJobInfoFromOcr(rawJob.description || "", rawJob.title || "Unknown");
  
  const now = new Date().toISOString();
  
  const job = {
    url: rawJob.url,
    title: jobInfo.title,
    company: companyName,
    cif: cif,
    location: jobInfo.location ? [jobInfo.location] : undefined,
    description: jobInfo.description,
    workmode: jobInfo.remote ? "remote" : "on-site",
    date: now,
    status: "scraped"
  };
  
  Object.keys(job).forEach((k) => job[k] === undefined && delete job[k]);
  
  return job;
}

async function main() {
  const testOnlyOnePage = process.argv.includes("--test");
  
  try {
    console.log("=== Step 1: Validate company via ANAF ===");
    const { company, cif, status, existingJobsCount } = await validateAndGetCompany();
    COMPANY_NAME = company;
    
    if (status === "inactive") {
      console.log("Company is INACTIVE. Stopping.");
      return;
    }
    
    console.log("\n=== Step 2: Add company to Company Core ===");
    await addCompanyToCompanyCore(company, cif, null, CAREERS_PAGE);
    
    console.log("\n=== Step 3: Scrape jobs from Spishop ===");
    const rawJobs = await scrapeJobs(testOnlyOnePage);
    const scrapedCount = rawJobs.length;
    console.log(`📊 Jobs scraped: ${scrapedCount}`);
    
    if (scrapedCount === 0) {
      console.log("No jobs found or all jobs failed OCR.");
    }
    
    const jobs = rawJobs.map(job => mapToJobModel(job, cif));
    
    const payload = {
      source: "spishop.ro",
      scrapedAt: new Date().toISOString(),
      company: COMPANY_NAME,
      cif: cif,
      jobs
    };
    
    fs.writeFileSync("jobs.json", JSON.stringify(payload, null, 2), "utf-8");
    console.log("Saved jobs.json");
    
    const validJobs = jobs.filter(j => j.description && j.description.length > 10);
    console.log(`📊 Jobs with valid description: ${validJobs.length}`);
    
    if (validJobs.length > 0) {
      console.log("\n=== Step 4: Upsert jobs to SOLR ===");
      await upsertJobs(validJobs);
    }
    
    const finalResult = await querySOLR(cif);
    console.log(`\n📊 === SUMMARY ===`);
    console.log(`📊 Jobs existing in SOLR before scrape: ${existingJobsCount}`);
    console.log(`📊 Jobs scraped from website: ${scrapedCount}`);
    console.log(`📊 Jobs with valid description: ${validJobs.length}`);
    console.log(`📊 Jobs in SOLR after scrape: ${finalResult.numFound}`);
    console.log(`====================`);
    
    console.log("\n=== DONE ===");
    console.log("Scraper completed successfully!");
    
  } catch (err) {
    console.error("Scraper failed:", err);
    process.exit(1);
  }
}

export { parseJobsFromHtml, mapToJobModel, extractJobInfoFromOcr };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}