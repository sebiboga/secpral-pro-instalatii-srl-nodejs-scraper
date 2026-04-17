describe('ocr.js', () => {
  describe('ocrImageBuffer', () => {
    it('should be a function', async () => {
      const ocr = await import('../../ocr.js');
      expect(typeof ocr.ocrImageBuffer).toBe('function');
    });
  });

  describe('preprocessAndOcr', () => {
    it('should be a function', async () => {
      const ocr = await import('../../ocr.js');
      expect(typeof ocr.preprocessAndOcr).toBe('function');
    });
  });
});
