"""
AgentEX API Models
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    """Agent configuration"""
    temperature: Optional[float] = Field(None, ge=0, le=2)
    maxTokens: Optional[int] = None
    cronSchedule: Optional[str] = None
    timeout: Optional[int] = None


class ValidateRequest(BaseModel):
    """Request to validate agent requirements"""
    name: str
    description: str
    brain: str
    tools: List[str]
    runtime: Optional[str] = None
    config: Optional[AgentConfig] = None


class Issue(BaseModel):
    """Validation issue"""
    severity: str  # 'error' or 'warning'
    message: str
    field: Optional[str] = None


class RuntimeRecommendation(BaseModel):
    """Runtime recommendation"""
    primary: str
    reasoning: str
    alternatives: List[str] = []
    cost: str
    limitations: List[str] = []
    difficulty: str
    estimatedTime: str


class CostEstimate(BaseModel):
    """Cost estimate"""
    total: str
    breakdown: List[Dict[str, str]] = []


class EnvironmentVariable(BaseModel):
    """Environment variable"""
    key: str
    purpose: str
    getFrom: str
    required: bool
    example: Optional[str] = None


class ValidateResponse(BaseModel):
    """Response from validate endpoint"""
    valid: bool
    issues: List[Issue] = []
    recommendation: Optional[RuntimeRecommendation] = None
    estimatedCost: Optional[CostEstimate] = None
    requiredEnv: List[EnvironmentVariable] = []


class GenerateRequest(BaseModel):
    """Request to generate agent code"""
    name: str
    description: str
    brain: str
    tools: List[str]
    runtime: str
    config: Optional[AgentConfig] = None


class GenerateResponse(BaseModel):
    """Response from generate endpoint"""
    buildId: str
    status: str
    estimatedTime: str
    statusUrl: str


class BuildResult(BaseModel):
    """Build result"""
    downloadUrl: Optional[str] = None
    previewUrl: Optional[str] = None
    setupInstructionsUrl: Optional[str] = None
    deployUrl: Optional[str] = None
    deployId: Optional[str] = None
    sourceCode: Optional[Dict[str, str]] = None


class BuildError(BaseModel):
    """Build error"""
    message: str
    code: str
    canRetry: bool
    suggestedFix: Optional[str] = None


class BuildStatus(BaseModel):
    """Build status"""
    buildId: str
    status: str
    progress: int
    createdAt: int
    updatedAt: int
    result: Optional[BuildResult] = None
    error: Optional[BuildError] = None


class DeployRequest(BaseModel):
    """Request to deploy agent"""
    buildId: str
    platform: str
    credentials: Dict[str, str]


class DeployResponse(BaseModel):
    """Response from deploy endpoint"""
    deployId: str
    status: str
    estimatedTime: str
    statusUrl: str


class ToolSearchRequest(BaseModel):
    """Request to search tools"""
    query: Optional[str] = None
    category: Optional[str] = None
    capabilities: Optional[List[str]] = None


class ToolSummary(BaseModel):
    """Tool summary"""
    id: str
    name: str
    description: str
    category: str


class ToolSearchResponse(BaseModel):
    """Response from tool search"""
    tools: List[ToolSummary]
    total: int


class ToolImplementation(BaseModel):
    """Tool implementation details"""
    npm: Optional[List[str]] = None
    endpoint: Optional[str] = None
    template: Optional[str] = None


class ToolCost(BaseModel):
    """Tool cost information"""
    tier: str
    estimate: Optional[str] = None


class ToolSpec(BaseModel):
    """Tool specification"""
    id: str
    name: str
    description: str
    category: str
    requiredEnv: List[EnvironmentVariable] = []
    implementation: Optional[ToolImplementation] = None
    cost: Optional[ToolCost] = None
    capabilities: List[str] = []
    documentation: Optional[str] = None
