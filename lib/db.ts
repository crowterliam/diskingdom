import { D1Database, D1Result, R2Bucket } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
}

type SQLParam = string | number | boolean | null | Date;

export function connectToImplementationDb(databaseName: string): D1Database {
  // In Cloudflare Workers, D1 databases are bound to environment variables
  // The database name is used to look up the correct binding
  return (process.env as unknown as Record<string, D1Database>)[databaseName];
}

export async function queryDB<T = unknown>(
  env: Env,
  sql: string,
  params?: SQLParam[]
): Promise<T[]> {
  try {
    const stmt = env.DB.prepare(sql);
    if (params && params.length > 0) {
      // Ensure all params are properly converted to their basic types
      const processedParams = params.map(param => {
        if (param instanceof Date) {
          return param.getTime();
        }
        if (param === undefined) {
          return null;
        }
        return param;
      });
      stmt.bind(...processedParams);
    }
    const result = await stmt.all<T>();
    // If results is undefined, return an empty array
    if (!result.results) {
      return [];
    }
    // If results exists, return it as T[]
    return result.results as unknown as T[];
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

export async function executeDB(
  env: Env,
  sql: string,
  params?: SQLParam[]
): Promise<D1Result<unknown>> {
  try {
    const stmt = env.DB.prepare(sql);
    if (params && params.length > 0) {
      // Ensure all params are properly converted to their basic types
      const processedParams = params.map(param => {
        if (param instanceof Date) {
          return param.getTime();
        }
        if (param === undefined) {
          return null;
        }
        return param;
      });
      // Count the number of ? placeholders in the SQL
      const placeholderCount = (sql.match(/\?/g) || []).length;
      
      // Validate that we have the correct number of parameters
      if (processedParams.length !== placeholderCount) {
        throw new Error(`Parameter count mismatch: expected ${placeholderCount}, got ${processedParams.length}`);
      }
      
      stmt.bind(...processedParams);
    } else if ((sql.match(/\?/g) || []).length > 0) {
      // If we have placeholders but no params, throw an error
      throw new Error('SQL contains placeholders but no parameters were provided');
    }
    return stmt.run();
  } catch (error) {
    console.error('Database execution error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

export async function getSingle<T = unknown>(
  env: Env,
  sql: string,
  params?: SQLParam[]
): Promise<T | null> {
  try {
    const stmt = env.DB.prepare(sql);
    if (params && params.length > 0) {
      // Ensure all params are properly converted to their basic types
      const processedParams = params.map(param => {
        if (param instanceof Date) {
          return param.getTime();
        }
        if (param === undefined) {
          return null;
        }
        return param;
      });
      // Count the number of ? placeholders in the SQL
      const placeholderCount = (sql.match(/\?/g) || []).length;
      
      // Validate that we have the correct number of parameters
      if (processedParams.length !== placeholderCount) {
        throw new Error(`Parameter count mismatch: expected ${placeholderCount}, got ${processedParams.length}`);
      }
      
      stmt.bind(...processedParams);
    } else if ((sql.match(/\?/g) || []).length > 0) {
      // If we have placeholders but no params, throw an error
      throw new Error('SQL contains placeholders but no parameters were provided');
    }
    const result = await stmt.first<T>();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}
