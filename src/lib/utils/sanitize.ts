/**
 * Security utilities for sanitizing data
 */

/**
 * Sanitize build configuration to remove sensitive API keys
 */
export function sanitizeBuildConfig(config: any): any {
  if (!config || typeof config !== 'object') {
    return config;
  }

  const sanitized = Array.isArray(config) ? [...config] : { ...config };

  // Recursively sanitize
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      const value = sanitized[key];
      const lowerKey = key.toLowerCase();

      // Remove API keys, tokens, secrets
      if (
        lowerKey.includes('apikey') ||
        lowerKey.includes('api_key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('private') ||
        lowerKey === 'ax_' ||
        (typeof value === 'string' && value.startsWith('ax_'))
      ) {
        // Replace with placeholder
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeBuildConfig(value);
      }
    }
  }

  return sanitized;
}

/**
 * Check if a string contains sensitive data
 */
export function containsSensitiveData(str: string): boolean {
  if (typeof str !== 'string') return false;
  
  const sensitivePatterns = [
    /ax_[a-f0-9]{64}/i, // API keys
    /sk-[a-zA-Z0-9]{32,}/i, // OpenAI keys
    /Bearer\s+[a-zA-Z0-9_-]{20,}/i, // Bearer tokens
    /password\s*[:=]\s*['"]?[^'"]+['"]?/i, // Passwords
    /secret\s*[:=]\s*['"]?[^'"]+['"]?/i, // Secrets
    /api[_-]?key\s*[:=]\s*['"]?[^'"]+['"]?/i, // API keys
  ];

  return sensitivePatterns.some(pattern => pattern.test(str));
}

/**
 * Sanitize environment variables from build output
 */
export function sanitizeEnvironmentVars(env: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const key in env) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      const value = env[key];
      const lowerKey = key.toLowerCase();
      
      // Redact sensitive environment variables
      if (
        lowerKey.includes('api') ||
        lowerKey.includes('key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('private') ||
        containsSensitiveData(value)
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}
