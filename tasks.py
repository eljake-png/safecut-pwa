from crewai import Task
from agents import architect, developer, tester, mentor

# Task 1: Архітектурний план
arch_plan = Task(
    description='Вивчити структуру src/ та запропонувати зміни в Firebase (поле haircut_count). Прочитати knowledge/loyalty_logic.md.',
    expected_output='Технічне завдання для розробника з описом типів даних та шляхів файлів.',
    agent=architect
)

# Task 2: Написання коду (паралельно з тестом у CrewAI через context)
coding_task = Task(
    description='Створити компоненти в src/app/loyalty та логіку в src/lib/loyalty.ts.',
    expected_output='Фрагменти коду для Firebase Trigger та Frontend компонента.',
    agent=developer,
    context=[arch_plan]
)

# Task 3: Верифікація Firebase
verification_task = Task(
    description='Перевірити код розробника на відповідність правилам Firestore та оптимізацію запитів.',
    expected_output='Список зауважень або "Approved" статус для коду.',
    agent=tester,
    context=[coding_task]
)

# Task 4: Фінальний рапорт (Збирає все докупи)
final_report = Task(
    description='Зібрати звіти Архітектора, Девелопера та Тестувальника. Додати бізнес-прогноз щодо окупності 10-ї безкоштовної стрижки.',
    expected_output='Повний файл loyalty_report.md з усіма кодовими вставками та рекомендаціями.',
    agent=mentor,
    context=[arch_plan, coding_task, verification_task],
    output_file='loyalty_report.md'
)