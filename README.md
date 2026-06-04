# SECPRAL PRO INSTALATII SRL — Job Scraper

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-24.x-green.svg)
![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-orange.svg)

**job_seeker_ro_spider** — web scraper pentru a aduce locurile de munca de la **SECPRAL PRO INSTALATII SRL (spishop.ro)** in platforma [peviitor.ro](https://peviitor.ro).

## Despre

Acest scraper extrage zilnic anunturile de angajare de pe [spishop.ro](https://spishop.ro/ro/content/12-cariere) folosind OCR (Tesseract.js) pentru a citi textul din imaginile cu anunturi si le publica in platforma peviitor.ro prin API-ul SOLR.

## Cum functioneaza

| Pas | Actiune | API/Sursa |
|-----|---------|-----------|
| 1 | Valideaza compania in ANAF | [demoanaf.ro](https://demoanaf.ro) |
| 2 | Cross-valideaza in Peviitor | [api.peviitor.ro](https://api.peviitor.ro) |
| 3 | Extrage pagina de cariere | [spishop.ro](https://spishop.ro) |
| 4 | Parseaza imaginile cu joburi | Cheerio (HTML) |
| 5 | OCR pe fiecare imagine | Tesseract.js + Sharp |
| 6 | Normalizeaza titlurile | OpenCode AI |
| 7 | Trimite la SOLR | [solr.peviitor.ro](https://solr.peviitor.ro) |

## Tech Stack

- **Node.js 24** — Runtime
- **Tesseract.js** — OCR (Optical Character Recognition)
- **Sharp** — Image preprocessing
- **Cheerio** — HTML parsing
- **OpenCode AI** — AI-powered title extraction
- **GitHub Actions** — CI/CD + self-hosted runner
- **Raspberry Pi 400** — Self-hosted runner hardware

## Instalare

```bash
git clone https://github.com/sebiboga/secpral-pro-instalatii-srl-nodejs-scraper.git
cd secpral-pro-instalatii-srl-nodejs-scraper
npm install
```

## Configurare

Creeaza fisierul `.env.local`:

```
SOLR_AUTH=solr:parola_ta
```

## Utilizare

```bash
# Ruleaza scraperul
npm run scrape

# Ruleaza testele
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## GitHub Actions

| Workflow | Schedule | Runner |
|----------|----------|--------|
| **Scrape** | Zilnic la 2 AM | `[self-hosted, pi400]` |
| **Tests** | La fiecare push/PR | `ubuntu-latest` |
| **Pages** | La fiecare push pe main | `ubuntu-latest` |

## Structura proiect

```
.
├── index.js              # Orchestrator principal
├── company.js            # Validare companie (ANAF + Peviitor + SOLR)
├── demoanaf.js           # CLI wrapper pentru src/anaf.js
├── src/anaf.js           # Modul ANAF API (search + company)
├── ocr.js                # Procesare OCR (Tesseract.js + Sharp)
├── title-fixer.js        # Normalizare titluri cu OpenCode AI
├── solr.js               # Operatii SOLR
├── package.json
├── .github/workflows/
│   ├── run-spishop.yml   # Scraper principal (self-hosted)
│   ├── test.yml          # Teste automate
│   └── deploy.yml        # GitHub Pages deploy
├── tests/
│   ├── unit/             # Teste unitare
│   ├── integration/      # Teste de integrare
│   └── e2e/              # Teste end-to-end
└── docs/
    └── index.html        # GitHub Pages site
```

## License

MIT License — Copyright (c) 2026 BOGA SEBASTIAN-NICOLAE

## Autor

**Boga Sebastian-Nicolae**
- GitHub: [@sebiboga](https://github.com/sebiboga)
- LinkedIn: [sebastianboga](https://linkedin.com/in/sebastianboga)
- Website: [peviitor.ro](https://peviitor.ro)

## Credite

- [peviitor.ro](https://peviitor.ro) — Platforma de cautare locuri de munca
- [Tesseract.js](https://github.com/naptha/tesseract.js) — Engine OCR
- [OpenCode AI](https://opencode.ai) — Procesare text cu AI
- [spishop.ro](https://spishop.ro) — Sursa datelor
