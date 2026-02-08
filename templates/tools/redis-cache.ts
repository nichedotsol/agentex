/**
 * Redis Cache Tool
 * Key-value storage and caching with Redis
 */

import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  key: string;
  value?: string;
  ttl?: number; // Time to live in seconds
}

export class RedisCache {
  private client: RedisClientType;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set. Format: redis://:password@host:6379');
    }

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    await this.connect();
    return await this.client.get(key);
  }

  /**
   * Set a value with optional TTL
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.connect();
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Delete a key
   */
  async delete(key: string): Promise<number> {
    await this.connect();
    return await this.client.del(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    await this.connect();
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    await this.connect();
    return await this.client.expire(key, seconds);
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, by: number = 1): Promise<number> {
    await this.connect();
    if (by === 1) {
      return await this.client.incr(key);
    } else {
      return await this.client.incrBy(key, by);
    }
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, by: number = 1): Promise<number> {
    await this.connect();
    if (by === 1) {
      return await this.client.decr(key);
    } else {
      return await this.client.decrBy(key, by);
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    await this.connect();
    return await this.client.keys(pattern);
  }

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: string): Promise<number> {
    await this.connect();
    return await this.client.publish(channel, message);
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.connect();
    const subscriber = this.client.duplicate();
    await subscriber.connect();

    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  }

  /**
   * Get hash field value
   */
  async hGet(key: string, field: string): Promise<string | null> {
    await this.connect();
    return await this.client.hGet(key, field);
  }

  /**
   * Set hash field value
   */
  async hSet(key: string, field: string, value: string): Promise<number> {
    await this.connect();
    return await this.client.hSet(key, field, value);
  }

  /**
   * Get all hash fields and values
   */
  async hGetAll(key: string): Promise<Record<string, string>> {
    await this.connect();
    return await this.client.hGetAll(key);
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
