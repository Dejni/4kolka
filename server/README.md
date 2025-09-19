# 4Kółka — Backend formularza

Bezpieczny backend do obsługi formularza (Express + Zod + Helmet + CORS + rate-limit + Nodemailer).

## Szybki start (Windows)
```bat
cd server
npm i
copy .env.example .env
notepad .env   # uzupełnij zmienne
npm run dev
```

Endpointy:
- `POST /api/contact` — przyjmuje JSON `{ name, phone, email, vin, msg }`
- `GET /api/health` — healthcheck

## Zmienne środowiskowe
Patrz `.env.example`.

## Test przez curl
```bash
curl -X POST http://localhost:4000/api/contact \
 -H "Content-Type: application/json" \
 -d "{\"name\":\"Jan Test\",\"phone\":\"+48 600 000 000\",\"email\":\"jan@example.com\",\"vin\":\"WDB12345678901234\",\"msg\":\"Opis problemu\"}"
```
