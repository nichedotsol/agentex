/**
 * Web Scraper Tool
 * Scrape and extract data from websites
 */

import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface ScrapeOptions {
  url: string;
  selector?: string;
  waitFor?: string;
  headers?: Record<string, string>;
  usePuppeteer?: boolean;
}

export interface ScrapeResult {
  html?: string;
  text?: string;
  data?: any;
  links?: string[];
  images?: string[];
}

export class WebScraper {
  /**
   * Scrape HTML content from a URL
   */
  async scrapeHTML(options: ScrapeOptions): Promise<ScrapeResult> {
    try {
      let html: string;

      if (options.usePuppeteer) {
        // Use Puppeteer for JavaScript-rendered pages
        html = await this.scrapeWithPuppeteer(options);
      } else {
        // Simple fetch for static pages
        const response = await fetch(options.url, {
          headers: options.headers || {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        html = await response.text();
      }

      const $ = cheerio.load(html);

      // Extract text
      let text = '';
      if (options.selector) {
        text = $(options.selector).text().trim();
      } else {
        text = $('body').text().trim();
      }

      // Extract links
      const links: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          try {
            const url = new URL(href, options.url);
            links.push(url.href);
          } catch {
            // Invalid URL, skip
          }
        }
      });

      // Extract images
      const images: string[] = [];
      $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
          try {
            const url = new URL(src, options.url);
            images.push(url.href);
          } catch {
            // Invalid URL, skip
          }
        }
      });

      // Try to extract JSON-LD structured data
      let data: any = null;
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || '{}');
          data = { ...data, ...json };
        } catch {
          // Invalid JSON, skip
        }
      });

      return {
        html: options.selector ? $(options.selector).html() || undefined : html,
        text,
        data,
        links: [...new Set(links)], // Deduplicate
        images: [...new Set(images)], // Deduplicate
      };
    } catch (error: any) {
      throw new Error(`Failed to scrape ${options.url}: ${error.message}`);
    }
  }

  /**
   * Scrape with Puppeteer (for JavaScript-rendered pages)
   */
  private async scrapeWithPuppeteer(options: ScrapeOptions): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }

      await page.goto(options.url, {
        waitUntil: options.waitFor ? 'networkidle0' : 'domcontentloaded',
      });

      if (options.waitFor) {
        await page.waitForSelector(options.waitFor, { timeout: 10000 });
      }

      const html = await page.content();
      await browser.close();

      return html;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * Extract JSON data from a page
   */
  async scrapeJSON(url: string): Promise<any> {
    const result = await this.scrapeHTML({ url, usePuppeteer: false });
    return result.data || {};
  }

  /**
   * Extract all links from a page
   */
  async extractLinks(url: string): Promise<string[]> {
    const result = await this.scrapeHTML({ url, usePuppeteer: false });
    return result.links || [];
  }

  /**
   * Extract all images from a page
   */
  async extractImages(url: string): Promise<string[]> {
    const result = await this.scrapeHTML({ url, usePuppeteer: false });
    return result.images || [];
  }
}
