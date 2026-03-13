import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# --- Configure direct Gemini (fast, reliable, no deadlock) ---
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))
gemini_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="""You are PermitOps AI, a Turkish business permit expert for Istanbul/Beşiktaş.

When a user asks about opening a business, always respond with these clearly formatted sections:
📋 **Permits Required** — list each permit
🏛️ **Relevant Agencies** — government bodies involved
📄 **Documents to Prepare** — full document list
✅ **Steps to Follow** — numbered step-by-step guide
⏱️ **Estimated Timeline** — total days
💬 **Summary** — one friendly paragraph

Be specific, practical and warm."""
)

app = FastAPI(title="PermitOps AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Try to load the agent pipeline (optional, runs in thread to avoid deadlock) ---
_agents_available = False
try:
    from backend.workflow.orchestrator import orchestrator
    from backend.models.schemas import PermitState
    _agents_available = True
    print("[Startup] ✅ Agent pipeline loaded successfully")
except Exception as e:
    print(f"[Startup] ⚠️ Agent pipeline unavailable: {e}. Using direct Gemini fallback.")

# In-memory workflow store for dashboard
latest_workflow: dict = {}

class UserQuery(BaseModel):
    query: str
    context: Optional[dict] = None

class UserCredentials(BaseModel):
    tckn: str
    password: str


async def _run_with_agents(query: str) -> str:
    """Run the full pydantic-ai + langgraph pipeline in a thread to avoid deadlock."""
    initial_state = PermitState(business_profile={"raw_query": query})

    def _sync_invoke():
        import asyncio as _asyncio
        loop = _asyncio.new_event_loop()
        _asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(orchestrator.ainvoke({
                "state": initial_state,
                "user_request": query
            }))
        finally:
            loop.close()

    result = await asyncio.to_thread(_sync_invoke)
    state = result["state"]

    # Update dashboard data
    latest_workflow["state"] = state
    latest_workflow["business"] = query

    combined = state.combined_result
    if combined:
        return (
            f"{combined.summary}\n\n"
            f"📋 **Permits Required:** {', '.join(combined.permits)}\n\n"
            f"🏛️ **Relevant Agencies:** {', '.join(combined.agencies)}\n\n"
            f"📄 **Documents to Prepare:**\n- " + "\n- ".join(combined.documents) +
            f"\n\n✅ **Steps to Follow:**\n" + "\n".join(f"{i+1}. {s}" for i, s in enumerate(combined.steps)) +
            f"\n\n⏱️ **Estimated Timeline:** {combined.timeline_days} days"
        )
    elif state.permit_plan:
        p = state.permit_plan
        return (
            f"📋 **Permits Required:** {', '.join(p.permits)}\n\n"
            f"🏛️ **Relevant Agencies:** {', '.join(p.agencies)}\n\n"
            f"📄 **Documents to Prepare:**\n- " + "\n- ".join(p.documents)
        )
    raise ValueError("Empty agent result")


async def _run_direct_gemini(query: str) -> str:
    """Direct Gemini call — fast and reliable fallback."""
    response = await asyncio.to_thread(gemini_model.generate_content, query)
    latest_workflow["business"] = query
    latest_workflow["direct_answer"] = response.text
    return response.text


@app.post("/agent/query")
async def agent_query(query: UserQuery):
    try:
        if _agents_available:
            try:
                answer = await _run_with_agents(query.query)
                return {"role": "assistant", "content": answer}
            except Exception as agent_err:
                print(f"[AgentPipeline ERROR] {agent_err}")
                if "429" in str(agent_err):
                    print("[Fallback] Agent hit 429 quota. Trying direct gemini-2.5-flash fallback...")
                    # Immediate fallback to bypass pydantic-ai overhead
                    fallback_model = genai.GenerativeModel("gemini-2.5-flash")
                    fallback_response = await asyncio.to_thread(fallback_model.generate_content, query.query)
                    return {"role": "assistant", "content": fallback_response.text}
                
                print("[Fallback] Defaulting to direct gemini-2.5-flash...")

        answer = await _run_direct_gemini(query.query)
        return {"role": "assistant", "content": answer}

    except Exception as e:
        err = str(e)
        print(f"[AgentQuery ERROR] {err}")
        if "429" in err or ("quota" in err.lower() and "exceeded" in err.lower()):
            return {"role": "assistant", "content": "⚠️ Quota exceeded (429). Please wait a minute, then try again."}
        elif "api_key" in err.lower() or ("invalid" in err.lower() and "key" in err.lower()):
            return {"role": "assistant", "content": "🚨 Invalid API key. Check `backend/.env`"}
        return {"role": "assistant", "content": f"Error: {err}"}


@app.get("/workflow/latest")
async def get_latest():
    if not latest_workflow:
        return {}
    state = latest_workflow.get("state")
    if state:
        # Return real agent pipeline data for the dashboard
        try:
            from backend.models.schemas import PermitState
            if isinstance(state, PermitState):
                return state.model_dump()
        except Exception:
            pass
    # Fallback to basic structure
    return {
        "business_profile": {"raw_query": latest_workflow.get("business", "")},
        "execution_plan": {
            "steps": [
                "Register business with trade registry",
                "Apply for workplace license (İşyeri Açma ve Çalışma Ruhsatı)",
                "Pass fire safety inspection",
                "Obtain health & sanitation approval",
                "Final municipal inspection and permit issuance"
            ],
            "assigned_agents": ["PermitOps AI"] * 5
        },
        "permit_plan": {
            "permits": ["İşyeri Açma ve Çalışma Ruhsatı", "Fire Safety Certificate", "Health Safety Certificate"],
            "agencies": ["Beşiktaş Municipality", "Istanbul Fire Department", "Ministry of Health"],
            "documents": ["Tax registration certificate", "Lease agreement", "Floor plan", "ID/Passport copy", "Application form"]
        },
        "last_updated": "2026-03-13T05:00:00"
    }


@app.post("/business/intake")
async def business_intake(query: UserQuery):
    return await agent_query(query)


@app.post("/api/submit-edevlet")
async def submit_edevlet(creds: UserCredentials):
    try:
        from backend.bot import run_edevlet_bot
        # Simulate passing the required documents to the bot based on latest workflow
        docs_to_upload = ["lease_agreement.pdf", "tax_certificate.pdf"]
        
        # Run playwright bot in a background thread to prevent blocking FastAPI
        result = await asyncio.to_thread(
            asyncio.run,
            run_edevlet_bot(creds.tckn, creds.password, docs_to_upload)
        )
        
        if result["status"] == "success":
            # Update the mock workflow state to show progression
            if "execution_plan" in latest_workflow:
                if len(latest_workflow["execution_plan"]["steps"]) > 1:
                    latest_workflow["execution_plan"]["steps"][1] = "Completed: " + latest_workflow["execution_plan"]["steps"][1]
            latest_workflow["last_updated"] = "Just now"

        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
