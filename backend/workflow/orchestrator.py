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
    # Ensure standard registration steps are present and ordered correctly
    all_steps = combined.steps
    
    # 1. Tax Number
    if not any("Tax Number" in s for s in all_steps):
        all_steps = ["Get a Tax Number (Individual Tax ID)"] + all_steps
        
    # 2. Company Type & Documents
    if not any("Company Type" in s for s in all_steps):
        # Insert after Tax Number
        all_steps.insert(1, "Choose Company Type (LTD: 50k / A.Ş.: 250k TRY) & Prepare Documents")
        
    # 3. MERSIS Application
    if not any("MERSIS" in s for s in all_steps):
        # Insert after Type/Documents
        all_steps.insert(2, "MERSİS Online Registration & Articles Generation")
        
    # 4. Deposit Capital
    if not any("Capital" in s for s in all_steps):
        # Insert after MERSIS
        all_steps.insert(3, "Deposit Initial Capital (Blocked Bank Account)")
        
    # 5. Trade Registry (New)
    if not any("Trade Registry" in s for s in all_steps):
        # Insert after Capital
        all_steps.insert(4, "Register with Trade Registry (Ticaret Sicil Müdürlüğü)")
        
    # 6. Post-Registration (New)
    if not any("Post-Registration" in s for s in all_steps):
        # Insert after Trade Registry
        all_steps.insert(5, "Post-Registration (Corporate Bank, Tax Office, SGK, Accountant)")
    
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
