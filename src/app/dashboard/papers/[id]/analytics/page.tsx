"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = {
  student_id: string;
  full_name: string;
  score: number | null;
  submitted_at: string | null;
  total: number;
};

type QStat = { question_text: string; correct: number; total: number };

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [qStats, setQStats] = useState<QStat[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("paper_id", id);
      setTotalQuestions(count ?? 0);

      const { data: subs } = await supabase
        .from("submissions")
        .select("student_id, score, submitted_at, profiles(full_name)")
        .eq("paper_id", id);

      setRows(
        (subs ?? []).map((s: any) => ({
          student_id: s.student_id,
          full_name: s.profiles?.full_name ?? "Unknown",
          score: s.score,
          submitted_at: s.submitted_at,
          total: count ?? 0,
        }))
      );

      const { data: questions } = await supabase
        .from("questions")
        .select("id, question_text, answers(selected_option_id, options(is_correct))")
        .eq("paper_id", id);

      setQStats(
        (questions ?? []).map((q: any) => {
          const answers = q.answers ?? [];
          const correct = answers.filter((a: any) => a.options?.is_correct).length;
          return { question_text: q.question_text, correct, total: answers.length };
        })
      );
    })();
  }, [id, supabase]);

  const submittedCount = rows.filter((r) => r.submitted_at).length;
  const avgScore =
    rows.length > 0
      ? (rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / rows.length).toFixed(1)
      : "—";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{submittedCount}</div>
            <div className="text-xs text-muted-foreground">Submitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{avgScore}</div>
            <div className="text-xs text-muted-foreground">Avg score / {totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Per-student results</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Student</th>
                <th className="py-2">Score</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id} className="border-b last:border-0">
                  <td className="py-2">{r.full_name}</td>
                  <td className="py-2">
                    {r.score ?? "—"}/{r.total}
                  </td>
                  <td className="py-2">{r.submitted_at ? "Submitted" : "In progress"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-muted-foreground">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Per-question performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {qStats.map((q, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm">
                <span>
                  {i + 1}. {q.question_text}
                </span>
                <span className="text-muted-foreground">
                  {q.correct}/{q.total} correct
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: q.total ? `${(q.correct / q.total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
