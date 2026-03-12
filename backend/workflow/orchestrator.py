from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from backend.models.schemas import PermitState, ExecutionPlan, PermitPlan
from backend.agents.core_agents import planner_agent, classifier_agent

class GraphState(TypedDict):
    state: PermitState
    user_request: str

def plan_node(state: GraphState):
    """Planner agent node to create execution steps."""
    # In a real scenario, we'd pass the actual prompt. Here we simulate.
    # result = planner_agent.run_sync(state['user_request'])
    # state['state'].execution_plan = result.data
    
    # Mock for initialization stability
    state['state'].execution_plan = ExecutionPlan(
        steps=["classify", "checklist"],
        assigned_agents=["classifier", "executor"]
    )
    return state

def classify_node(state: GraphState):
    """Classifier agent node."""
    # result = classifier_agent.run_sync(state['state'].business_profile)
    # state['state'].permit_plan = result.data
    
    # Mock for initialization stability
    state['state'].permit_plan = PermitPlan(
        permits=["Workplace License"],
        agencies=["Beşiktaş Municipality"],
        documents=["Application Form", "ID Copy"]
    )
    return state

# Define the graph
builder = StateGraph(GraphState)
builder.add_node("planner", plan_node)
builder.add_node("classifier", classify_node)

builder.add_edge(START, "planner")
builder.add_edge("planner", "classifier")
builder.add_edge("classifier", END)

orchestrator = builder.compile()
