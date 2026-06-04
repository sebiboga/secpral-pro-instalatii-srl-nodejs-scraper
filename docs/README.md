# job_seeker_ro_spider

**job_seeker_ro_spider** — scraper pentru job-urile SECPRAL PRO INSTALATII SRL din România.

Extrage anunțurile de pe [spishop.ro Careers](https://spishop.ro/ro/content/12-cariere) și le publică în [peviitor.ro](https://peviitor.ro) prin API-ul SOLR.

## Identificare

Toate request-urile HTTP folosesc User-Agent-ul:

```
job_seeker_ro_spider
```

## Ce face

1. **Validează compania** — interoghează API-ul public ANAF ([demoanaf.ro](https://demoanaf.ro)) după CIF-ul SECPRAL (10166281)
2. **Cross-validează cu Peviitor** — verifică existența companiei în API-ul Peviitor
3. **Scrape-uiește pagina de cariere** — extrage imaginile cu anunțuri de angajare de pe spishop.ro
4. **Procesează OCR** — extrage textul din imaginile de job folosind Tesseract.js + Sharp
5. **Normalizează titlurile** — folosește OpenCode AI pentru a corecta și standardiza titlurile job-urilor
6. **Stochează în SOLR** — upsert în `job` core (job-urile) și `company` core (datele companiei)

## Structură proiect

```
├── index.js           # Orchestrator principal
├── company.js         # Validare companie (ANAF + Peviitor + SOLR)
├── demoanaf.js        # CLI wrapper pentru src/anaf.js
├── src/anaf.js        # Modul ANAF API (search + company details)
├── ocr.js             # Procesare OCR (Tesseract.js + Sharp)
├── title-fixer.js     # Normalizare titluri cu OpenCode AI
├── solr.js            # Operații SOLR (query, upsert, delete, company)
├── docs/
│   └── index.html     # Site GitHub Pages
├── tests/
│   ├── unit/          # Teste unitare
│   ├── integration/   # Teste de integrare (ANAF + SOLR live)
│   └── e2e/           # Teste end-to-end
└── .github/workflows/
    ├── run-spishop.yml # Rulează zilnic la 2 AM (self-hosted pi400)
    ├── test.yml        # Teste automate la fiecare push/PR
    └── deploy.yml      # Deploy GitHub Pages
```

## API-uri folosite

| API | URL | Autentificare |
|---|---|---|
| spishop.ro | `https://spishop.ro/ro/content/12-cariere` | Public |
| ANAF (demoanaf) | `https://demoanaf.ro/api/...` | Public |
| Peviitor | `https://api.peviitor.ro/v1/company/` | Public |
| SOLR (job core) | `https://solr.peviitor.ro/solr/job` | `SOLR_AUTH` |
| SOLR (company core) | `https://solr.peviitor.ro/solr/company` | `SOLR_AUTH` |

## Testare

```bash
# Toate testele
npm test

# Doar unitare
npm run test:unit

# Doar integrare (necesită ANAF live, SOLR conditional)
npm run test:integration

# Doar E2E (API real spishop.ro + ANAF + SOLR)
npm run test:e2e
```

Testele SOLR folosesc `itIfSolr` — se auto-skip dacă variabila `SOLR_AUTH` nu e setată.
