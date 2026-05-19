# Bell — AI Sales Assistant

Web app ส่วนตัวของเบล (Sales Manager)

## What it does

- **Feature 1: สรุปประชุม** — วาง meeting notes → ได้ prompt → copy ไป Claude.ai/ChatGPT → วางคำตอบกลับ → ได้สรุป + action items
- **Feature 2: Production Brief** — วาง draft → ได้ prompt → copy ไป Claude.ai/ChatGPT → วางคำตอบกลับ → ได้ brief พร้อมส่งทีม

## Tech

- Plain HTML + CSS + JS (zero dependencies)
- ไม่ใช้ backend / API key
- Static site → hosted on GitHub Pages

## Run local

```bash
open index.html
```

## Deploy

Push to `main` → GitHub Pages auto-serves at `https://socialnormss.github.io/bell-app/`
