# Instructions

## Project Purpose

This scraper extracts job listings from spishop.ro careers page and imports them to peviitor.ro using OCR.

Target: https://spishop.ro/ro/content/12-cariere

## Model Schemas

The job and company models are defined in:
- `job-model.md` - Job model schema
- `company-model.md` - Company model schema

## Important

These models are **dynamic** and can change over time. They are based on the official Peviitor Core schemas which may be updated.

## How to Keep Models Updated

When working on this scraper:

1. **Check for updates** in the Peviitor Core repository:
   - Repository: https://github.com/peviitor-ro/peviitor_core
   - Main file: README.md (contains Job and Company model schemas)

2. **When to update**:
   - Before starting new development work
   - If field requirements or validations have changed
   - If new fields have been added

3. **How to update**:
   - Fetch the latest README.md from peviitor_core main branch
   - Compare with current job-model.md and company-model.md
   - Update local files if there are differences
   - Update index.js mapping logic if field requirements changed

## Technologies

- **Node.js & JavaScript** - For scraping and data extraction
- **Apache SOLR** - For data storage and indexing
- **Tesseract.js** - OCR engine for extracting text from job images
- **Sharp** - Image preprocessing for better OCR accuracy
- **OpenCode + Big Pickle** - For development and AI-powered title extraction

## Workflow Steps

1. **Start with brand** - We know the company (SECPRAL PRO INSTALATII SRL)
2. **Search in DemoANAF** - Find company by brand, get CIF from search results
3. **Get company details from ANAF** - Using CIF, fetch full company data from ANAF
4. **Validate with Peviitor** - Verify company exists in Peviitor, get group/brand info
5. **Check existing jobs in SOLR** - Query SOLR by CIF to see what jobs already exist
6. **Check company status** - If ANAF status = "inactive" → STOP and do not scrape
7. **Scrape careers page** - Fetch spishop.ro careers page HTML
8. **Extract job images** - Parse HTML for job announcement images
9. **OCR processing** - Run Tesseract OCR on each image to extract text
10. **Fix job titles** - Use OpenCode AI to normalize extracted titles
11. **Upsert to SOLR** - Import/update jobs in SOLR

## Running the Scraper

```bash
# Set environment variables
export SOLR_AUTH=your-solr-credentials

# Run the full scraper workflow (single command)
node index.js
```

## Full Workflow (automatic)

When running `node index.js`, the following steps happen automatically:

1. **Validate company via ANAF** - Check company exists and is active
2. **Add company to Company Core** - Register in SOLR company core
3. **Scrape careers page** - Fetch HTML from spishop.ro careers page
4. **Parse job images** - Find all job announcement images
5. **OCR images** - Extract text from each image via Tesseract.js
6. **Fix titles** - Use OpenCode AI to normalize job titles
7. **Upsert to SOLR** - Add/update jobs (SOLR handles duplicates)
8. **Show Summary** - Log job counts

## Workflow Flowchart

```
index.js
    │
    ▼
company.js (validate company)
    ├── ANAF API ──► get company name + CIF
    ├── Peviitor API ──► validate company model
    └── SOLR ──► check existing jobs count
    │
    ▼ (if active)
scrape spishop.ro careers page
    │
    ▼
Parse job images from HTML
    │
    ▼
OCR processing (Tesseract.js + Sharp)
    │
    ▼
title-fixer.js (OpenCode AI normalization)
    │
    ▼
upsertJobs() - SOLR handles duplicate by URL
```

## File Responsibilities

| File | Role |
|------|------|
| `index.js` | Main entry point - full workflow: validate → scrape → OCR → fix titles → upsert |
| `company.js` | Validates company via ANAF + Peviitor, checks if company is active/inactive |
| `solr.js` | SOLR operations module - query, delete, upsert jobs + standalone commands |
| `src/anaf.js` | ANAF API core module - searchCompany(brand) and getCompanyFromANAF(cif) |
| `demoanaf.js` | CLI entry point for ANAF module (thin wrapper around src/anaf.js) |
| `ocr.js` | OCR processing module - extract text from images via Tesseract.js |

## API Endpoints

- **DemoANAF Search**: `https://demoanaf.ro/api/search?q=BRAND` - Search companies by name/brand
- **DemoANAF Company**: `https://demoanaf.ro/api/company/:cui` - Get company details by CIF
- **Peviitor API**: `https://api.peviitor.ro/v1/company/`
- **Solr**: `https://solr.peviitor.ro/solr/job` (auth: via `SOLR_AUTH` environment variable)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SOLR_AUTH` | SOLR credentials in format `user:password` |

## Standalone Commands

```bash
# Verify jobs in SOLR by CIF
node solr.js 10166281

# Extract existing jobs from SOLR by CIF
node solr.js extract 10166281

# Query company in SOLR
node solr.js company <search_term>

# Get company details from ANAF by CIF
node demoanaf.js 10166281

# Search companies in ANAF by brand
node demoanaf.js search SECPRAL
```

## Testing

This project requires multiple levels of testing:

1. **Unit Tests** - Test individual modules in isolation
2. **Integration Tests** - Test API interactions (ANAF, SOLR)
3. **E2E Tests** - Test full workflow in `/tests/e2e` folder

Run tests:
```bash
npm test
```

## Temporary Files

All temporary/scratch files must be placed in `tmp/` inside the project root (never outside the project). The `tmp/` directory is in `.gitignore` and will not be committed.
