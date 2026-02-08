/**
 * Test Templates
 * Reusable test templates for different scenarios
 */

export const testTemplates = {
  /**
   * Basic tool test template
   */
  toolTest: (toolName: string, capabilities: string[]) => `
  describe('${toolName}', () => {
    let tool: ${toolName};
    
    beforeAll(() => {
      tool = new ${toolName}();
    });
    
    ${capabilities.map(cap => `
    it('should ${cap}', async () => {
      const result = await tool.${cap}(/* params */);
      expect(result).toBeDefined();
    });`).join('\n')}
  });
`,

  /**
   * Agent endpoint test template
   */
  endpointTest: (endpoint: string) => `
  describe('${endpoint} endpoint', () => {
    it('should respond to GET requests', async () => {
      const response = await fetch(\`http://localhost:3000${endpoint}\`);
      expect(response.status).toBe(200);
    });
    
    it('should handle POST requests', async () => {
      const response = await fetch(\`http://localhost:3000${endpoint}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      });
      expect(response.status).toBe(200);
    });
  });
`,

  /**
   * Error handling test template
   */
  errorHandlingTest: (componentName: string) => `
  describe('${componentName} error handling', () => {
    it('should handle invalid input', async () => {
      const component = new ${componentName}();
      await expect(component.process({ invalid: 'input' }))
        .rejects.toThrow();
    });
    
    it('should handle network errors', async () => {
      // Mock network failure
      const component = new ${componentName}();
      // Test error handling
    });
  });
`,

  /**
   * Performance test template
   */
  performanceTest: (componentName: string) => `
  describe('${componentName} performance', () => {
    it('should respond within timeout limit', async () => {
      const start = Date.now();
      const component = new ${componentName}();
      await component.process({});
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 second limit
    });
  });
`
};
