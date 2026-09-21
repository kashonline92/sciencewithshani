"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Option = { id: string; option_text: string; is_correct: boolean; position: number };
type Question = {
  id: string;
  question_text: string;
  image_url: string | null;
  position: number;
  options: Option[];
};

export default function TakeQuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [paperId, setPaperId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id -> option_id
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push(`/login`);
      return;
    }

    const { data: paper } = await supabase
      .from("papers")
      .select("id, title, status")
      .eq("share_slug", slug)
      .single();

    if (!paper) {
      setLoading(false);
      return;
    }
    setPaperId(paper.id);
    setTitle(paper.title);

    const { data: qs } = await supabase
      .from("questions")
      .select("id, question_text, image_url, position, options(id, option_text, is_correct, position)")
      .eq("paper_id", paper.id)
      .order("position");
    setQuestions(
      (qs ?? []).map((q) => ({ ...q, options: (q.options ?? []).sort((a, b) => a.position - b.position) }))
    );

    // find or create this student's submission
    let { data: sub } = await supabase
      .from("submissions")
      .select("id, submitted_at, score")
      .eq("paper_id", paper.id)
      .eq("student_id", userData.user.id)
      .maybeSingle();

    if (!sub && paper.status === "live") {
      const { data: created } = await supabase
        .from("submissions")
        .insert({ paper_id: paper.id, student_id: userData.user.id })
        .select("id, submitted_at, score")
        .single();
      sub = created;
    }

    if (sub) {
      setSubmissionId(sub.id);
      setLocked(!!sub.submitted_at);
      setScore(sub.score);

      const { data: existing } = await supabase
        .from("answers")
        .select("question_id, selected_option_id")
        .eq("submission_id", sub.id);
      const map: Record<string, string> = {};
      (existing ?? []).forEach((a) => (map[a.question_id] = a.selected_option_id));
      setAnswers(map);
    }

    setLoading(false);
  }, [slug, supabase, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function selectOption(questionId: string, optionId: string) {
    if (locked || !submissionId) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    await supabase
      .from("answers")
      .upsert(
        { submission_id: submissionId, question_id: questionId, selected_option_id: optionId },
        { onConflict: "submission_id,question_id" }
      );
  }

  function goNext() {
    setDirection("forward");
    setCurrent((c) => Math.min(c + 1, questions.length - 1));
  }

  function goPrev() {
    setDirection("back");
    setCurrent((c) => Math.max(c - 1, 0));
  }

  async function handleDone() {
    if (!submissionId) return;
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      const proceed = window.confirm(
        `You haven't answered ${unanswered.length} question(s). Submit anyway? You can't change answers after this.`
      );
      if (!proceed) return;
    } else {
      const proceed = window.confirm("Submit your answers? You can't change them after this.");
      if (!proceed) return;
    }

    setSubmitting(true);
    let correct = 0;
    for (const q of questions) {
      const chosen = q.options.find((o) => o.id === answers[q.id]);
      if (chosen?.is_correct) correct++;
    }

    await supabase
      .from("submissions")
      .update({ submitted_at: new Date().toISOString(), score: correct })
      .eq("id", submissionId);

    setScore(correct);
    setLocked(true);
    setSubmitting(false);
  }

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-16 text-muted-foreground">Loading...</div>;
  if (!paperId) return <div className="mx-auto max-w-2xl px-4 py-16 text-muted-foreground">Quiz not found.</div>;

  // ----- Locked / submitted view: full results list -----
  if (locked) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold">{title}</h1>

        <Card className="mt-4 border-green-500/40 bg-green-500/5">
          <CardContent className="p-4 text-sm">
            Submitted — you scored <span className="font-semibold">{score ?? "—"}</span> /{" "}
            {questions.length}. Answers are locked.
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {i + 1}. {q.question_text}
                </CardTitle>
                {q.image_url && (
                  <img
                    src={q.image_url}
                    alt="Question attachment"
                    className="mt-2 max-h-64 rounded-md border object-contain"
                  />
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((o) => {
                  const selected = answers[q.id] === o.id;
                  const showCorrect = o.is_correct;
                  return (
                    <div
                      key={o.id}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left text-sm",
                        showCorrect && "border-green-500 bg-green-500/10",
                        selected && !o.is_correct && "border-destructive bg-destructive/10"
                      )}
                    >
                      {o.option_text}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ----- Active carousel view: one question at a time -----
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const isAnswered = q ? !!answers[q.id] : false;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {questions.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {current + 1} / {questions.length}
          </span>
        )}
      </div>

      {questions.length > 0 && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      )}

      <div className="relative mt-8 overflow-hidden">
        <div
          key={q?.id}
          className={cn(
            "animate-in duration-300",
            direction === "forward" ? "slide-in-from-right-8" : "slide-in-from-left-8"
          )}
        >
          {q && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {current + 1}. {q.question_text}
                </CardTitle>
                {q.image_url && (
                  <img
                    src={q.image_url}
                    alt="Question attachment"
                    className="mt-2 max-h-64 rounded-md border object-contain"
                  />
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((o) => {
                  const selected = answers[q.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => selectOption(q.id, o.id)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        selected && "border-primary bg-primary/10"
                      )}
                    >
                      {o.option_text}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={current === 0}>
          <ChevronLeft className="size-4" /> Back
        </Button>

        {isLast ? (
          <Button onClick={handleDone} disabled={submitting}>
            {submitting ? "Submitting..." : "Done — submit answers"}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!isAnswered}>
            Next <ChevronRight className="size-4" />
          </Button>
        )}
      </div>

      {!isAnswered && !isLast && (
        <p className="mt-2 text-center text-xs text-muted-foreground">Select an answer to continue.</p>
      )}
    </div>
  );
}
