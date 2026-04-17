import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function fixJobTitlesWithOpenCode(jobs) {
  console.log("\n=== Fixing job titles with OpenCode AI ===\n");
  
  const prompt = `You are a Romanian job title expert. I have extracted text from job posting images using OCR, but the titles have OCR noise and artifacts.

For each job, I will provide:
- The OCR text from the job posting
- The current (noisy) title

Your task is to return ONLY a valid JSON array where each element is an object with the corrected "title" field.

Rules:
1. Return valid JSON only, no explanations
2. Fix Romanian job titles by removing OCR artifacts like "N", "n", "nn", "I-", random letters
3. Keep legitimate parts of the title
4. Use proper Romanian capitalization
5. Examples of fixes:
   - "Asistent Director Tehnic Iii Pe" -> "Asistent Director Tehnic"
   - "Sofer Autoutilitara Nn" -> "Sofer Autoutilitara"
   - "Gestionar Stivuitorist I- Sa" -> "Gestionar Stivuitorist"
   - "Administrator Platforma E-Commerce" -> "Administrator Platforma E-Commerce"

Jobs to fix:
${jobs.map((j, i) => `Job ${i + 1}:
Current title: "${j.title}"
First 200 chars of OCR text:
${j.description?.substring(0, 200) || "No description"}`).join("\n\n")}

Return JSON array:`;

  const tempPromptFile = path.join(__dirname, "temp_opencode_prompt.txt");
  const tempOutputFile = path.join(__dirname, "temp_opencode_output.txt");
  
  try {
    fs.writeFileSync(tempPromptFile, prompt, "utf-8");
    
    const opencodePath = "/home/runner/.opencode/bin/opencode";
    
    const cmd = `cd ${__dirname} && ${opencodePath} --output ${tempOutputFile} --no-input "Fix the Romanian job titles in the attached file and output ONLY valid JSON"`;
    
    console.log("Calling OpenCode AI to fix titles...");
    
    const output = execSync(cmd, {
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 1024 * 1024
    });
    
    if (fs.existsSync(tempOutputFile)) {
      const result = fs.readFileSync(tempOutputFile, "utf-8");
      const fixedTitles = JSON.parse(result);
      
      if (Array.isArray(fixedTitles)) {
        for (let i = 0; i < jobs.length && i < fixedTitles.length; i++) {
          if (fixedTitles[i]?.title) {
            console.log(`  ${jobs[i].title} -> ${fixedTitles[i].title}`);
            jobs[i].title = fixedTitles[i].title;
          }
        }
        console.log("\n✅ Job titles fixed with OpenCode AI");
      }
    }
  } catch (error) {
    console.log("OpenCode AI failed, keeping original titles");
    console.log(`Error: ${error.message}`);
  } finally {
    if (fs.existsSync(tempPromptFile)) fs.unlinkSync(tempPromptFile);
    if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile);
  }
  
  return jobs;
}
