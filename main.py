from crewai import Crew, Process
from agents import architect, developer, tester, mentor
from tasks import arch_plan, coding_task, verification_task, final_report

# Збираємо команду
safecut_crew = Crew(
    agents=[architect, developer, tester, mentor],
    tasks=[arch_plan, coding_task, verification_task, final_report],
    process=Process.sequential, # Послідовно, щоб Mistral бачив результати всіх
    verbose=True
)

# Запуск
if __name__ == "__main__":
    print("### Запуск локальної агенції Safecut (M3 Ultra) ###")
    result = safecut_crew.kickoff()
    print("##################################################")
    print("Завдання виконано. Перевір loyalty_report.md")