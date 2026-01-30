import os
from crewai import Crew, Process
from agents import SafecutAgents
from tasks import SafecutTasks

def load_safecut_bible():
    bible_path = 'safecut_bible.txt'
    if os.path.exists(bible_path):
        with open(bible_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        return ""

bible_content = load_safecut_bible()
print(f"Loaded Bible Context ({len(bible_content)} chars)")

agents = SafecutAgents()
tasks = SafecutTasks(context_rules=bible_content)

# Ініціалізація агентів
tech = agents.tech_lead()
market = agents.market_analyst()
biz = agents.business_strategist()
socio = agents.sociologist()
marketer = agents.marketing_director()
sim = agents.simulation_expert()
auditor = agents.chief_auditor() # Наш новий шериф
ceo = agents.ceo()

safecut_crew = Crew(
    agents=[tech, market, biz, socio, marketer, sim, auditor, ceo],
    tasks=[
        tasks.code_analysis_task(tech),
        tasks.market_research_task(market),
        tasks.commission_logic_task(biz),
        tasks.logistics_task(biz), # Strategist робить логістику (DeepSeek добре рахує)
        tasks.sociology_task(socio),
        tasks.marketing_task(marketer),
        tasks.simulation_run_task(sim),
        tasks.audit_task(auditor), # Аудитор перевіряє всіх
        tasks.final_strategy_task(ceo) # CEO виправляє помилки
    ],
    process=Process.sequential,
    verbose=True,
    memory=False
)

print("Starting Safecut Agency with Chief Auditor...")
result = safecut_crew.kickoff()
print("Done.")