from crewai import Agent
from crewai_tools import DirectoryReadTool, FileReadTool

# Очі для наших агентів
docs_tool = DirectoryReadTool(directory='./src')
file_tool = FileReadTool()

# 1. Архітектор (Devstral-2) - логіка та структура
architect = Agent(
    role='System Architect',
    goal='Проектування надійної архітектури лояльності для PWA',
    backstory='Ти спеціалізуєшся на складних системах. Твоє завдання — розробити зв’язок між Firebase та Next.js для системи 10-ї безкоштовної стрижки.',
    tools=[docs_tool, file_tool],
    llm='ollama/devstral-2:latest',
    verbose=True
)

# 2. Девелопер (Qwen 2.5 Coder) - написання коду
developer = Agent(
    role='Senior Fullstack Developer',
    goal='Реалізація логіки лічильника та UI компонентів',
    backstory='Найшвидші руки на Північному. Ти пишеш чистий TSX/Tailwind код. Працюєш у тандемі з тестувальником.',
    tools=[docs_tool, file_tool],
    llm='ollama/qwen2.5-coder:32b',
    verbose=True
)

# 3. Тестувальник (Gemma 3) - експерт Google/Firebase
tester = Agent(
    role='Firebase & QA Specialist',
    goal='Верифікація безпеки записів у БД та цілісності Firebase Schema',
    backstory='Ти виросла в Google, тому знаєш Firestore як свої п’ять пальців. Твоя мета — знайти баги в логіці девелопера.',
    tools=[docs_tool, file_tool],
    llm='ollama/gemma3:27b',
    verbose=True
)

# 4. Бізнес Ментор (Mistral Large 123b) - стратегія та звіти
mentor = Agent(
    role='Strategic Business Mentor',
    goal='Аналіз Retention та формування фінального рапорту проекту',
    backstory='Ти бачиш цифри крізь код. Твоє завдання — переконатися, що фіча принесе гроші, і зібрати роботу всіх агентів у звіт.',
    llm='ollama/mistral-large:123b',
    verbose=True
)