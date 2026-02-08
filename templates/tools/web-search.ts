/**
 * Web Search Tool
 * Search the web using Brave Search API
 */

import axios from 'axios';

export interface WebSearchOptions {
  q: string;
  count?: number;
  offset?: number;
  safesearch?: 'strict' | 'moderate' | 'off';
  freshness?: 'pd' | 'pw' | 'pm' | 'py';
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  total?: number;
}

export class WebSearch {
  private apiKey: string;
  private baseUrl = 'https://api.search.brave.com/res/v1/web/search';

  constructor() {
    const apiKey = process.env.BRAVE_API_KEY;
    if (!apiKey) {
      throw new Error('BRAVE_API_KEY environment variable is not set. Get from: https://brave.com/search/api');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search the web
   */
  async search(options: WebSearchOptions): Promise<WebSearchResponse> {
    try {
      const params = new URLSearchParams({
        q: options.q,
        ...(options.count && { count: options.count.toString() }),
        ...(options.offset && { offset: options.offset.toString() }),
        ...(options.safesearch && { safesearch: options.safesearch }),
        ...(options.freshness && { freshness: options.freshness }),
      });

      const response = await axios.get(`${this.baseUrl}?${params.toString()}`, {
        headers: {
          'X-Subscription-Token': this.apiKey,
          'Accept': 'application/json',
        },
      });

      const results: SearchResult[] = (response.data.web?.results || []).map((result: any) => ({
        title: result.title,
        url: result.url,
        description: result.description,
        age: result.age,
      }));

      return {
        query: options.q,
        results,
        total: response.data.web?.total || results.length,
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Brave Search API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      }
      throw new Error(`Failed to search web: ${error.message}`);
    }
  }

  /**
   * Search for images
   */
  async searchImages(query: string, count: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl.replace('/web/', '/images/')}`, {
        params: { q: query, count },
        headers: {
          'X-Subscription-Token': this.apiKey,
          'Accept': 'application/json',
        },
      });

      return response.data.images?.results || [];
    } catch (error: any) {
      throw new Error(`Failed to search images: ${error.message}`);
    }
  }

  /**
   * Search for news
   */
  async searchNews(query: string, count: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl.replace('/web/', '/news/')}`, {
        params: { q: query, count },
        headers: {
          'X-Subscription-Token': this.apiKey,
          'Accept': 'application/json',
        },
      });

      return response.data.news?.results || [];
    } catch (error: any) {
      throw new Error(`Failed to search news: ${error.message}`);
    }
  }
}
