/**
 * Anthropic API Tool
 * Interact with Claude AI models via Anthropic API
 */

import Anthropic from '@anthropic-ai/sdk';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  system?: string;
  messages: Message[];
}

export interface ClaudeResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

export class AnthropicAPI {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set. Get from: https://console.anthropic.com');
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * Generate text completion
   */
  async generate(options: ClaudeOptions): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.max_tokens || 4096,
        temperature: options.temperature || 0.7,
        system: options.system,
        messages: options.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const content = response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');

      return {
        content,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error: any) {
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Stream text completion
   */
  async *stream(options: ClaudeOptions): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.messages.stream({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.max_tokens || 4096,
        temperature: options.temperature || 0.7,
        system: options.system,
        messages: options.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
      }
    } catch (error: any) {
      throw new Error(`Anthropic API streaming error: ${error.message}`);
    }
  }

  /**
   * Use tools (function calling)
   */
  async useTools(
    messages: Message[],
    tools: Array<{
      name: string;
      description: string;
      input_schema: any;
    }>,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
    }
  ): Promise<any> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.max_tokens || 4096,
        temperature: options?.temperature || 0.7,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.input_schema,
        })),
      });

      return response;
    } catch (error: any) {
      throw new Error(`Anthropic API tools error: ${error.message}`);
    }
  }
}
