import os

# Назва папки для знань
folder_name = "knowledge"

# Створюємо папку, якщо її немає
if not os.path.exists(folder_name):
    os.makedirs(folder_name)
    print(f"📂 Папку '{folder_name}' створено.")
else:
    print(f"📂 Папка '{folder_name}' вже існує.")

# --- ЗМІСТ ФАЙЛІВ ---

strategy_text = """
=== SAFECUT STRATEGY MEMO (2026) ===

PROJECT: Safecut
LOCATION: Rivne, Pivnichnyi District
CEO: Elis Jake

1. VISION
Побудова автономного сервісу "віртуальний барбершоп" з виїздом майстра додому.
Ми відмовляємося від класичних барбершопів (оренда приміщень) на користь мобільності та преміум-сервісу вдома у клієнта.

2. INDEPENDENCE & TECH STACK
Ми відмовляємося від FlutterFlow та платних підписок.
- Frontend: PWA (Progressive Web App) на чистому Flutter або Next.js.
- Backend: Власний сервер (VPS) або локальний хостинг.
- Database: Supabase або PostgreSQL (Self-hosted).
- AI Architecture: Локальні агенти на Mac Studio M3 Ultra.

3. CORE VALUES
- Privacy: Дані клієнтів (адреси, телефони) зберігаються на зашифрованому власному сервері.
- Autonomy: Бізнес-процеси (запис, логістика, каса) керуються AI-агентами.
- Scalability: Модель "Північний" має бути тестовим полігоном перед масштабуванням на все місто.
"""

structure_text = """
=== AGENCY STRUCTURE & ROLES ===

LEVEL 1: LEADERSHIP
-------------------
Role: CEO
Human: Elis Jake
Responsibilities: Final Strategy, Capital Allocation, Key Decisions.

Role: Business Mentor / Advisor
Model: DeepSeek R1 (70B)
Responsibilities:
- Стратегічний аналіз ризиків.
- Оцінка архітектурних рішень.
- "Адвокат диявола" для ідей CEO.

Role: Chief of Staff
Model: Llama 3.3 (70B)
Responsibilities:
- Операційне управління.
- Перетворення стратегії на таски.
- Координація технічних агентів.

LEVEL 2: EXECUTION (THE CREW)
-----------------------------
Role: Senior Fullstack Developer
Model: Qwen 2.5 Coder (32B) / DeepSeek R1
Responsibilities:
- Написання коду (Dart/JS/Python).
- Проєктування бази даних.

Role: DevOps & Server Admin
Model: Qwen 2.5 Coder (32B)
Responsibilities:
- Налаштування VPS/Linux.
- Docker, CI/CD, Backups.

Role: Finance & Ops Analyst
Model: Llama 3.1 (70B)
Responsibilities:
- Розрахунок юніт-економіки.
- Логістика виїздів.
"""

roadmap_text = """
=== SAFECUT LAUNCH ROADMAP (8 WEEKS) ===

PHASE 1: FOUNDATION (Weeks 1-2)
- [x] Setup Local AI Agency on Mac Studio.
- [ ] Finalize DB Schema (Supabase/PostgreSQL).
- [ ] Setup Development Environment (Git, Docker).
- [ ] Approve Technical Specification.

PHASE 2: CORE DEVELOPMENT (Weeks 3-5)
- [ ] Develop "Booking Core" (Back-end logic).
- [ ] Create PWA Interface (Front-end).
- [ ] Implement Geolocation logic for Pivnichnyi district.
- [ ] Local Testing on Mac Studio.

PHASE 3: INFRASTRUCTURE (Week 6)
- [ ] Setup VPS Server.
- [ ] Configure SSL & Security Rules.
- [ ] Deploy Database & PWA.

PHASE 4: MVP LAUNCH (Weeks 7-8)
- [ ] Closed Beta Test (Friends & Family).
- [ ] First Real Orders from Pivnichnyi.
- [ ] AI-Dispatcher Activation.
"""

# --- СЛОВНИК ФАЙЛІВ ---
files_to_create = {
    "strategy_memo.txt": strategy_text,
    "agency_structure.txt": structure_text,
    "roadmap.txt": roadmap_text
}

# --- ЗАПИС ФАЙЛІВ ---
for filename, content in files_to_create.items():
    file_path = os.path.join(folder_name, filename)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"✅ Файл '{filename}' успішно створено.")

print("\n🎉 Етап 4 завершено! Ваші агенти тепер мають контекст проєкту.")
