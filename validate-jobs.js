import fs from "fs";
import fetch from "node-fetch";

const SOLR_URL = "https://solr.peviitor.ro/solr/job/select";

async function main() {
  const solrAuth = process.env.SOLR_AUTH || "your-solr-credentials";
  const auth = Buffer.from(solrAuth).toString("base64");
  
  const jobsFile = process.argv[2] || "jobs.json";
  
  if (!fs.existsSync(jobsFile)) {
    console.error(`File not found: ${jobsFile}`);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(jobsFile, "utf-8"));
  const jobs = data.jobs || [];
  
  console.log(`\n=== Validating ${jobs.length} jobs from ${jobsFile} ===\n`);
  
  const results = {
    total: jobs.length,
    valid: 0,
    invalid: 0,
    errors: []
  };
  
  for (const job of jobs) {
    const errors = [];
    
    if (!job.url) errors.push("missing url");
    if (!job.title) errors.push("missing title");
    if (!job.company) errors.push("missing company");
    if (!job.cif) errors.push("missing cif");
    
    if (errors.length === 0) {
      results.valid++;
      console.log(`  ✅ ${job.title} - ${job.company}`);
    } else {
      results.invalid++;
      results.errors.push({ title: job.title, errors });
      console.log(`  ❌ ${job.title || "unknown"} - ${errors.join(", ")}`);
    }
  }
  
  console.log(`\n=== Results ===`);
  console.log(`Total: ${results.total}`);
  console.log(`Valid: ${results.valid}`);
  console.log(`Invalid: ${results.invalid}`);
  
  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync("tmp/validation-report.json", JSON.stringify(results, null, 2));
  console.log("Report saved to tmp/validation-report.json");
}

main().catch(err => {
  console.error("Validation failed:", err);
  process.exit(1);
});
