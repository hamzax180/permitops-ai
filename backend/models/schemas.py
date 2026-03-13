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

# Combined schema — lets us answer fully in ONE Gemini API call
class CombinedPermitResult(BaseModel):
    permits: List[str] = Field(..., description="Required permit types (e.g. Workplace License, Fire Safety)")
    agencies: List[str] = Field(..., description="Government agencies involved")
    documents: List[str] = Field(..., description="All documents required across permits")
    steps: List[str] = Field(..., description="Ordered steps the business owner must follow")
    timeline_days: int = Field(..., description="Estimated total days to obtain all permits")
    summary: str = Field(..., description="One-paragraph plain-language summary for the business owner")

class DocumentChecklist(BaseModel):
    items: List[str]
    status: Dict[str, str]

class WorkflowStatus(BaseModel):
    current_step: str
    completion_percentage: float
    next_action_required: Optional[str]

class PermitState(BaseModel):
    business_profile: Optional[Dict] = None
    execution_plan: Optional[ExecutionPlan] = None
    permit_plan: Optional[PermitPlan] = None
    combined_result: Optional[CombinedPermitResult] = None
    checklist: Optional[DocumentChecklist] = None
    uploaded_documents: List[str] = []
    validation_results: List[Dict] = []
    workflow_status: Optional[WorkflowStatus] = None
    last_updated: datetime = Field(default_factory=datetime.now)

class UserQuery(BaseModel):
    query: str
    context: Optional[Dict] = None
