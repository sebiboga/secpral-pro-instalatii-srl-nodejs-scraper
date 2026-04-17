import { jest } from '@jest/globals';

describe('title-fixer.js', () => {
  describe('fixJobTitlesWithOpenCode', () => {
    it('should return empty array when no jobs provided', async () => {
      const { fixJobTitlesWithOpenCode } = await import('../../title-fixer.js');
      const result = await fixJobTitlesWithOpenCode([]);
      expect(result).toEqual([]);
    });

    it('should preserve original jobs on OpenCode error', async () => {
      const { fixJobTitlesWithOpenCode } = await import('../../title-fixer.js');
      const jobs = [
        { url: 'http://test.com/job1.jpg', title: 'Test Job', description: 'Test description' }
      ];
      const originalJobs = JSON.parse(JSON.stringify(jobs));
      await fixJobTitlesWithOpenCode(jobs);
      expect(jobs[0].title).toBe(originalJobs[0].title);
    });
  });
});
