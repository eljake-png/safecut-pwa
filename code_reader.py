import os

IGNORED_DIRS = {
    '.git', 'node_modules', 'build', '.dart_tool', '.idea', 'ios', 'android', 
    'web', 'assets', 'test', 'linux', 'macos', 'windows', '__pycache__'
}
ALLOWED_EXTENSIONS = {'.dart', '.ts', '.js', '.py'} 

# Функція приймає один обов'язковий аргумент, другий необов'язковий (для сумісності)
def get_project_codebase(root_path, verbose=False):
    code_content = []
    file_list = []

    if not os.path.exists(root_path):
        return {"structure": "", "full_content": ""}

    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in ALLOWED_EXTENSIONS:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_path)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if content.strip():
                            file_list.append(rel_path)
                            code_content.append(f"\n--- FILE: {rel_path} ---\n{content}")
                except Exception:
                    pass
    
    return {
        "structure": "\n".join(file_list),
        "full_content": "".join(code_content)
    }