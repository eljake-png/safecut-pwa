from crewai import Agent
# ВИПРАВЛЕНО: FileWriterTool замість FileWriteTool
from crewai_tools import DirectoryReadTool, FileReadTool, FileWriterTool 

# Ініціалізація інструментів
docs_tool = DirectoryReadTool(directory='./src')
file_read_tool = FileReadTool()
file_writer_tool = FileWriterTool() # ВИПРАВЛЕНО: Правильна ініціалізація класу

# 1. Архітектор (Devstral-2)
architect = Agent(
    role='System Architect',
    goal='Спроекувати безпечну міграцію з крипто-лояльності на лічильник стрижок',
    backstory=(
        "Ти відповідаєш за структуру даних. Твоє завдання — переконатися, що нова схема "
        "збереже цілісність бази даних. Ти не пишеш код, ти пишеш правила."
    ),
    tools=[docs_tool, file_read_tool], # Тільки читає
    llm='ollama/devstral-2:latest',
    verbose=True
)

# 2. Девелопер (Qwen 2.5 Coder)
developer = Agent(
    role='Senior Fullstack Developer',
    goal='Переписати модуль лояльності та створити бізнес-логіку',
    backstory=(
        "Ти досвідчений React/Next.js розробник. Твоє завдання — ПЕРЕПИСАТИ існуючий файл "
        "`src/app/loyalty/page.tsx`, видаливши звідти все про крипту. "
        "Ти використовуєш Tailwind CSS і зберігаєш темний стиль Safecut."
    ),
    # ВИПРАВЛЕНО: Використовуємо змінну file_writer_tool
    tools=[docs_tool, file_read_tool, file_writer_tool], 
    llm='ollama/qwen2.5-coder:32b',
    verbose=True,
    allow_delegation=False
)

# 3. Тестувальник (Gemma 3)
tester = Agent(
    role='Google Firebase Expert & QA',
    goal='Знайти вразливості та помилки в коді девелопера і виправити їх',
    backstory=(
        "Ти педантичний аудитор коду. Ти перевіряєш, чи правильно працюють хуки, "
        "чи немає витоку пам\'яті, і чи захищені записи в Firestore. "
        "Якщо ти бачиш помилку — ти її виправляєш у файлі."
    ),
    # ВИПРАВЛЕНО: Використовуємо змінну file_writer_tool
    tools=[docs_tool, file_read_tool, file_writer_tool], 
    llm='ollama/gemma3:27b',
    verbose=True
)

# 4. Бізнес Ментор (Mistral Large)
mentor = Agent(
    role='CFO & Strategy Mentor',
    goal='Фінансова верифікація моделі лояльності',
    backstory=(
        "Ти суворий фінансовий директор. Ти оперуєш тільки фактами. "
        "Твої дані: Стрижка = 500 грн, Борода = 100 грн, Дитяча = 300 грн. "
        "Ти маєш підтвердити, що 10-та безкоштовна стрижка не розорить бізнес."
    ),
    llm='ollama/mistral-large:123b',
    verbose=True
)