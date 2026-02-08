'use client';

import { useEffect } from 'react';

/**
 * OpenAPI Interactive Documentation Page
 * Uses Swagger UI to display the API documentation
 */
export default function APIDocsPage() {
  useEffect(() => {
    // Dynamically load Swagger UI
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        presets: [
          // @ts-ignore
          window.SwaggerUIBundle.presets.apis,
          // @ts-ignore
          window.SwaggerUIBundle.presets.standalone
        ],
        layout: 'BaseLayout',
        deepLinking: true,
        filter: true,
        tryItOutEnabled: true,
      });
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AgentEX Skill API Documentation
          </h1>
          <p className="text-gray-600">
            Interactive API documentation for the AgentEX Skill API. Use this API to programmatically build agents.
          </p>
        </div>
        <div id="swagger-ui" className="bg-white rounded-lg shadow-lg p-4" />
      </div>
    </div>
  );
}
