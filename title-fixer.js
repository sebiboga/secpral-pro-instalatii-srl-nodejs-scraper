import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export async function fixJobTitlesWithOpenCode(jobs) {
  console.log("\n=== Fixing job data with OpenCode AI ===\n");

  if (jobs.length === 0) {
    console.log("No jobs to process");
    return jobs;
  }

  const jobsText = jobs.map((j, i) => {
    const filename = j.url ? decodeURIComponent(j.url.split('/').pop()) : `job-${i + 1}`;
    return `
--- Job ${i + 1} ---
Image filename: ${filename}
URL: ${j.url}
OCR Text:
${j.description || "No description"}
`;
  }).join("\n");

  const prompt = `You are a Romanian job posting parser. Parse each job posting and return a JSON array.

IMPORTANT: Extract the job title from the OCR text ONLY. Look for the text right after "RECRUTEAZĂ" or "ANGAJEAZĂ" or "CAUTĂ". 

For EACH job:
1. title: The EXACT Romanian job title - MUST include ALL words like E-Commerce, Platformă, etc. If OCR says Administrator platformă E-Commerce then title MUST be Administrator Platformă E-Commerce (not just Administrator or Administrator Platformă)
2. location: Romanian city with diacritics (e.g. "București", "Cluj-Napoca", "Chiajna")
3. tags: Array of skills/education/experience keywords - lowercase, NO diacritics, max 20 items
4. workmode: "remote", "on-site", or "hybrid" (default to "on-site")
5. company: "SECPRAL PRO INSTALATII SRL"
6. cif: "10166281"
7. date: Current UTC ISO8601 format
8. status: "scraped"
9. url: Use the provided URL

Example output:
[{"title": "Administrator Platformă E-Commerce", "company": "SECPRAL PRO INSTALATII SRL", "cif": "10166281", "location": "Cluj-Napoca", "tags": ["prestashop", "php", "mysql", "e-commerce", "html", "css"], "workmode": "hybrid", "date": "${new Date().toISOString()}", "status": "scraped", "url": "..."}]

Jobs to parse:${jobsText}

Return ONLY valid JSON array, no explanations:`;

  const tempFile = join(tmpdir(), `opencode-prompt-${Date.now()}.txt`);
  writeFileSync(tempFile, prompt);

  try {
    console.log("Calling OpenCode AI...");
    const promptContent = readFileSync(tempFile, 'utf-8');
    console.log("=== OPENCODE PROMPT START ===");
    console.log(promptContent);
    console.log("=== OPENCODE PROMPT END ===");
    
    const result = execSync(`echo '${promptContent.replace(/'/g, "'\\''")}' | opencode run --format json`, {
      encoding: "utf-8",
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log("=== OPENCODE RESPONSE START ===");
    console.log(result);
    console.log("=== OPENCODE RESPONSE END ===");
    
    const content = result.trim();
    
    const lines = content.split('\n').filter(l => l.trim());
    let responseText = '';
    
    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        if (event.type === 'text' && event.part?.text) {
          responseText += event.part.text;
        }
      } catch (e) {}
    }
    
    if (!responseText) {
      responseText = content;
    }
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const fixedJobs = JSON.parse(jsonMatch[0]);
        
        for (let i = 0; i < jobs.length && i < fixedJobs.length; i++) {
          const fixed = fixedJobs[i];
          if (fixed) {
            console.log(`  Job ${i + 1}: ${fixed.title} (${fixed.location || "N/A"})`);
            Object.assign(jobs[i], fixed);
            jobs[i].url = jobs[i].url || fixed.url;
            jobs[i].status = "scraped";
            jobs[i].date = jobs[i].date || new Date().toISOString();
          }
        }
        console.log("\n✅ Job data fixed with OpenCode AI");
      } catch (parseError) {
        console.log("JSON parse error:", parseError.message);
        console.log("Trying response:", responseText.substring(0, 500));
      }
    } else {
      console.log("Could not find JSON array in OpenCode response");
      console.log("Response text:", responseText.substring(0, 500));
    }
  } catch (error) {
    console.log("OpenCode error:", error.message);
    console.log("Keeping original job data");
  } finally {
    try { unlinkSync(tempFile); } catch (e) {}
  }

  return jobs;
}
