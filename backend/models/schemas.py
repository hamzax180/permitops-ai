from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class PermitPlan(BaseModel):
    permits: List[str] = Field(..., description="List of required permit types")
    agencies: List[str] = Field(..., description="Authorities involved")
    documents: List[str] = Field(..., description="Total documents needed across all permits")

class ExecutionPlan(BaseModel):
    steps: List[str] = Field(..., description="Logical steps for the agent workflow")
    assigned_agents: List[str] = Field(..., description="Agents delegated for each step")

class DocumentChecklist(BaseModel):
    items: List[str]
    status: Dict[str, str]  # item -> status (e.g. "pending", "uploaded")

class WorkflowStatus(BaseModel):
    current_step: str
    completion_percentage: float
    next_action_required: Optional[str]

class PermitState(BaseModel):
    business_profile: Optional[Dict] = None
    execution_plan: Optional[ExecutionPlan] = None
    permit_plan: Optional[PermitPlan] = None
    checklist: Optional[DocumentChecklist] = None
    uploaded_documents: List[str] = []
    validation_results: List[Dict] = []
    workflow_status: Optional[WorkflowStatus] = None
    last_updated: datetime = Field(default_factory=datetime.now)

class UserQuery(BaseModel):
    query: str
    context: Optional[Dict] = None
