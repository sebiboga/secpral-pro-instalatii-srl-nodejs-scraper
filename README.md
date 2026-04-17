# SECPRAL PRO INSTALATII SRL - Job Scraper

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-24.x-green.svg)
![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-orange.svg)

Automated job scraper for spishop.ro that extracts job postings via OCR and pushes them to peviitor.ro SOLR index.

## Features

- 🚀 Automated daily scraping at 2 AM
- 📸 OCR-based job extraction from images
- 🤖 AI-powered title normalization using OpenCode
- ✅ Company validation via ANAF API
- 🏢 Automatic company core registration
- 📊 Full test coverage (unit, integration, e2e)
- 🔄 Self-hosted GitHub Actions runner on Raspberry Pi 400

## Tech Stack

- **Node.js** 24.x
- **Tesseract.js** - OCR
- **Sharp** - Image preprocessing
- **Cheerio** - HTML parsing
- **OpenCode AI** - Job title extraction
- **GitHub Actions** - CI/CD
- **Raspberry Pi 400** - Self-hosted runner

## Prerequisites

- Node.js 24.x
- npm
- Raspberry Pi 400 (for self-hosted runner)
- SOLR credentials (contact peviitor.ro)

## Installation

```bash
git clone https://github.com/sebiboga/secpral-pro-instalatii-srl-nodejs-scraper.git
cd secpral-pro-instalatii-srl-nodejs-scraper
npm install
```

## Configuration

Create `env.local` file:

```
SOLR_AUTH=solr:your_password_here
```

## Usage

```bash
# Run scraper locally
npm run scrape

# Run with test mode
npm run scrape -- --test

# Run tests
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## GitHub Actions

The scraper runs automatically via GitHub Actions:

- **Scheduled**: Daily at 2 AM
- **Manual**: Workflow dispatch

### Self-Hosted Runner

This project uses a self-hosted Raspberry Pi 400 runner to avoid IP blocking from spishop.ro.

## Job Model Schema

| Field | Type | Description |
|-------|------|-------------|
| url | string | Job posting URL |
| title | string | Job title with Romanian diacritics |
| company | string | Company name |
| cif | string | Fiscal identification number |
| location | array | City/cities |
| description | string | Job description (OCR text) |
| workmode | string | remote/on-site/hybrid |
| date | date | UTC ISO8601 scrape date |
| status | string | scraped/tested/verified/published |
| tags | array | Skills/requirements |

## Project Structure

```
.
├── index.js          # Main scraper
├── company.js        # Company validation & core registration
├── solr.js           # SOLR operations
├── ocr.js            # OCR processing
├── title-fixer.js    # OpenCode AI title extraction
├── demoanaf.js       # ANAF API client
├── package.json
├── .github/
│   └── workflows/
│       ├── run-spishop.yml  # Main scraper workflow
│       └── test.yml         # Test workflow
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## License

MIT License - Copyright (c) 2026 BOGA SEBASTIAN-NICOLAE

## Author

**Boga Sebastian-Nicolae**

- GitHub: [@sebiboga](https://github.com/sebiboga)
- LinkedIn: [sebastianboga](https://linkedin.com/in/sebastianboga)
- Website: https://peviitor.ro

## Credits

- [peviitor.ro](https://peviitor.ro) - Job search platform
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [OpenCode AI](https://opencode.ai) - AI-powered text processing