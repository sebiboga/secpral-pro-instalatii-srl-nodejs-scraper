import fetch from "node-fetch";
import Tesseract from "tesseract.js";
import sharp from "sharp";

const TIMEOUT = 60000;

async function preprocessImage(buffer) {
  return await sharp(Buffer.from(buffer))
    .resize(2000, null, { fit: 'inside', withoutEnlargement: true })
    .grayscale()
    .contrast(2.5)
    .sharpen({ sigma: 2.0 })
    .threshold(180)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export async function ocrImageFromUrl(imageUrl, jobIndex = null) {
  console.log(`Running OCR on: ${imageUrl}`);
  
  try {
    let imageBuffer;
    
    if (imageUrl.startsWith('http')) {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/png,image/jpeg",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://spishop.ro/"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      imageBuffer = await response.arrayBuffer();
    } else {
      throw new Error("Unsupported URL format");
    }
    
    const cleanedBuffer = await preprocessImage(imageBuffer);
    
    const prefix = jobIndex !== null ? `[Job ${jobIndex}] ` : '';
    
    const result = await Tesseract.recognize(cleanedBuffer, "ron+eng", {
      logger: m => {
        if (m.status === "recognizing text") {
          const progress = Math.round(m.progress * 100);
          const padding = " ".repeat(Math.max(0, 15 - prefix.length - 10));
          process.stdout.write(`\r${prefix}Progress: ${String(progress).padStart(3)}%${padding}`);
        }
      }
    });
    
    console.log("\nOCR completed.");
    
    let text = result.data.text.trim();
    
    text = text.replace(/[|]/g, 'I')
               .replace(/o_o/g, 'a')
               .replace(/_+/g, ' ')
               .replace(/\n{3,}/g, '\n')
               .replace(/\s+/g, ' ')
               .trim();
    
    if (!text || text.length < 10) {
      console.log("Warning: OCR returned very little text. Image might not contain readable text.");
    }
    
    return text;
  } catch (err) {
    console.error("OCR failed:", err.message);
    throw err;
  }
}

export async function ocrImageBuffer(buffer, lang = "ron+eng") {
  console.log(`Running OCR on image buffer (${buffer.length} bytes)`);
  
  try {
    const result = await Tesseract.recognize(buffer, lang, {
      logger: m => {
        if (m.status === "recognizing text") {
          const progress = Math.round(m.progress * 100);
          process.stdout.write(`\rOCR progress: ${progress}%`);
        }
      }
    });
    
    console.log("\nOCR completed.");
    
    return result.data.text.trim();
  } catch (err) {
    console.error("OCR failed:", err.message);
    throw err;
  }
}

export async function preprocessAndOcr(imageUrl) {
  console.log(`Running OCR with preprocessing on: ${imageUrl}`);
  
  const result = await Tesseract.recognize(imageUrl, "ron+eng", {
    logger: m => {
      if (m.status === "recognizing text") {
        process.stdout.write(`\rOCR progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });
  
  let text = result.data.text.trim();
  
  text = text.replace(/[|]/g, "I");
  text = text.replace(/0/, "O");
  text = text.replace(/\n{3,}/g, "\n\n");
  
  return text;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("ocr.js")) {
  const args = process.argv.slice(2);
  const url = args[0] || "https://spishop.ro/img/cms/cariere/test.png";
  
  console.log(`=== Testing OCR on: ${url} ===\n`);
  
  ocrImageFromUrl(url)
    .then(text => {
      console.log("\n--- OCR Result ---");
      console.log(text);
    })
    .catch(err => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}