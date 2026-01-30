from crewai import Agent, LLM
from tools import list_files_tool, read_file_tool, write_report_tool, marketing_tool, simulation_tool

# --- КОНФІГУРАЦІЯ LLM З ТАЙМ-АУТАМИ ---
def create_safecut_llm(model_name, temp=0.1):
    return LLM(
        model=f"ollama/{model_name}",
        base_url="http://localhost:11434",
        temperature=temp,
        timeout=300  # 5 хвилин для завантаження 120b моделей
    )

# Визначаємо моделі для різних ролей
mistral_heavy = create_safecut_llm("mistral-large:123b", temp=0.1)
deepseek_r1 = create_safecut_llm("deepseek-r1:70b", temp=0.0)
llama_fast = create_safecut_llm("llama3.3:70b", temp=0.7)
qwen_coder = create_safecut_llm("qwen2.5-coder:32b", temp=0.1)

class SafecutAgents:
    def _standard_agent_params(self):
        """Параметри для запобігання 'ліні' агентів."""
        return {
            "verbose": True,
            "allow_delegation": False,
            "max_iter": 5,
            "max_execution_time": 600 # 10 хвилин на спробу
        }

    def tech_lead(self):
        return Agent(
            role='Senior Tech Lead',
            goal='Проаналізувати код Safecut та знайти механізми Stealth/Loyalty.',
            backstory='Ти — архітектор, який бачить код наскрізь. Твій звіт — це технічна інструкція.',
            llm=mistral_heavy,
            tools=[list_files_tool, read_file_tool, write_report_tool],
            **self._standard_agent_params()
        )

    def market_analyst(self):
        return Agent(
            role='Market Researcher',
            goal='Довести перевагу Safecut у районі Північний.',
            backstory='Ти знаєш кожен закуток Рівного. Ти оперуєш цифрами оренди та ризиками.',
            llm=llama_fast, 
            tools=[list_files_tool, read_file_tool, write_report_tool],
            **self._standard_agent_params()
        )

    def business_strategist(self):
        return Agent(
            role='Business Logic Expert',
            goal='Створити математичну модель комісії без "ліваків".',
            backstory='Твоя релігія — математика. Ти вираховуєш ідеальну точку прибутку.',
            llm=deepseek_r1,
            tools=[read_file_tool, write_report_tool],
            **self._standard_agent_params()
        )

    def sociologist(self):
        return Agent(
            role='Profiler',
            goal='Створити психологічний портрет клієнта в "затворі".',
            backstory='Ти розумієш страх перед ТЦК та потребу в безпеці. Ти знаєш, чому довіряють сусідам.',
            llm=llama_fast,
            tools=[read_file_tool, write_report_tool],
            **self._standard_agent_params()
        )

    def marketing_director(self):
        return Agent(
            role='Head of Growth',
            goal='Запустити прихований маркетинг у чатах ЖК.',
            backstory='Ти майстер партизанського маркетингу. Жодної прямої реклами — тільки рекомендації.',
            llm=mistral_heavy,
            tools=[read_file_tool, write_report_tool, marketing_tool],
            **self._standard_agent_params()
        )

    def simulation_expert(self):
        return Agent(
            role='Simulation Architect',
            goal='Прогнати модель через 100 віртуальних днів.',
            backstory='Ти бачиш майбутнє через код. Ти тестуєш гіпотези на міцність.',
            llm=qwen_coder,
            tools=[read_file_tool, write_report_tool, simulation_tool],
            **self._standard_agent_params()
        )

    def chief_auditor(self):
        return Agent(
            role='Chief Auditor',
            goal='Перевірити наявність усіх звітів та відсутність помилок у логіці.',
            backstory='Ти — фільтр. Якщо ти бачиш слово "кур\'єр" замість "барбер пішки" — ти відхиляєш таск.',
            llm=deepseek_r1,
            tools=[list_files_tool, read_file_tool, write_report_tool],
            **self._standard_agent_params()
        )

    def ceo(self):
        return Agent(
            role='CEO Safecut',
            goal='Затвердити фінальний Master Plan проекту.',
            backstory='Ти збираєш усі пазли в одну Stealth-імперію барбершопів.',
            llm=mistral_heavy,
            tools=[read_file_tool, write_report_tool],
            **self._standard_agent_params()
        )