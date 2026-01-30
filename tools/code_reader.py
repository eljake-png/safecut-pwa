import os

# Налаштування фільтрів
IGNORED_DIRS = {'.git', 'node_modules', 'build', '.dart_tool', 'ios', 'android', 'web', 'assets'}
ALLOWED_EXTENSIONS = {'.dart', '.yaml', '.json', '.md', '.ts', '.js'}

def get_project_codebase(root_path):
    """
    Сканує папку проекту і збирає весь текстовий контент 
    з важливих файлів в один великий рядок для аналізу.
    """
    code_content = []
    file_structure = []

    print(f"🔍 Починаю сканування проекту: {root_path}...")

    for root, dirs, files in os.walk(root_path):
        # Фільтрація папок
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in ALLOWED_EXTENSIONS:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_path)
                
                # Додаємо в структуру
                file_structure.append(rel_path)
                
                # Читаємо контент
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Додаємо маркер початку файлу для LLM
                        code_content.append(f"\n--- FILE: {rel_path} ---\n{content}")
                except Exception as e:
                    print(f"⚠️ Не вдалося прочитати {rel_path}: {e}")

    print(f"✅ Знайдено {len(file_structure)} файлів для аналізу.")
    
    return {
        "structure": "\n".join(file_structure),
        "full_content": "".join(code_content)
    }