import { jest } from '@jest/globals';

describe('solr.js', () => {
  describe('getSolrAuth', () => {
    it('should return SOLR_AUTH from environment', async () => {
      const solr = await import('../../solr.js');
      const auth = solr.getSolrAuth();
      expect(auth).toBeDefined();
      expect(typeof auth).toBe('string');
    });
  });
});

describe('index.js', () => {
  describe('parseJobsFromHtml', () => {
    it('should parse job images from HTML', async () => {
      const { parseJobsFromHtml } = await import('../../index.js');
      
      const html = `
        <html>
          <body>
            <img src="/img/cms/cariere/test.jpg" alt="Test Job">
          </body>
        </html>
      `;
      
      const jobs = parseJobsFromHtml(html);
      expect(jobs.length).toBe(1);
      expect(jobs[0].title).toBe('Test Job');
      expect(jobs[0].url).toContain('cariere');
    });

    it('should use filename as title when alt is missing', async () => {
      const { parseJobsFromHtml } = await import('../../index.js');
      
      const html = `
        <html>
          <body>
            <img src="https://spishop.ro/img/cms/cariere/JOB_TITLE.jpeg">
          </body>
        </html>
      `;
      
      const jobs = parseJobsFromHtml(html);
      expect(jobs.length).toBe(1);
      expect(jobs[0].title).toBe('JOB_TITLE');
    });

    it('should return empty array when no job images found', async () => {
      const { parseJobsFromHtml } = await import('../../index.js');
      
      const html = `
        <html>
          <body>
            <img src="/img/other/image.jpg">
          </body>
        </html>
      `;
      
      const jobs = parseJobsFromHtml(html);
      expect(jobs.length).toBe(0);
    });
  });

  describe('extractJobInfoFromOcr', () => {
    it('should return fallback title with description', async () => {
      const { extractJobInfoFromOcr } = await import('../../index.js');
      
      const result = extractJobInfoFromOcr('Some OCR text', 'Fallback Title');
      
      expect(result.title).toBe('Fallback Title');
      expect(result.description).toBe('Some OCR text');
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', async () => {
      const { mapToJobModel } = await import('../../index.js');
      
      const rawJob = {
        url: 'http://test.com/job.jpg',
        title: 'Test Job',
        description: 'Job description'
      };
      
      const result = mapToJobModel(rawJob, '12345678', 'Test Company');
      
      expect(result.url).toBe('http://test.com/job.jpg');
      expect(result.title).toBe('Test Job');
      expect(result.company).toBe('Test Company');
      expect(result.cif).toBe('12345678');
      expect(result.description).toBe('Job description');
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should handle missing optional fields', async () => {
      const { mapToJobModel } = await import('../../index.js');
      
      const rawJob = {
        url: 'http://test.com/job.jpg',
        title: 'Test Job'
      };
      
      const result = mapToJobModel(rawJob, '12345678', 'Test Company');
      
      expect(result.url).toBe('http://test.com/job.jpg');
      expect(result.title).toBe('Test Job');
      expect(result.location).toBeUndefined();
      expect(result.workmode).toBe('on-site');
    });
  });
});
