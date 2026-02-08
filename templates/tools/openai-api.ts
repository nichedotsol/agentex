/**
 * OpenAI API Tool
 * Interact with GPT models via OpenAI API
 */

import OpenAI from 'openai';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  messages: Message[];
  functions?: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
}

export interface OpenAIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class OpenAIAPI {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set. Get from: https://platform.openai.com/api-keys');
    }

    this.client = new OpenAI({
      apiKey,
    });
  }

  /**
   * Generate chat completion
   */
  async generate(options: OpenAIOptions): Promise<OpenAIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        max_tokens: options.max_tokens || 4096,
        temperature: options.temperature || 0.7,
        messages: options.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        functions: options.functions,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Stream chat completion
   */
  async *stream(options: OpenAIOptions): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        max_tokens: options.max_tokens || 4096,
        temperature: options.temperature || 0.7,
        messages: options.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        functions: options.functions,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error: any) {
      throw new Error(`OpenAI API streaming error: ${error.message}`);
    }
  }

  /**
   * Use function calling
   */
  async callFunction(
    messages: Message[],
    functions: Array<{
      name: string;
      description: string;
      parameters: any;
    }>,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
    }
  ): Promise<any> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4-turbo-preview',
        max_tokens: options?.max_tokens || 4096,
        temperature: options?.temperature || 0.7,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        functions: functions.map(fn => ({
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters,
        })),
      });

      return response;
    } catch (error: any) {
      throw new Error(`OpenAI function calling error: ${error.message}`);
    }
  }

  /**
   * Generate embeddings
   */
  async generateEmbedding(text: string, model: string = 'text-embedding-3-small'): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model,
        input: text,
      });

      return response.data[0]?.embedding || [];
    } catch (error: any) {
      throw new Error(`OpenAI embedding error: ${error.message}`);
    }
  }
}
