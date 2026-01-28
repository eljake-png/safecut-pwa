from crewai import Crew, Process
from agents import architect, developer, tester, mentor
from tasks import arch_task, dev_task, qa_task, finance_task

# Формуємо команду Safecut
safecut_team = Crew(
    agents=[architect, developer, tester, mentor],
    tasks=[arch_task, dev_task, qa_task, finance_task],
    process=Process.sequential, # Сувора послідовність: План -> Код -> Тест -> Гроші
    verbose=True,
    memory=True # Дозволяє агентам пам'ятати контекст попередніх кроків
)

if __name__ == "__main__":
    print("##################################################")
    print("### ЗАПУСК SAFECUT AI DEV TEAM (M3 ULTRA MODE) ###")
    print("##################################################")
    print("⚠️  УВАГА: Агенти мають права на запис файлів.")
    
    result = safecut_team.kickoff()
    
    print("\n\n##################################################")
    print("### РОБОТУ ЗАВЕРШЕНО ###")
    print("1. Перевір оновлений файл: src/app/loyalty/page.tsx")
    print("2. Перевір новий файл: src/lib/loyalty.ts")
    print("3. Прочитай фінансовий звіт: loyalty_final_report.md")
    print("##################################################")