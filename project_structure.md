# SafeBarber Project Structure

## Folder Structure
```
SafeBarber/
├── components/
│   ├── BarberCard.js
│   ├── DistrictModal.js
│   ├── ServiceList.js
│   ├── TimeSlotSelector.js
│   ├── Chat.js
│   └── PanicButton.js
├── pages/
│   ├── _app.js
│   ├── index.js (Masters Screen)
│   ├── barber/[id].js (Booking Screen)
│   ├── services.js (Services Calculator Screen)
│   ├── crypto-payment.js (Crypto Payment Screen)
│   ├── success-chat.js (Success & Chat Screen)
│   └── chat.js (Chat Screen)
├── styles/
│   ├── globals.css
│   └── Home.module.css
└── public/
    └── images/
        └── barber-placeholder.jpg
```

## Pages Description
- **index.js:** Masters screen with a list of barbers filtered by district.
- **barber/[id].js:** Booking screen where clients can select a date and time slot for the booking.
- **services.js:** Services calculator screen where clients choose services and see the total price.
- **crypto-payment.js:** Crypto payment screen to pay with USDT.
- **success-chat.js:** Success screen informing the client that their order is pending confirmation, with an option to chat with the barber.
- **chat.js:** Chat screen for communication between the client and the barber.

## Components Description
- **BarberCard.js:** Displays individual barber information in a card format.
- **DistrictModal.js:** A modal allowing users to select their district.
- **ServiceList.js:** Lists available services with checkboxes for selection.
- **TimeSlotSelector.js:** Allows clients to choose an available time slot.
- **Chat.js:** Chat interface for communication between the client and barber.
- **PanicButton.js:** An emergency button that logs an alert.

## Styles Description
- **globals.css:** Global styles applied throughout the application.
- **Home.module.css:** Specific styles for the home screen.
