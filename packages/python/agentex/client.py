"""
AgentEX API Client
"""

import requests
from typing import Optional, Dict, Any, List
from .models import (
    ValidateRequest,
    ValidateResponse,
    GenerateRequest,
    GenerateResponse,
    BuildStatus,
    DeployRequest,
    DeployResponse,
    ToolSearchRequest,
    ToolSearchResponse,
    ToolSpec
)


class AgentEXClient:
    """Client for interacting with the AgentEX Skill API"""
    
    def __init__(self, base_url: str = "https://agentexs.vercel.app/api/agentex/v2", api_key: Optional[str] = None):
        """
        Initialize the AgentEX client
        
        Args:
            base_url: Base URL for the API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})
        self.session.headers.update({"Content-Type": "application/json"})
    
    def validate(self, request: ValidateRequest) -> ValidateResponse:
        """
        Validate agent requirements
        
        Args:
            request: ValidateRequest object
            
        Returns:
            ValidateResponse object
        """
        response = self.session.post(
            f"{self.base_url}/validate",
            json=request.dict()
        )
        response.raise_for_status()
        return ValidateResponse(**response.json())
    
    def generate(self, request: GenerateRequest) -> GenerateResponse:
        """
        Generate agent code
        
        Args:
            request: GenerateRequest object
            
        Returns:
            GenerateResponse object
        """
        response = self.session.post(
            f"{self.base_url}/generate",
            json=request.dict()
        )
        response.raise_for_status()
        return GenerateResponse(**response.json())
    
    def get_status(self, build_id: str) -> BuildStatus:
        """
        Get build status
        
        Args:
            build_id: Build ID from generate()
            
        Returns:
            BuildStatus object
        """
        response = self.session.get(
            f"{self.base_url}/status/{build_id}"
        )
        response.raise_for_status()
        return BuildStatus(**response.json())
    
    def wait_for_completion(self, build_id: str, timeout: int = 300, poll_interval: int = 5) -> BuildStatus:
        """
        Wait for build to complete
        
        Args:
            build_id: Build ID from generate()
            timeout: Maximum time to wait in seconds
            poll_interval: Time between status checks in seconds
            
        Returns:
            BuildStatus object when complete
            
        Raises:
            TimeoutError: If build doesn't complete within timeout
        """
        import time
        start_time = time.time()
        
        while True:
            status = self.get_status(build_id)
            
            if status.status in ['complete', 'failed']:
                return status
            
            if time.time() - start_time > timeout:
                raise TimeoutError(f"Build {build_id} did not complete within {timeout} seconds")
            
            time.sleep(poll_interval)
    
    def deploy(self, request: DeployRequest) -> DeployResponse:
        """
        Deploy agent
        
        Args:
            request: DeployRequest object
            
        Returns:
            DeployResponse object
        """
        response = self.session.post(
            f"{self.base_url}/deploy",
            json=request.dict()
        )
        response.raise_for_status()
        return DeployResponse(**response.json())
    
    def search_tools(self, request: ToolSearchRequest) -> ToolSearchResponse:
        """
        Search available tools
        
        Args:
            request: ToolSearchRequest object
            
        Returns:
            ToolSearchResponse object
        """
        response = self.session.post(
            f"{self.base_url}/tools/search",
            json=request.dict()
        )
        response.raise_for_status()
        return ToolSearchResponse(**response.json())
    
    def get_tool(self, tool_id: str) -> ToolSpec:
        """
        Get tool details
        
        Args:
            tool_id: Tool ID
            
        Returns:
            ToolSpec object
        """
        response = self.session.get(
            f"{self.base_url}/tools/{tool_id}"
        )
        response.raise_for_status()
        return ToolSpec(**response.json())
