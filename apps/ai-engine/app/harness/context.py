"""Execution dependencies and context for Pydantic AI Harness."""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.client.backend_client import BackendClient, backend_client_instance


class Citation(BaseModel):
    """Source citation from Second Brain knowledge base."""
    source_id: str
    title: str
    source_type: str  # 'knowledge_page', 'file', 'meeting', 'task', 'project', 'ticket'
    url: Optional[str] = None
    snippet: Optional[str] = None


class ToolExecutionRecord(BaseModel):
    """Record of a tool invocation during agent reasoning."""
    tool_name: str
    arguments: Dict[str, Any]
    result: Any
    status: str = "success"  # 'success' | 'error'


@dataclass
class HarnessContext:
    """Dependencies injected into Pydantic AI tool functions during agent run."""

    user_id: str
    organisation_id: str
    conversation_id: str
    auth_token: Optional[str] = None
    agent_id: Optional[str] = None
    agent_role: str = "general_assistant"
    allowed_tools: Optional[List[str]] = None
    backend_client: BackendClient = field(default_factory=lambda: backend_client_instance)
    extra_metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Internal execution tracking
    collected_citations: List[Citation] = field(default_factory=list)
    recorded_tool_calls: List[ToolExecutionRecord] = field(default_factory=list)

    def is_tool_allowed(self, tool_name: str) -> bool:
        """Verifies if the agent has permissions to invoke the given tool."""
        if self.allowed_tools is None:
            return True
        return tool_name in self.allowed_tools

    def add_citation(
        self,
        source_id: str,
        title: str,
        source_type: str,
        url: Optional[str] = None,
        snippet: Optional[str] = None,
    ) -> None:
        """Adds a verified citation to the run context if not already present."""
        if not any(c.source_id == source_id for c in self.collected_citations):
            self.collected_citations.append(
                Citation(
                    source_id=source_id,
                    title=title,
                    source_type=source_type,
                    url=url,
                    snippet=snippet,
                )
            )

    def record_tool_call(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        result: Any,
        status: str = "success",
    ) -> None:
        """Records tool execution for auditing and transparency."""
        self.recorded_tool_calls.append(
            ToolExecutionRecord(
                tool_name=tool_name,
                arguments=arguments,
                result=result,
                status=status,
            )
        )
