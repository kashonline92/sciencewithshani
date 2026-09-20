-- ============================================================
-- Tuition Quiz Platform — schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- 1. PROFILES ---------------------------------------------------
-- Extends Supabase auth.users with a role (teacher/student) and name.
create type user_role as enum ('teacher', 'student');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'student',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
-- Role defaults to 'student'; promote teachers manually in the table
-- (or read role from raw_user_meta_data if you set it at signup).
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. PAPERS (a weekly MCQ set) -----------------------------------
create type paper_status as enum ('draft', 'live', 'closed');

create table papers (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  status paper_status not null default 'draft',
  share_slug text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now(),
  live_at timestamptz,
  closed_at timestamptz
);

-- 3. QUESTIONS -----------------------------------------------------
create table questions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references papers(id) on delete cascade,
  question_text text not null,
  position int not null default 0
);

-- 4. OPTIONS (exactly 4 per question, one correct) -----------------
create table options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  position int not null default 0
);

-- 5. SUBMISSIONS (one per student per paper) ------------------------
create table submissions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references papers(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz, -- null until student hits "Done" -> locked after this is set
  score int,
  unique (paper_id, student_id)
);

-- 6. ANSWERS (one per question per submission) -----------------------
create table answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_option_id uuid not null references options(id),
  answered_at timestamptz not null default now(),
  unique (submission_id, question_id)
);

-- Lock answers: block any update/delete once the parent submission
-- has been marked submitted (submitted_at is not null).
create function prevent_locked_answer_change()
returns trigger as $$
declare
  is_locked boolean;
begin
  select (submitted_at is not null) into is_locked
  from submissions where id = coalesce(old.submission_id, new.submission_id);

  if is_locked then
    raise exception 'This paper has already been submitted and cannot be changed.';
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger lock_answers_update
  before update or delete on answers
  for each row execute procedure prevent_locked_answer_change();

-- Also block editing a submission once submitted_at is set
-- (so a student can't null it back out to unlock).
create function prevent_resubmission_edit()
returns trigger as $$
begin
  if old.submitted_at is not null and new.submitted_at is distinct from old.submitted_at then
    raise exception 'Submission is already locked.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger lock_submission_update
  before update on submissions
  for each row execute procedure prevent_resubmission_edit();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table papers enable row level security;
alter table questions enable row level security;
alter table options enable row level security;
alter table submissions enable row level security;
alter table answers enable row level security;

-- Profiles: everyone can read their own; teachers can read all (for analytics/names)
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "teachers read all profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'teacher')
);

-- Papers: teacher manages their own papers.
create policy "teacher full access own papers" on papers for all using (
  teacher_id = auth.uid()
);
-- Students can read a paper only once it's live or closed (needed to take/view results).
create policy "students read live papers" on papers for select using (
  status in ('live', 'closed')
);

-- Questions/Options: readable if the parent paper is readable; writable only by owning teacher.
create policy "read questions of visible papers" on questions for select using (
  exists (
    select 1 from papers p where p.id = questions.paper_id
    and (p.teacher_id = auth.uid() or p.status in ('live', 'closed'))
  )
);
create policy "teacher manages own questions" on questions for all using (
  exists (select 1 from papers p where p.id = questions.paper_id and p.teacher_id = auth.uid())
);

create policy "read options of visible questions" on options for select using (
  exists (
    select 1 from questions q join papers p on p.id = q.paper_id
    where q.id = options.question_id
    and (p.teacher_id = auth.uid() or p.status in ('live', 'closed'))
  )
);
create policy "teacher manages own options" on options for all using (
  exists (
    select 1 from questions q join papers p on p.id = q.paper_id
    where q.id = options.question_id and p.teacher_id = auth.uid()
  )
);

-- Submissions: student manages their own; teacher can read submissions for their own papers.
create policy "student manages own submission" on submissions for all using (
  student_id = auth.uid()
);
create policy "teacher reads submissions of own papers" on submissions for select using (
  exists (select 1 from papers p where p.id = submissions.paper_id and p.teacher_id = auth.uid())
);

-- Answers: student manages their own (trigger enforces the lock); teacher can read for analytics.
create policy "student manages own answers" on answers for all using (
  exists (select 1 from submissions s where s.id = answers.submission_id and s.student_id = auth.uid())
);
create policy "teacher reads answers of own papers" on answers for select using (
  exists (
    select 1 from submissions s join papers p on p.id = s.paper_id
    where s.id = answers.submission_id and p.teacher_id = auth.uid()
  )
);
