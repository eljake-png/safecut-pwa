from crewai import Agent, LLM
from crewai_tools import FileReadTool, FileWriterTool

# --- ІНСТРУМЕНТИ ---
file_read_tool = FileReadTool()
file_write_tool = FileWriterTool()

# --- КОНФІГУРАЦІЯ МОДЕЛЕЙ (OLLAMA LOCAL) ---
mentor_llm = LLM(model="ollama/deepseek-r1:70b", base_url="http://localhost:11434")
cos_llm = LLM(model="ollama/llama3.3:70b", base_url="http://localhost:11434")
dev_llm = LLM(model="ollama/qwen2.5-coder:32b", base_url="http://localhost:11434")

# --- АГЕНТИ ---

mentor = Agent(
    role='Safecut Strategic Advisor',
    goal='Аналізувати бізнес-логіку та валідувати рішення CEO.',
    backstory='Стратег, який бачить ризики наперед.',
    llm=mentor_llm,
    verbose=True
)

chief_of_staff = Agent(
    role='Chief of Staff',
    goal='Координувати роботу та ставити чіткі ТЗ.',
    backstory='Менеджер проєктів, права рука CEO.',
    llm=cos_llm,
    verbose=True
)

developer = Agent(
    role='Senior Fullstack Developer',
    goal='Писати реальний код у файли. Читати вимоги з файлів.',
    backstory='Інженер, який вміє працювати з файловою системою.',
    llm=dev_llm,
    verbose=True,
    tools=[file_read_tool, file_write_tool], # <--- ТЕПЕР ВІН МАЄ РУКИ
    allow_delegation=False
)