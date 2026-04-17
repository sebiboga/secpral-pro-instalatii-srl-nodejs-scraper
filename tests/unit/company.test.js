import { jest } from '@jest/globals';

describe('company.js', () => {
  describe('getCompanyBrand', () => {
    it('should return the company brand', async () => {
      const company = await import('../../company.js');
      expect(company.getCompanyBrand()).toBe('spishop');
    });
  });
});
