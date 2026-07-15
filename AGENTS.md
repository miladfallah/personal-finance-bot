# Personal Finance Bot — Serverless

## Project overview
A Telegram bot for tracking income, expenses, budgets, and savings goals. Runs on Telegram Serverless — no VPS, no webhooks, no external backend.

## Architecture
- **schema.js** — Database tables (users, transactions, budgets, goals) using sdk/db DSL
- **handlers/** — One file per update type (message, callback_query, inline_query)
- **lib/** — Shared modules (finance.js, formatter.js, categories.js)

## Key conventions
- Import by bare name: `import { api } from 'sdk'`, `import { users } from 'schema'`
- No relative paths, no .js extensions
- No foreign keys (PRAGMA foreign_keys off)
- All db calls are async — always `await`
- Handlers receive the update payload directly (e.g., Message, CallbackQuery)
- Deploy with `npx tgcloud push`, migrate with `npx tgcloud migrate`

## Commands
- `/start` — Welcome message + main menu
- `/budget [category] [amount]` — View/set budgets
- `/goal [title] [amount]` — View/create savings goals
- Natural language: `25000 food dinner` or `income 30000000 salary`

## Database tables
- **users** — Telegram user data (telegram_id, first_name, username, currency)
- **transactions** — Income/expense records (type, amount, category, description)
- **budgets** — Monthly limits per category
- **goals** — Savings goals with target and current amounts
