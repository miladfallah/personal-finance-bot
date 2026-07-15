# Personal Finance Bot 💰

A personal finance assistant running on Telegram Serverless.

## Setup

1. Enable Serverless in @BotFather → your bot → Serverless → turn on
2. Get CLI access token: @BotFather → your bot → Serverless → CLI Access
3. Login: `npx tgcloud login`
4. Deploy: `npx tgcloud push`
5. Migrate: `npx tgcloud migrate`

## Usage

- `/start` — Welcome message
- `25000 food dinner` — Add expense
- `income 30000000 salary` — Add income
- `/budget food 5000000` — Set budget
- `/goal car 500000000` — Create savings goal
- Use inline buttons for reports, balance, etc.
