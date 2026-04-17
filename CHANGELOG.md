# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-17

### Added
- Initial release
- OCR-based job extraction from spishop.ro images
- Company validation via ANAF API
- Company Core registration in SOLR
- AI-powered title normalization (OpenCode)
- GitHub Actions workflows (scraper + tests)
- Full test coverage (unit, integration, e2e)
- Self-hosted runner on Raspberry Pi 400
- MIT License
- README.md with full documentation

### Features
- Scheduled daily scraping at 2 AM
- Fallback job list when careers page unavailable
- Proper Romanian diacritics handling
- Tags extraction from OCR text
- Location detection (Chiajna, Cluj-Napoca, etc.)
- Work mode detection (remote, on-site, hybrid)