import sys
from crewai import Crew, Process
from agents import WindowsDevTeam
from tasks import WindowsTasks

team = WindowsDevTeam()
tasks = WindowsTasks()

# Агенти
win_admin = team.windows_sysadmin()
react_dev = team.fullstack_dev()

# Завдання
task_deploy = tasks.powershell_deployment_script(win_admin)
task_page = tasks.create_mvp_page(react_dev)

# Запуск
crew = Crew(
    agents=[win_admin, react_dev],
    tasks=[task_deploy, task_page],
    process=Process.sequential,
    verbose=True
)

print("### ЗАПУСК OPERATION WINDOWS BUNKER ###")
print("### Target: Ryzen 5 3600 (Windows 64-bit) ###")
result = crew.kickoff()

with open("Safecut_Windows_MVP.md", "w") as f:
    f.write(str(result))

print("\n\nРезультат збережено у Safecut_Windows_MVP.md")