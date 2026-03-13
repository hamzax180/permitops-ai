from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from backend.models.schemas import PermitState, CombinedPermitResult
from backend.agents.core_agents import permit_agent
from backend.utils.rate_limiter import throttled_run

class GraphState(TypedDict):
    state: PermitState
    user_request: str

async def permit_node(state: GraphState):
    """Single node: runs one combined API call to get the full permit plan."""
    result = await throttled_run(permit_agent.run, state['user_request'])
    combined: CombinedPermitResult = result.data
    state['state'].combined_result = combined
    # Also populate legacy fields so the dashboard still works
    from backend.models.schemas import PermitPlan, ExecutionPlan
    state['state'].permit_plan = PermitPlan(
        permits=combined.permits,
        agencies=combined.agencies,
        documents=combined.documents,
    )
    state['state'].execution_plan = ExecutionPlan(
        steps=combined.steps,
        assigned_agents=["PermitOps AI"] * len(combined.steps),
    )
    return state

builder = StateGraph(GraphState)
builder.add_node("permit", permit_node)
builder.add_edge(START, "permit")
builder.add_edge("permit", END)

orchestrator = builder.compile()
