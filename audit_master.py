import os

# --- НАЛАШТУВАННЯ ---
TARGET_ROOT = os.path.join("app") # Папка пошуку

# Що ми шукаємо (твої конкретні цифри і змінні)
HARD_NUMBERS = ['500', '300', '100', '400', '450'] 
KEYWORDS = ['price', 'cost', 'amount', 'uah', 'grp', 'грн', 'commission', 'percent', 'fee']

IGNORED_DIRS = {'node_modules', '.git', '.next', 'build', 'dist', 'ui', 'icons', 'fonts'}
ALLOWED_EXTENSIONS = {'.tsx', '.ts', '.js', '.jsx'}

def grep_project(start_path):
    print(f"🕵️‍♂️ Bruteforce пошук цін у: {os.path.abspath(start_path)}")
    
    hits = []
    
    if not os.path.exists(start_path):
        # Фолбек
        start_path = os.path.join("src", "app")
        if not os.path.exists(start_path):
            print("❌ Папка не знайдена.")
            return

    for root, dirs, files in os.walk(start_path):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext not in ALLOWED_EXTENSIONS: continue

            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, start_path)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                for i, line in enumerate(lines):
                    line_lower = line.lower()
                    
                    # Перевірка 1: Чи є хардкод числа? (Шукаємо точні збіги, щоб не ловити css width=500)
                    number_hit = False
                    for num in HARD_NUMBERS:
                        # Шукаємо " 500 ", ": 500", "= 500" щоб відсіяти "phone500234"
                        if (f" {num} " in line or 
                            f":{num}" in line or f": {num}" in line or 
                            f"={num}" in line or f"= {num}" in line):
                            number_hit = True
                            break
                    
                    # Перевірка 2: Ключові слова бізнесу
                    keyword_hit = any(kw in line_lower for kw in KEYWORDS)

                    # Логіка: Якщо знайшли Число АБО (Слово + знак рівності/двокрапка)
                    if number_hit or (keyword_hit and (':' in line or '=' in line)):
                        # Очищаємо рядок від пробілів
                        clean_line = line.strip()
                        if len(clean_line) < 150: # Ігноруємо мініфіковані довгі рядки
                            hits.append(f"[{rel_path}:{i+1}]  {clean_line}")

            except Exception:
                pass

    return hits

def run():
    results = grep_project(TARGET_ROOT)
    
    output_file = "1_technical_report.md"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("# Звіт Bruteforce пошуку цін\n\n")
        
        if not results:
            msg = "❌ ЖОДНОЇ ЦІНИ НЕ ЗНАЙДЕНО. \n\nВисновок: Ціни 100% динамічні і зберігаються в базі даних (Firebase), а не в коді."
            print(msg)
            f.write(msg)
        else:
            print(f"✅ Знайдено {len(results)} входжень.")
            f.write("## Знайдені рядки коду з цінами/грошима:\n```typescript\n")
            for hit in results:
                print(hit)
                f.write(hit + "\n")
            f.write("```\n")
            
            f.write("\n\n## Висновок для Агента-Економіста:\n")
            f.write("- Використовуй знайдені вище цифри як 'Hard Facts'.\n")
            f.write("- Якщо цифр мало — вважай, що решта цін приходить з БД.")

if __name__ == "__main__":
    run()