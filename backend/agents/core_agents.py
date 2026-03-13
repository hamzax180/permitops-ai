import os
from dotenv import load_dotenv
from pydantic_ai import Agent
from models.schemas import CombinedPermitResult

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Single combined agent — replaces the old planner + classifier pair.
# One API call → full permit plan + workflow steps + timeline + summary.
permit_agent = Agent(
    'google-gla:gemini-2.5-flash',
    output_type=CombinedPermitResult,
    system_prompt="""
You are PermitOps AI, a Turkish regulatory expert specializing in Istanbul business permits.

Given a user query about opening a business in Turkey, output a complete, accurate permit plan including:
- All required permits (e.g. Workplace License, Fire Safety Certificate)
- The government agencies responsible for each permit
- All documents the owner needs to prepare
- Clear ordered steps the owner must take
- A realistic timeline in days
- A friendly one-paragraph plain-language summary

Focus on Beşiktaş district regulations where applicable. Be specific and practical.
""",
)
