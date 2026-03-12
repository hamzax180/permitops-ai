from fastapi import FastAPI, HTTPException
from backend.models.schemas import PermitState, UserQuery
from backend.workflow.orchestrator import orchestrator
import uuid

app = FastAPI(title="PermitOps AI Backend")

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for workflows (Production would use PostgreSQL)
workflows = {}

@app.post("/business/intake")
async def start_workflow(query: UserQuery):
    workflow_id = str(uuid.uuid4())
    initial_state = PermitState(business_profile={"raw_query": query.query})
    
    # Run orchestration
    result = orchestrator.invoke({
        "state": initial_state,
        "user_request": query.query
    })
    
    workflows[workflow_id] = result["state"]
    return {"workflow_id": workflow_id, "state": result["state"]}

@app.get("/workflow/{workflow_id}")
async def get_status(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflows[workflow_id]

@app.post("/agent/query")
async def agent_query(query: UserQuery):
    # Direct agent query endpoint for the chat interface
    # Here we simulate an agent response
    return {
        "role": "assistant",
        "content": f"I've received your query: '{query.query}'. My multi-agent system is analyzing the requirements for your business in Beşiktaş."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
