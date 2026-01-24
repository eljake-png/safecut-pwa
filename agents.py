from crewai import Agent, LLM

# --- CONFIGURATION (M3 Ultra) ---

# DeepSeek R1 - Найкращий для складних скриптів
sysadmin_model = LLM(
    model="ollama/deepseek-r1:70b", 
    base_url="http://localhost:11434",
    temperature=0.1
)

# Qwen Coder - Найкращий для React/Next.js
coder_model = LLM(
    model="ollama/qwen2.5-coder:32b", 
    base_url="http://localhost:11434",
    temperature=0.2
)

class WindowsDevTeam:
    def windows_sysadmin(self):
        return Agent(
            role='Windows Server Administrator',
            goal='Автоматизувати розгортання Node.js серверу на Windows 10/11 без Docker Desktop.',
            backstory='Ти гуру PowerShell. Ти знаєш, що Docker на Windows може їсти багато RAM, тому ти віддаєш перевагу нативному запуску Node.js через PM2 або просто через консоль. Ти знаєш команду `winget` і вмієш налаштовувати Cloudflare Tunnel на Windows.',
            llm=sysadmin_model,
            verbose=True
        )

    def fullstack_dev(self):
        return Agent(
            role='Senior React Developer',
            goal='Створити фінальну сторінку MVP з підключенням гаманця.',
            backstory='Ти поєднуєш красивий UI (Tailwind) з логікою Web3 (Wagmi). Твоя задача - видати готовий код сторінки, де користувач бачить свій баланс і кнопку "Оплатити".',
            llm=coder_model,
            verbose=True
        )