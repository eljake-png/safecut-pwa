from crewai import Task

class WindowsTasks:
    def powershell_deployment_script(self, agent):
        return Task(
            description="""
            Напиши детальний скрипт `setup_server.ps1` (PowerShell) для Windows 64-bit (Ryzen 3600).
            
            Скрипт повинен автоматично:
            1. Встановити **Node.js LTS** та **Git** (використовуючи `winget` або перевірку наявності).
            2. Встановити залежності проекту (`npm install`).
            3. Завантажити **Cloudflare Tunnel (`cloudflared.exe`)** для Windows.
            4. Створити команду для запуску тунелю.
            5. Показати, як запустити Next.js сервер (`npm run dev` або build/start).
            
            Важливо: Додай коментарі українською, як це запускати від імені Адміністратора.
            """,
            expected_output="Файл setup_server.ps1 з коментарями.",
            agent=agent
        )

    def create_mvp_page(self, agent):
        return Task(
            description="""
            Напиши повний код для файлу `src/app/page.tsx`.
            
            Вимоги:
            1. **UI:** Темна тема, стильний заголовок "Safecut Network".
            2. **Logic:** - Імпортувати хуки з `wagmi` (useAccount, useReadContract, useWriteContract).
               - Показати кнопку `ConnectWalletButton` (яку ми створили раніше).
               - Якщо гаманець підключено: показати адресу користувача і його баланс SFC токенів.
               - Додати велику кнопку "Спалити 10 SFC (Стрижка)".
            3. **Config:** Використовуй адресу контракту як константу (залиш плейсхолдер '0x...').
            """,
            expected_output="Готовий код page.tsx для Next.js App Router.",
            agent=agent
        )