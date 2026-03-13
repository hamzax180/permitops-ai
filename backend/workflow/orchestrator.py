from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from models.schemas import PermitState, CombinedPermitResult
from agents.core_agents import permit_agent
from utils.rate_limiter import throttled_run

class GraphState(TypedDict):
    state: PermitState
    user_request: str

async def permit_node(state: GraphState):
    """Single node: runs one combined API call to get the full permit plan."""
    result = await throttled_run(permit_agent.run, state['user_request'])
    combined: CombinedPermitResult = result.data
    state['state'].combined_result = combined
    # Also populate legacy fields so the dashboard still works
    from models.schemas import PermitPlan, ExecutionPlan
    state['state'].permit_plan = PermitPlan(
        permits=combined.permits,
        agencies=combined.agencies,
        documents=combined.documents,
    )
    # Ensure 'Get a Tax Number' is Step 1 as requested
    all_steps = combined.steps
    if not any("Tax Number" in s for s in all_steps):
        all_steps = ["Get a Tax Number"] + all_steps
    
    state['state'].execution_plan = ExecutionPlan(
        steps=all_steps,
        assigned_agents=["PermitOps AI"] * len(all_steps),
    )
    return state

builder = StateGraph(GraphState)
builder.add_node("permit", permit_node)
builder.add_edge(START, "permit")
builder.add_edge("permit", END)

orchestrator = builder.compile()
