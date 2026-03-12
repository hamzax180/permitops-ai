import os
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from backend.models.schemas import ExecutionPlan, PermitPlan

load_dotenv()

# Planner Agent Definition
planner_agent = Agent(
    'openai:gpt-4o', # Using gpt-4o as a reliable default for complex planning
    result_type=ExecutionPlan,
    system_prompt="""
You are the Lead Architect for PermitOps AI. 
Your goal is to parse user requests for starting a business in Turkey and generate a multi-step execution plan.
You assign tasks to specialized agents:
- Permit Classifier: Identifies legal requirements.
- Checklist Generator: Lists required documents.
- Validator: Checks document consistency.
- Status Agent: Updates the user on progression.

Break down the user's request into logical, sequential steps.
""",
)

# Permit Classification Agent
classifier_agent = Agent(
    'openai:gpt-4o',
    result_type=PermitPlan,
    system_prompt="""
You are a Turkish Regulatory Expert. 
Based on the business profile (type, size, location), determine the EXACT permits required.
Focus on Beşiktaş district regulations if specified.
Output must include permits (e.g., Workplace License, Fire Inspection), the relevant agencies, and necessary documents.
""",
)
