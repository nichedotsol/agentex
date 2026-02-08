// AgentEX Build Validator

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateBuild(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Must have exactly 1 brain
  if (!config.components?.brain) {
    errors.push("Build must have exactly 1 brain component");
  }

  // Must have at least 1 tool
  if (!config.components?.tools || config.components.tools.length === 0) {
    warnings.push("Build has no tools - agent will have limited capabilities");
  }

  // Must have exactly 1 runtime
  if (!config.components?.runtime) {
    errors.push("Build must have exactly 1 runtime component");
  }

  // Check token budget
  if (config.settings?.token_budget && config.settings.token_budget < 100) {
    warnings.push("Token budget is very low - may limit agent capabilities");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
