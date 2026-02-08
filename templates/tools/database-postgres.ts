/**
 * PostgreSQL Database Tool
 * Execute queries and manage PostgreSQL database
 */

import { Pool, QueryResult } from 'pg';

export interface QueryOptions {
  query: string;
  params?: any[];
  transaction?: boolean;
}

export class PostgreSQLDatabase {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is not set. Format: postgresql://user:pass@host:5432/dbname');
    }

    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });

    // Test connection
    this.pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL error:', err);
    });
  }

  /**
   * Execute a query
   */
  async executeQuery(options: QueryOptions): Promise<QueryResult> {
    const client = await this.pool.connect();

    try {
      if (options.transaction) {
        await client.query('BEGIN');
      }

      const result = await client.query(options.query, options.params);

      if (options.transaction) {
        await client.query('COMMIT');
      }

      return result;
    } catch (error: any) {
      if (options.transaction) {
        await client.query('ROLLBACK');
      }
      throw new Error(`Query failed: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction with multiple queries
   */
  async executeTransaction(queries: Array<{ query: string; params?: any[] }>): Promise<QueryResult[]> {
    const client = await this.pool.connect();
    const results: QueryResult[] = [];

    try {
      await client.query('BEGIN');

      for (const { query, params } of queries) {
        const result = await client.query(query, params);
        results.push(result);
      }

      await client.query('COMMIT');
      return results;
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Create a table
   */
  async createTable(tableName: string, columns: Record<string, string>): Promise<void> {
    const columnDefs = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');

    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
    await this.executeQuery({ query });
  }

  /**
   * Insert data
   */
  async insert(tableName: string, data: Record<string, any>): Promise<QueryResult> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    return this.executeQuery({ query, params: values });
  }

  /**
   * Update data
   */
  async update(
    tableName: string,
    data: Record<string, any>,
    where: Record<string, any>
  ): Promise<QueryResult> {
    const setClause = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const whereClause = Object.keys(where)
      .map((key, i) => `${key} = $${Object.keys(data).length + i + 1}`)
      .join(' AND ');

    const params = [...Object.values(data), ...Object.values(where)];
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause} RETURNING *`;

    return this.executeQuery({ query, params });
  }

  /**
   * Delete data
   */
  async delete(tableName: string, where: Record<string, any>): Promise<QueryResult> {
    const whereClause = Object.keys(where)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(' AND ');

    const params = Object.values(where);
    const query = `DELETE FROM ${tableName} WHERE ${whereClause} RETURNING *`;

    return this.executeQuery({ query, params });
  }

  /**
   * Select data
   */
  async select(
    tableName: string,
    columns: string[] = ['*'],
    where?: Record<string, any>,
    limit?: number
  ): Promise<QueryResult> {
    let query = `SELECT ${columns.join(', ')} FROM ${tableName}`;
    const params: any[] = [];

    if (where) {
      const whereClause = Object.keys(where)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...Object.values(where));
    }

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    return this.executeQuery({ query, params });
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
