# Nexres

Next.js app for booking resources.

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/WoIfey/nexres.git
cd nexres
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

Copy the `env.example` file and rename it to `.env` and set the following variables from:

- Better Auth:
  https://www.better-auth.com/docs/installation#set-environment-variables
- GitHub Provider:
  https://github.com/settings/developers

4. **Initialize the database**

```bash
npm run docker
```

5. **Run database migrations**

```bash
pnpm prisma
```

6. **Start the development server**

```bash
pnpm dev
```
