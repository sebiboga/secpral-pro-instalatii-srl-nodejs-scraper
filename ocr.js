import fetch from "node-fetch";
import Tesseract from "tesseract.js";

const TIMEOUT = 60000;

export async function ocrImageFromUrl(imageUrl) {
  console.log(`Running OCR on: ${imageUrl}`);
  
  try {
    let imageBuffer;
    
    if (imageUrl.startsWith('http')) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      imageBuffer = await response.arrayBuffer();
    } else {
      throw new Error("Unsupported URL format");
    }
    
    const result = await Tesseract.recognize(Buffer.from(imageBuffer), "ron+eng", {
      logger: m => {
        if (m.status === "recognizing text") {
          const progress = Math.round(m.progress * 100);
          process.stdout.write(`\rOCR progress: ${progress}%`);
        }
      }
    });
    
    console.log("\nOCR completed.");
    
    const text = result.data.text.trim();
    
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