from crewai import Crew
from agents import mentor, chief_of_staff, developer
from tasks import ui_coding_task  # Імпортуємо нове завдання

# --- ЗБІРКА ЕКІПАЖУ ---
safecut_crew = Crew(
    agents=[developer], # Зараз працює тільки розробник, щоб не гаяти час
    tasks=[ui_coding_task],
    verbose=True,
    memory=False
)

# --- ЗАПУСК ---
print("### ЗАПУСК РОЗРОБКИ UI SAFECUT ###")
result = safecut_crew.kickoff()
print(result)