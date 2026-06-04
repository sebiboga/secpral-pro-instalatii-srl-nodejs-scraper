# Topics — Repo GitHub About

Topics (etichetele) din secțiunea **About** a repo-ului pe GitHub se adaugă cu `gh repo edit --add-topic <nume>` sau manual în Settings → General → Topics.

## Topic-uri obligatorii

Fiecare scraper din ecosistemul peviitor.ro trebuie să aibă EXACT aceste două topicuri:

| Topic | Descriere |
|-------|-----------|
| `job-seeker-ro-spider` | Numele scraperului (User-Agent-ul folosit în toate request-urile HTTP) — obligatoriu |
| `peviitor-ro` | Platforma pentru care se face scraping-ul — obligatoriu |

**Nu adăuga alte topic-uri.** Doar aceste două sunt permise.

## Verificare

```bash
gh repo view sebiboga/secpral-pro-instalatii-srl-nodejs-scraper --json topics
```

## Reguli

- GitHub topics acceptă doar litere mici, cifre și **hyphens** (`-`). Underscore (`_`) nu e permis.
- Maxim 50 de caractere per topic.
