/**
 * Type definitions
 */

export type Runtime = 'vercel' | 'railway' | 'render' | 'fly.io' | 'netlify' | 'cloudflare-pages' | 'docker';
export type Brain = 'openai' | 'anthropic' | 'openclaw';
export type Platform = 'vercel' | 'github' | 'railway';
export type BuildStatusType = 'queued' | 'generating' | 'complete' | 'failed' | 'deploying';
export type DeployStatusType = 'queued' | 'deploying' | 'complete' | 'failed';
