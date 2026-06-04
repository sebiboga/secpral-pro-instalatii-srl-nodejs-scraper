# Job Model Schema

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| url | string | Unique URL of the job posting. Must be valid HTTP/HTTPS URL. This is the primary key |
| title | string | Job title |
| company | string | Legal company name (uppercase, with diacritics) |
| cif | string | Company CIF/CUI (8 digits) |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| location | string[] | Romanian cities. DIACRITICS ACCEPTED. Multi-valued (e.g. ["Cluj-Napoca", "București"]) |
| tags | string[] | Keywords/tags for search. lowercase, no diacritics |
| remote | string | "remote", "on-site", or "hybrid" |
| description | string | Job description text |
| workmode | string | Working mode (remote, on-site, hybrid) |
| date | string | ISO 8601 date when job was scraped |
| status | string | Status in the pipeline: scraped → tested/verified → published |
| vdate | string | Verification date (ISO 8601) |
| expirationdate | string | Expiration date (ISO 8601) |
| salary | string | Salary information (optional, free text) |

## Status Flow

```
scraped → tested/verified → published
```

- **scraped**: Initial state when job is first extracted from source
- **tested/verified**: After passing automated tests
- **published**: After successful SOLR upsert

## Notes

- The `url` field acts as the primary key in SOLR (deduplication by URL)
- `location` is always a Romanian city name
- `tags` must be lowercase without diacritics
- `company` must be uppercase with proper diacritics
