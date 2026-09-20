# LearnLab

Landing page + 3D anatomy page (placeholder) + science simulations (pH demo built,
more can be added under `src/app/simulations/<name>`) + weekly MCQ quiz platform
with teacher dashboard, analytics, and student login.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- shadcn/ui-style components (in `src/components/ui`)
- Supabase (Postgres + Auth) for accounts, papers, questions, submissions
- Deploy target: Vercel

## 1. Supabase setup
1. Create a free project at https://supabase.com.
2. In the Supabase dashboard: **SQL Editor > New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates all tables, the one-time
   answer lock (trigger), and Row Level Security policies.
3. Go to **Project Settings > API** and copy the **Project URL** and **anon public key**.
4. Copy `.env.example` to `.env.local` and fill those two values in.
5. (Optional) In **Authentication > Providers**, email/password is enabled by
   default — that's all this app uses for now. You can turn off "Confirm email"
   under **Authentication > Sign In / Providers** while testing, so signup logs
   the user in immediately.

## 2. Run locally
```bash
npm install
npm run dev
```
Visit http://localhost:3000.

## 3. How the quiz flow works
- A teacher signs up choosing the "teacher" role, goes to `/dashboard`, creates
  a paper (draft), adds MCQ questions (4 options each, marks the correct one).
- Clicking **Publish live** sets the paper live and reveals a shareable link
  like `/quiz/<share_slug>` — copy that into WhatsApp.
- A student signs up as "student", opens the link, logs in if needed, answers
  each question (each click is saved instantly), then taps **Done**. That sets
  `submitted_at` and a database trigger blocks any further changes to their
  answers or that submission — so it truly can't be edited after submit, even
  via the API.
- Teacher's **Analytics** tab (per paper) shows submission count, average
  score, per-student scores, and per-question correct-rate.

## 4. Push to GitHub
```bash
cd tuition-app
git init
git add .
git commit -m "Initial scaffold: landing, anatomy, simulations, quiz platform"
gh repo create your-username/learnlab --public --source=. --push
# or manually: create an empty repo on github.com, then
# git remote add origin https://github.com/your-username/learnlab.git
# git branch -M main
# git push -u origin main
```

## 5. Deploy to Vercel
1. Go to https://vercel.com/new and import the GitHub repo.
2. In the import screen, add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Every push to `main` will auto-redeploy.

## Where to build next
- `src/app/anatomy/page.tsx` — swap the placeholder card for your 3D viewer/embed.
- `src/app/simulations/` — add a new folder per simulation (pH is done as an example);
  list it in `src/app/simulations/page.tsx`.
- `src/app/dashboard/papers/[id]/page.tsx` — the question/answer builder, if you
  want to add editing existing questions, timers, or images per question.
- shadcn CLI: this project is pre-wired with `components.json`, so once you have
  network access to `ui.shadcn.com`, `npx shadcn@latest add <component>` will drop
  new components straight into `src/components/ui`.
