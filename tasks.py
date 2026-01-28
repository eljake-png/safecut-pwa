from crewai import Task
from agents import architect, developer, tester, mentor

# Task 1: Проектування (Архітектор)
arch_task = Task(
    description=(
        "1. Проаналізуй `src/lib/firebase.ts` та структуру папок.\n"
        "2. Сформуй структуру об'єкта `loyalty` для колекції `clients`.\n"
        "3. Визнач, які саме функції треба створити в `src/lib/loyalty.ts`.\n"
        "Результат запиши у файл `knowledge/loyalty_specs_v2.md`."
    ),
    expected_output="Файл специфікації Markdown.",
    agent=architect
)

# Task 2: Кодинг (Девелопер) - ПЕРЕПИСУЄ ФАЙЛ
dev_task = Task(
    description=(
        "На основі специфікації від Архітектора:\n"
        "1. Створи файл `src/lib/loyalty.ts`: додай функцію `incrementHaircutCount(clientId)`.\n"
        "2. ПОВНІСТЮ ПЕРЕПИШИ `src/app/loyalty/page.tsx`.\n"
        "   - Видали згадки про WalletConnect та крипту.\n"
        "   - Реалізуй UI: Прогрес бар (наприклад, 7/10), історія стрижок.\n"
        "   - Стиль: Dark theme, Tailwind, мінімалізм.\n"
        "3. Використовуй `FileWriteTool` для збереження коду."
    ),
    expected_output="Готові файли `src/lib/loyalty.ts` та оновлений `page.tsx`.",
    agent=developer,
    context=[arch_task]
)

# Task 3: QA Loop (Тестувальник) - ФІКСИТЬ БАГИ
qa_task = Task(
    description=(
        "1. Прочитай новостворені файли `src/app/loyalty/page.tsx` та `src/lib/loyalty.ts`.\n"
        "2. Перевір на типові помилки React (hooks dependency, imports).\n"
        "3. Перевір безпеку Firebase (чи не пише клієнт сам собі бонуси на клієнті).\n"
        "4. ЯКЩО ЗНАЙДЕНО ПОМИЛКИ: Використовуй `FileWriteTool`, щоб перезаписати файл з виправленнями.\n"
        "5. Якщо помилок немає — дай статус 'APPROVED'."
    ),
    expected_output="Звіт про тестування та, за потреби, виправлені файли коду.",
    agent=tester,
    context=[dev_task]
)

# Task 4: Фінансова перевірка (Ментор)
finance_task = Task(
    description=(
        "Проведи фінансовий аудит нової системи лояльності:\n"
        "1. Використовуй ціни: Чоловіча стрижка - 500 грн, Борода - 100 грн, Дитяча - 300 грн.\n"
        "2. Розрахуй LTV (Lifetime Value) клієнта за 10 візитів.\n"
        "3. Розрахуй відсоток втрат на 10-й безкоштовній стрижці.\n"
        "4. Підготуй фінальний звіт `loyalty_final_report.md` з вердиктом: чи вигідна ця модель."
    ),
    expected_output="Файл `loyalty_final_report.md` з розрахунками.",
    agent=mentor,
    context=[arch_task, dev_task, qa_task],
    output_file='loyalty_final_report.md' # Автоматично збереже звіт
)