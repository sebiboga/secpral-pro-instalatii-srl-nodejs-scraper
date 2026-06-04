# Robots.txt Analysis — spishop.ro

Sursa: https://spishop.ro/robots.txt

## Reguli

Deoarece spishop.ro nu are un fișier `robots.txt` explicit, aplicăm regulile implicite:

```
User-agent: *
Disallow:
```

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/` | ✅ Da | Pagina principală |
| `/ro/content/12-cariere` | ✅ Da | Pagina de cariere unde sunt listate job-urile ca imagini |
| `/img/cms/cariere/*` | ✅ Da | Imaginile cu anunțurile de angajare |

## Recomandare

- Scraperul face o singură cerere per imagine cu delay de 500ms — comportament rezonabil, nu agresiv
- Toate request-urile folosesc un User-Agent standard de browser
- Fiind un site de comerț electronic, nu anticipăm blocări, dar folosim un self-hosted runner pe RPi 400 pentru a evita rate limiting pe IP-uri partajate

**Concluzie**: Risc minim. Site-ul e public, nu necesită autentificare pentru pagina de cariere, iar scraperul e politicos.
