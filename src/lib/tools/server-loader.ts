/**
 * Server-Side Tool Loader
 * Loads tools from file system (for API routes)
 */

import { ToolSpec } from '@/lib/types/tool-spec';
import fs from 'fs/promises';
import path from 'path';

const TOOLS_DIR = path.join(process.cwd(), 'public/components/tools');

/**
 * Load a tool specification by ID from file system
 */
export async function loadToolServer(toolId: string): Promise<ToolSpec> {
  try {
    // Try enhanced spec first
    const enhancedPath = path.join(TOOLS_DIR, `tool-${toolId}.json`);
    try {
      const content = await fs.readFile(enhancedPath, 'utf-8');
      const tool = JSON.parse(content);
      return validateToolSpec(tool);
    } catch {
      // Try without tool- prefix
      const altPath = path.join(TOOLS_DIR, `${toolId}.json`);
      const content = await fs.readFile(altPath, 'utf-8');
      const tool = JSON.parse(content);
      return validateToolSpec(tool);
    }
  } catch (error) {
    throw new Error(`Tool "${toolId}" not found`);
  }
}

/**
 * Load all tools from file system
 */
export async function loadAllToolsServer(): Promise<ToolSpec[]> {
  try {
    const files = await fs.readdir(TOOLS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const tools = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = path.join(TOOLS_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const tool = JSON.parse(content);
          return validateToolSpec(tool);
        } catch (error) {
          console.error(`Failed to load tool from ${file}:`, error);
          return null;
        }
      })
    );

    return tools.filter((t): t is ToolSpec => t !== null);
  } catch (error) {
    console.error('Failed to load all tools:', error);
    return [];
  }
}

/**
 * Validate tool spec structure
 */
function validateToolSpec(tool: any): ToolSpec {
  if (!tool.id || !tool.name || !tool.type) {
    throw new Error('Invalid tool spec: missing required fields');
  }
  
  return {
    ...tool,
    category: tool.category || 'utility',
    requiredEnv: tool.requiredEnv || [],
    implementation: tool.implementation || {},
    cost: tool.cost || { tier: 'free' },
    documentation: tool.documentation || ''
  };
}
