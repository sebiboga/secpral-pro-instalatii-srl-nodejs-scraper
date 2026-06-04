# Actualizare About repo pe GitHub

Pentru a actualiza secțiunea **About** din dreapta paginii principale a repo-ului pe GitHub (descriere, website, topics):

## CLI (gh)

```bash
# Descriere
gh repo edit sebiboga/secpral-pro-instalatii-srl-nodejs-scraper \
  --description "SECPRAL PRO INSTALATII SRL - daily company scraper using GitHub Actions"

# Website
gh repo edit sebiboga/secpral-pro-instalatii-srl-nodejs-scraper \
  --homepage "https://sebiboga.github.io/secpral-pro-instalatii-srl-nodejs-scraper/"

# Topics (EXACT aceste două — obligatorii)
gh repo edit sebiboga/secpral-pro-instalatii-srl-nodejs-scraper \
  --add-topic job-seeker-ro-spider --add-topic peviitor-ro
```

## Web UI

1. Mergi la `https://github.com/sebiboga/secpral-pro-instalatii-srl-nodejs-scraper`
2. Click pe ⚙️ **Settings** (tab-ul din dreapta sus)
3. Mergi la secțiunea **General** → **Description**
4. Completează:
   - **Description**: textul de mai sus
   - **Website**: URL-ul GitHub Pages
   - **Topics**: cuvinte cheie separate prin spațiu
5. Click **Save changes**

## Verificare

```bash
gh repo view sebiboga/secpral-pro-instalatii-srl-nodejs-scraper --json description,homepage,topics
```
