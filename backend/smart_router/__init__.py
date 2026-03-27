"""
smart_router/__init__.py
------------------------
Public entry point for the Smart Router module.

Priority order (highest to lowest cost):
  1. Cache hit          → 0 tokens
  2. Keyword match      → 0 tokens  (picks random variation from response_library)
  3. AI fallback        → ≤100 tokens (only when 1 & 2 both fail)

Usage in main.py:
    from smart_router import smart_router_handle

    result = await smart_router_handle(
        query=query_text,
        assistant_type=assistant_type,
        user_name=user.full_name if user else "",
        gemini_model=gemini_model,
        student_model=student_model,
        lawyer_model=lawyer_model,
    )
    if result is not None:
        # Serve immediately — skip orchestrators
        return {"role": "assistant", "content": result}
    # else: fall through to existing permit/student/lawyer pipeline
"""

import random
import json
import os
from typing import Optional

from .keyword_router import detect_intent
from .template_engine import render, build_variables
from . import cache as response_cache
from .ai_fallback import ai_fallback_response

# ---------------------------------------------------------------------------
# Load response library once at module import time
# ---------------------------------------------------------------------------
_LIBRARY_PATH = os.path.join(os.path.dirname(__file__), "response_library.json")
_library: dict = {}

try:
    with open(_LIBRARY_PATH, "r", encoding="utf-8") as f:
        _library = json.load(f)
    print("[SmartRouter] Response library loaded successfully.")
except Exception as e:
    print(f"[SmartRouter] WARNING: Failed to load response library: {e}")


# ---------------------------------------------------------------------------
# Patterns that signal a NEW CONSULTATION — always route to orchestrator.
# These queries need the full structured dashboard, not a canned reply.
# ---------------------------------------------------------------------------
import re

_NEW_CONSULTATION_PATTERNS = [
    # "I want to open / start / launch X"
    r"\b(i want to|i'd like to|i plan to|i'm planning to|i am planning to|how (do i|can i|to))\b.{0,30}\b(open|start|launch|set up|setup|register|create)\b",
    # "open a restaurant/cafe/shop in X"
    r"\bopen (a |an |my )?[\w\s]{1,30}(in|at|near)\b",
    # "want to open"
    r"\bwant to (open|start|register|set up)\b",
    # "how do I open / start / register"
    r"\bhow (do i|can i|to) (open|start|register|set up|get a permit|apply for)\b",
    # "I need a permit for"
    r"\b(need|get|apply for|obtain) (a |an )?(permit|ruhsat|lisans|licence|license)\b",
    # Student: enroll at / register for university
    r"\b(enroll|register|apply) (at|for|to|in) (a |the |my )?university\b",
    # Lawyer: I need legal help for / I need to form a company
    r"\b(form|create|register|incorporate|set up) (a |my |an )?(company|business|firm|ltd|aş)\b",
    r"\b(i need|i have|i got) (a |an )?(legal|contract|lawyer|employment) (problem|issue|dispute|case|question|matter)\b",
]
_NEW_CONSULTATION_RE = re.compile(
    "|".join(_NEW_CONSULTATION_PATTERNS), flags=re.IGNORECASE
)


# ---------------------------------------------------------------------------
# Internal: pick a random response from the library
# ---------------------------------------------------------------------------

def _pick_response(intent_group: Optional[str], sub_intent: Optional[str]) -> Optional[str]:
    """
    Navigate the library by (intent_group, sub_intent) and return a random entry.
    Returns None if no matching entry is found.
    """
    if not intent_group:
        return None

    # Top-level flat list (e.g. greeting, farewell, thanks)
    if intent_group in _library and isinstance(_library[intent_group], list):
        return random.choice(_library[intent_group])

    # Nested dict (e.g. permit.restaurant, student.renew_id)
    group_data = _library.get(intent_group)
    if isinstance(group_data, dict) and sub_intent:
        options = group_data.get(sub_intent)
        if options:
            return random.choice(options)

    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def smart_router_handle(
    query: str,
    assistant_type: str = "permit",
    user_name: str = "",
    language: str = "en",
    gemini_model=None,
    student_model=None,
    lawyer_model=None,
) -> Optional[str]:
    """
    Try to handle the query without (or with minimal) AI usage.

    Returns:
        A ready-to-send response string, or None if this query needs
        the full orchestrator pipeline.
    """

    # ------------------------------------------------------------------
    # 1. Cache check (0 tokens)
    # ------------------------------------------------------------------
    cached = response_cache.get(query)
    if cached:
        return cached

    # ------------------------------------------------------------------
    # 0.5. NEW CONSULTATION GUARD — offline dynamic dashboard (0 tokens)
    # If the query is an initial plan request, we bypass AI completely
    # and generate the 14-step permit dashboard directly in Python.
    # ------------------------------------------------------------------
    if _NEW_CONSULTATION_RE.search(query):
        print(f"[SmartRouter] NEW CONSULTATION detected — generating dashboard offline (0 tokens) for {assistant_type}")
        
        from models.schemas import PermitState, CombinedPermitResult, ExecutionPlan, StepDetail, PermitPlan
        from utils.protocol import get_localized_steps
        from datetime import datetime

        dashboard_dump = None
        out_str = None
        
        if assistant_type == "permit":
            # Determine business sub-intent
            _, sub, _ = detect_intent(query, "permit")
            business_type = sub.title() if sub else "Business"
            
            # Determine location
            district = "Istanbul"
            districts = ["Kadikoy", "Kadıköy", "Besiktas", "Beşiktaş", "Sisli", "Şişli", "Uskudar", "Üsküdar", "Zeytinburnu", "Bakirkoy", "Bakırköy", "Beyoglu", "Beyoğlu", "Fatih", "Sariyer", "Sarıyer"]
            lower_q = query.lower()
            for d in districts:
                if d.lower() in lower_q:
                    district = d.title()
                    break

            if language == "tr":
                permits = ["İşyeri Açma ve Çalışma Ruhsatı"]
                agencies = ["Belediye", "Vergi Dairesi"]
                docs = ["Kimlik", "Kira Sözleşmesi", "Vergi Levhası", "NACE Kodu Belgesi"]
                summ = f"Bu, {district} bölgesinde bir {business_type} açmak için çevrimdışı oluşturulmuş yol haritanızdır. İşlemleri takip etmek için soldaki Gösterge Paneli'ne (Dashboard) gidin."
                labels = {"ag":"Kurumlar", "dc":"Gerekli Belgeler", "st":"Adımlar", "tm":"Süre", "dy":"gün"}
            elif language == "ar":
                permits = ["İşyeri Açma ve Çalışma Ruhsatı"]
                agencies = ["البلدية", "مكتب الضرائب"]
                docs = ["الهوية", "عقد الإيجار", "اللوحة الضريبية", "وثيقة رمز NACE"]
                summ = f"هذه هي خريطة الطريق الآلية التي تم إنشاؤها لفتح {business_type} في منطقة {district}. اذهب إلى لوحة التحكم (Dashboard) لبدء العملية."
                labels = {"ag":"المؤسسات", "dc":"المستندات المطلوبة", "st":"الخطوات", "tm":"الجدول الزمني", "dy":"يوم"}
            else:
                permits = ["Workplace Operating License"]
                agencies = ["District Municipality", "Tax Office"]
                docs = ["ID / Passport", "Lease Agreement", "Tax Plate", "NACE Code Certificate"]
                summ = f"This is your automated roadmap to officially open a {business_type} in {district}. Go to the Dashboard on the left to start your application process."
                labels = {"ag":"Institutions/Agencies", "dc":"Required Docs", "st":"Action Steps", "tm":"Timeline", "dy":"days"}

            timeline = 30
            if business_type.lower() in ["restaurant", "cafe", "bakery", "food"]:
                timeline = 45
                if language == "tr":
                    permits.extend(["İtfaiye Uygunluk Raporu", "Baca Uygunluğu"])
                    docs.extend(["İtfaiye Raporu"])
                    agencies.extend(["İBB İtfaiye Daire Başkanlığı"])
                elif language == "ar":
                    permits.extend(["تقرير الإطفاء", "ملاءمة المدخنة"])
                    docs.extend(["تقرير المطافئ"])
                    agencies.extend(["إدارة الإطفاء في البلدية"])
                else:
                    permits.extend(["Fire Safety Report", "Chimney Compliance"])
                    docs.extend(["Fire Report"])
                    agencies.extend(["Fire Department"])

        elif assistant_type == "student":
            business_type = "Student"
            district = "Istanbul"
            timeline = 30
            
            if language == "tr":
                permits = ["Öğrenci Kaydı", "Öğrenci İkamet İzni"]
                agencies = ["Öğrenci İşleri", "Göç İdaresi", "SGK"]
                docs = ["Pasaport", "Kabul Mektubu", "Sağlık Sigortası", "Biyometrik Fotoğraf"]
                summ = "Üniversite kayıt ve öğrenci kimliği işlemleriniz için oluşturulan adım adım yol haritanız. Süreci yan panelden (Dashboard) takip edebilirsiniz."
                labels = {"ag":"Kurumlar", "dc":"Gerekli Belgeler", "st":"Adımlar", "tm":"Süre", "dy":"gün"}
            elif language == "ar":
                permits = ["تسجيل الجامعة", "إقامة الطالب"]
                agencies = ["شؤون الطلاب", "إدارة الهجرة", "SGK"]
                docs = ["جواز السفر", "خطاب القبول", "التأمين الصحي", "صور شخصية"]
                summ = "خريطة الطريق الآلية لاستكمال التسجيل الجامعي وإقامة الطالب. يرجى المتابعة من لوحة التحكم."
                labels = {"ag":"المؤسسات", "dc":"المستندات المطلوبة", "st":"الخطوات", "tm":"الجدول الزمني", "dy":"يوم"}
            else:
                permits = ["University Registration", "Student Residence Permit"]
                agencies = ["Student Affairs", "Migration Directorate (Göç İdaresi)", "SGK"]
                docs = ["Passport", "Acceptance Letter", "Health Insurance", "Biometric Photos"]
                summ = "Your automated roadmap for completing university registration and obtaining your Student Residence Permit. Follow the steps in the Dashboard."
                labels = {"ag":"Institutions/Agencies", "dc":"Required Docs", "st":"Action Steps", "tm":"Timeline", "dy":"days"}

        elif assistant_type == "lawyer":
            business_type = "Lawyer"
            district = "Turkey"
            timeline = 15
            
            if language == "tr":
                permits = ["Hukuki İşlem"]
                agencies = ["Noter", "Mahkeme / Adliye"]
                docs = ["Kimlik", "Sözleşme / Evrak", "Vekaletname"]
                summ = "Hukuki süreciniz için hazırladığımız çözüm adımları. Görüşmeyi başlatmak veya belgeleri yüklemek için Dashboard panelini kullanabilirsiniz."
                labels = {"ag":"Kurumlar", "dc":"Gerekli Belgeler", "st":"Adımlar", "tm":"Süre", "dy":"gün"}
            elif language == "ar":
                permits = ["الإجراء القانوني"]
                agencies = ["كاتب العدل", "المحكمة"]
                docs = ["الهوية", "العقد / المستندات", "توكيل قانوني"]
                summ = "خطوات العملية القانونية الخاصة بك. يمكنك استخدام لوحة التحكم لبدء التشاور أو رفع المستندات."
                labels = {"ag":"المؤسسات", "dc":"المستندات المطلوبة", "st":"الخطوات", "tm":"الجدول الزمني", "dy":"يوم"}
            else:
                permits = ["Legal Procedure"]
                agencies = ["Notary Public", "Courthouse"]
                docs = ["ID Card", "Contracts / Evidence", "Power of Attorney"]
                summ = "Here are the outlined steps for your legal procedure. Please use the Dashboard to upload documents or execute actions."
                labels = {"ag":"Institutions/Agencies", "dc":"Required Docs", "st":"Action Steps", "tm":"Timeline", "dy":"days"}
        else:
            return None

        step_specs = get_localized_steps(language, business_type)
        details = []
        steps_list = []
        for id_val, title, resp, note in step_specs:
            details.append(StepDetail(id=id_val, title=title, responsible=resp, status="pending", notes=note))
            steps_list.append(title)
            
        combined = CombinedPermitResult(
            permits=permits, agencies=agencies, documents=docs, steps=steps_list, 
            timeline_days=timeline, summary=summ, location=district, business_type=business_type
        )
        
        state = PermitState(
            business_profile={"raw_query": query, "language": language},
            combined_result=combined,
            permit_plan=PermitPlan(permits=permits, agencies=agencies, documents=docs),
            execution_plan=ExecutionPlan(steps=details, assigned_agents=["Planner", "Classifier"]),
            last_updated=datetime.now()
        )
        
        out_str = (
            f"💬 {summ}\n\n"
            f"📋 **{labels['ag']}:** {', '.join(agencies)}\n"
            f"📄 **{labels['dc']}:** {', '.join(docs[:6])}...\n"
            f"✅ **{labels['st']}:**\n" + "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps_list)) +
            f"\n\n⏱️ **{labels['tm']}:** {timeline} {labels['dy']}"
        )
        
        dashboard_dump = state.model_dump()
        # Ensure datetimes are ISO for JSON
        if hasattr(dashboard_dump.get("last_updated"), "isoformat"):
            dashboard_dump["last_updated"] = dashboard_dump["last_updated"].isoformat()
            
        # Return tuple: (message, dictionary)
        return out_str, dashboard_dump

    # ------------------------------------------------------------------
    # 2. Keyword match → predefined response (0 tokens)
    # ------------------------------------------------------------------
    intent_group, sub_intent, confidence = detect_intent(query, assistant_type)

    if confidence > 0:
        raw_response = _pick_response(intent_group, sub_intent)

        if raw_response:
            variables = build_variables(user_name=user_name)
            response = render(raw_response, variables)

            # Cache this predefined response so repeated queries skip even step 2
            response_cache.set(query, response)

            print(
                f"[SmartRouter] KEYWORD HIT — intent={intent_group}.{sub_intent}, "
                f"assistant={assistant_type}"
            )
            return response

    # ------------------------------------------------------------------
    # 3. AI fallback — only for ambiguous queries that don't match
    #    any domain-specific keyword (permits, registration, legal steps).
    #    Complex domain queries fall through to orchestrators.
    # ------------------------------------------------------------------
    _DOMAIN_PASS_THROUGH_GROUPS = {"permit", "student", "lawyer"}

    if intent_group in _DOMAIN_PASS_THROUGH_GROUPS:
        # The query IS domain-specific but we had no predefined response for that sub-intent.
        # Let the full orchestrator handle it for rich structured output.
        print(
            f"[SmartRouter] PASS-THROUGH — domain-specific query with no library response "
            f"({intent_group}.{sub_intent}). Routing to orchestrator."
        )
        return None

    # Generic / ambiguous query — use AI fallback with 100-token cap
    ai_response = await ai_fallback_response(
        query=query,
        assistant_type=assistant_type,
        gemini_model=gemini_model,
        student_model=student_model,
        lawyer_model=lawyer_model,
    )

    if ai_response:
        # Cache the AI response to avoid paying for it again
        response_cache.set(query, ai_response)
        return ai_response

    # Everything failed — let the orchestrator take over
    return None
