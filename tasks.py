from crewai import Task
from agents import mentor, chief_of_staff, developer

# Оновлений шлях у tasks.py
ui_coding_task = Task(
    description=(
        "Ти працюєш у папці './app/src/app'. Це критично важливо! " # <--- ЗМІНИЛИ ШЛЯХ
        "1. ПРОЧИТАЙ файл 'knowledge/safecut_specs.md'. "
        "2. ПЕРЕПИШИ файл './app/src/app/page.tsx' (використовуй масив з Іваном та Максимом зі скріншотів). "
        "3. Переконайся, що компоненти імпортуються з './components/'. "
        "4. Додай 'use client' на початку page.tsx, оскільки ми будемо використовувати кнопки."
    ),
    expected_output="Оновлений реальний інтерфейс у браузері на localhost:3000.",
    agent=developer
)