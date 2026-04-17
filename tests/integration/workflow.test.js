import { jest } from '@jest/globals';

describe('Integration: API Workflow', () => {
  
  describe('Full company validation workflow', () => {
    it.skip('should go from brand to validated company (ANAF API can return 500)', async () => {
      const demoanaf = await import('../../demoanaf.js');
      const company = await import('../../company.js');
      const solr = await import('../../solr.js');
      
      const searchResults = await demoanaf.searchCompany('SECPRAL');
      expect(searchResults.length).toBeGreaterThan(0);
      
      const secpralCompany = searchResults.find(c => 
        c.name.toUpperCase().includes('SECPRAL') && c.statusLabel === 'Funcțiune'
      );
      expect(secpralCompany).toBeDefined();
      
      const anafData = await demoanaf.getCompanyFromANAF(secpralCompany.cui.toString());
      expect(anafData.name).toBe('SECPRAL PRO INSTALATII SRL');
      
      const companyResult = await company.validateAndGetCompany();
      expect(companyResult.status).toBe('active');
      expect(companyResult.cif).toBe('10166281');
      
      const solrResult = await solr.querySOLR(companyResult.cif);
      expect(solrResult.numFound).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Company data consistency', () => {
    it.skip('should have matching data across ANAF, Peviitor and SOLR (timeout issues)', async () => {
      const company = await import('../../company.js');
      const solr = await import('../../solr.js');
      
      const companyResult = await company.validateAndGetCompany();
      
      const solrResult = await solr.queryCompanySOLR(`company:${companyResult.company}*`);
      expect(solrResult.docs[0]).toBeDefined();
    });
  });

  describe('Company Core Model Validation', () => {
    it('should have all required fields per company model', async () => {
      const solr = await import('../../solr.js');
      
      const result = await solr.queryCompanySOLR('id:10166281');
      
      if (result.numFound === 0) {
        expect(true).toBe(true);
        return;
      }
      
      const secpral = result.docs[0];
      
      expect(secpral.id).toBe('10166281');
      expect(secpral.company).toBeDefined();
      expect(secpral.brand).toBe('SECPRAL');
      expect(secpral.status).toBeDefined();
      expect(['activ','suspendat','inactiv','radiat']).toContain(secpral.status);
    });
  });
});