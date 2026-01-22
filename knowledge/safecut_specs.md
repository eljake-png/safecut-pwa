# SAFECUT: TECHNICAL SPECIFICATION & USER FLOW V1.0
Based on FlutterFlow Prototype & CEO Requirements.

## 1. AUTHENTICATION (PRIVACY FIRST)
Ми відмовляємося від складних реєстрацій.
- **Login Flow:** Поле "Nickname" + Поле "Password".
- **Logic:**
    - Кнопка "Увійти": Перевіряє пару Nickname/Password.
    - Кнопка "Створити": Створює нового юзера з цими даними (якщо Nickname вільний).
- **Role:** Система має розрізняти `client` та `barber`.

## 2. DATABASE SCHEMA (SUPABASE/POSTGRES)
Tables required:

1. **users**
   - id, nickname (unique), password_hash, role ('client' or 'barber').
2. **districts**
   - id, name (e.g., 'Північний', 'Ювілейний', 'Щасливе'), is_active (Boolean).
   - *Default Data:* 'Північний' = true, others = false.
3. **barbers**
   - id, user_id, name, bio, photo_url, district_id.
4. **services**
   - id, name (Стрижка, Борода, Батько і Син), price (500, 100, 300), is_mandatory (Boolean).
5. **bookings**
   - id, client_id, barber_id, date, time_slot (enum: '10:00', '12:00'...), status ('pending', 'confirmed', 'completed', 'rejected'), payment_method ('cash', 'crypto'), total_price.
6. **messages** (Chat)
   - id, booking_id, sender_id, content, created_at.
   - *Security:* Messages related to a booking must be auto-deleted after status becomes 'completed'.

## 3. CLIENT FLOW (UI/UX)

**Screen 1: Masters (Home)**
- **Top Bar:** "Майстри твого району" + Кнопка "Обрати район".
- **District Modal:** List: Північний, Ювілейний, Щасливе. (Only Pivnichnyi is clickable).
- **Barber List:** Filtered by selected district. Cards: Photo + Name + Bio. Click -> Go to Screen 2.

**Screen 2: Booking (Date & Time)**
- **Header:** "Твій барбер: [Name]" + "Back" button.
- **Calendar:** Default selection = Today.
- **Time Slots:** Fixed buttons [10:00, 12:00, 14:00, 16:00, 18:00, 20:00].
- **Validation:** If slot exists in DB for this barber + date -> Button disabled (Grayed out).
- **Action:** Click "Забронювати" -> Go to Screen 3.

**Screen 3: Services (Calculator)**
- **List:**
    - "Стрижка" (500 грн) - Checkbox ON by default (Required). Cannot uncheck.
    - "Борода" (100 грн) - Checkbox.
    - "Батько і Син" (300 грн) - Checkbox.
- **Total:** Dynamic Text "Разом до оплати: [SUM]".
- **Payment Toggle:** Radio buttons: [x] Готівкою, [ ] Криптою.
- **Action:** Click "До оплати" -> if Crypto (Screen 4), if Cash (Screen 5).

**Screen 4: Crypto Payment**
- Placeholder UI: "Send [Amount] USDT to [Wallet Address]".
- Button "I paid".

**Screen 5: Success & Chat**
- **Status:** "Очікується підтвердження".
- **Message:** "Замовлення сформоване. Напиши адресу в чат."
- **Action:** Button "Написати барберу" -> Opens Chat.

**Screen 6: Chat**
- Simple interface to send text (address). Encrypted/Private visual style.

## 4. BARBER FLOW

**Screen 1: Auth**
- Same Nickname/Pass login.
- Checkbox "Запам'ятай мене".

**Screen 2: Dashboard (Orders)**
- List of bookings sorted by Date/Time ASC (Nearest first).
- Card: Status + Client Nickname + Date/Time + Price.

**Screen 3: Order Details**
- Actions: Button "Підтвердити" (Changes status to 'confirmed'), Button "Відхилити".

**Screen 4: Active Order (After Confirm)**
- Chat view accessible to see Client's address.

**Screen 5: Execution**
- Button "Замовлення виконано" (Changes status to 'completed', triggers chat deletion).
- **PANIC BUTTON:** "Тривога" (Red button). Logic: Log alert to system/console.

## 5. VISUAL STYLE
- **Theme:** Dark Mode Only.
- **Colors:** Black, Dark Grey, White Text, Blue Accents (Buttons).