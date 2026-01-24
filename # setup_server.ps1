# setup_server.ps1
# Автоматизація для Safecut Server (Windows Edition)

Write-Host ">>> ПОЧАТОК НАЛАШТУВАННЯ SAFECUT SERVER <<<" -ForegroundColor Cyan

# 1. Перевірка та встановлення Node.js і Git
if (!(Get-Command node -errorAction SilentlyContinue)) {
    Write-Host "Встановлюємо Node.js LTS..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
} else {
    Write-Host "Node.js вже встановлено." -ForegroundColor Green
}

if (!(Get-Command git -errorAction SilentlyContinue)) {
    Write-Host "Встановлюємо Git..." -ForegroundColor Yellow
    winget install Git.Git --accept-source-agreements --accept-package-agreements
} else {
    Write-Host "Git вже встановлено." -ForegroundColor Green
}

# 2. Створення папки для тунелю
$TunnelDir = "C:\Cloudflare-Tunnel"
if (!(Test-Path -Path $TunnelDir)) {
    New-Item -ItemType Directory -Path $TunnelDir | Out-Null
    Write-Host "Папку $TunnelDir створено." -ForegroundColor Green
}

# 3. Завантаження Cloudflare Tunnel (Пряме посилання)
Write-Host "Завантаження cloudflared.exe..." -ForegroundColor Yellow
$Url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$Output = "$TunnelDir\cloudflared.exe"
Invoke-WebRequest -Uri $Url -OutFile $Output
Unblock-File -Path $Output
Write-Host "Cloudflared завантажено: $Output" -ForegroundColor Green

# 4. Створення базового конфігу (Шаблон)
$ConfigFile = "$TunnelDir\config.yml"
if (!(Test-Path $ConfigFile)) {
    $ConfigContent = @"
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: $TunnelDir\credentials.json
ingress:
  - hostname: safecut.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
"@
    Set-Content -Path $ConfigFile -Value $ConfigContent
    Write-Host "Створено шаблон конфігу: $ConfigFile (Потрібно відредагувати!)" -ForegroundColor Magenta
}

Write-Host "`n>>> ГОТОВО! ВАШІ НАСТУПНІ КРОКИ: <<<" -ForegroundColor Cyan
Write-Host "1. Скопіюйте папку проекту з M3 Ultra в C:\Safecut (або інше місце)."
Write-Host "2. Відкрийте цю папку в PowerShell і напишіть: npm install"
Write-Host "3. Запустіть сервер: npm run dev"
Write-Host "4. Відредагуйте C:\Cloudflare-Tunnel\config.yml (вставте ID тунелю)."
Write-Host "5. Запустіть тунель командою: C:\Cloudflare-Tunnel\cloudflared.exe tunnel run"
Read-Host "Натисніть Enter щоб вийти..."