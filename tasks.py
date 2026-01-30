from crewai import Task

class SafecutTasks:
    def __init__(self, context_rules=""):
        self.context_rules = context_rules

    def _add_strict_instruction(self, description, target_file):
        """Створює ультимативну інструкцію для агента."""
        return (
            f"{description}\n\n"
            f"--- СУВОРИЙ ПРОТОКОЛ ВИКОНАННЯ ---\n"
            f"1. Твоя робота НЕ ПРИЙМАЄТЬСЯ у вигляді тексту в Final Answer.\n"
            f"2. ТИ МАЄШ викликати інструмент 'Write Report' для створення файлу: {target_file}.\n"
            f"3. У Final Answer напиши ТІЛЬКИ: 'Файл {target_file} створено', якщо інструмент спрацював.\n"
            f"4. ПРАВИЛА ПРОЕКТУ (BIBLE):\n{self.context_rules}"
        )

    def code_analysis_task(self, agent):
        file = "reports/1_tech_stealth_audit.md"
        return Task(
            description=self._add_strict_instruction(
                "Проаналізуй код. Перевір Stealth та Loyalty логіку через Read File.", file),
            expected_output=f"Технічне підтвердження від інструменту про створення {file}.",
            agent=agent
        )

    def market_research_task(self, agent):
        file = "reports/2_market_north_district.md"
        return Task(
            description=self._add_strict_instruction(
                "Порівняй салонну модель та Safecut для району Північний.", file),
            expected_output=f"Маркетинговий звіт, фізично записаний у {file}.",
            agent=agent
        )

    def commission_logic_task(self, agent):
        file = "reports/3_commission_logic.md"
        return Task(
            description=self._add_strict_instruction(
                "Розрахуй комісію (UAH/USDT). Обґрунтуй математично.", file),
            expected_output=f"Фінансова модель, записана у {file}.",
            agent=agent
        )

    def logistics_task(self, agent):
        file = "reports/4_logistics_walking.md"
        return Task(
            description=self._add_strict_instruction(
                "Склади таймінг: Тільки пішки, 10-15 хв радіус, дезінфекція.", file),
            expected_output=f"Логістичний план у файлі {file}.",
            agent=agent
        )

    def sociology_task(self, agent):
        file = "reports/5_sociology_home_visit.md"
        return Task(
            description=self._add_strict_instruction(
                "Опиши психологію клієнта (страх ТЦК, анонімність).", file),
            expected_output=f"Профайл клієнта, збережений у {file}.",
            agent=agent
        )

    def marketing_task(self, agent):
        file = "reports/6_marketing_stealth.md"
        return Task(
            description=self._add_strict_instruction(
                "Розроби стратегію 'Свій серед своїх' для закритих чатів ЖК.", file),
            expected_output=f"Стратегія маркетингу у файлі {file}.",
            agent=agent
        )

    def simulation_run_task(self, agent):
        file = "reports/7_simulation_results.md"
        return Task(
            description=self._add_strict_instruction(
                "Проведи симуляцію: 500 грн/стрижка, 5 клієнтів/день. Порівняй з салоном.", file),
            expected_output=f"Результати симуляції у файлі {file}.",
            agent=agent
        )

    def audit_task(self, agent):
        file = "reports/8_AUDIT_REPORT.md"
        return Task(
            description=(
                "1. Використай 'List Directory' для папки 'reports/'.\n"
                "2. Якщо якогось із файлів 1-7 НЕМАЄ — ПРОВАЛ. Не вигадуй вміст.\n"
                "3. Якщо файли є — перевір їх на відповідність правилам: ТІЛЬКИ ПІШКИ, ТІЛЬКИ ПІВНІЧНИЙ.\n"
                f"4. Запиши результат аудиту в {file}."
            ),
            expected_output=f"Звіт аудитора про цілісність системи у {file}.",
            agent=agent
        )

    def final_strategy_task(self, agent):
        file = "reports/9_FINAL_STRATEGY.md"
        return Task(
            description=self._add_strict_instruction(
                "Синтезуй Майстер-План на основі всіх попередніх звітів.", file),
            expected_output=f"Фінальний документ Safecut у {file}.",
            agent=agent
        )