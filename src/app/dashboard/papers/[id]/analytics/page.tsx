"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type Row = {
  student_id: string;
  full_name: string;
  score: number | null;
  submitted_at: string | null;
  total: number;
  previousScore: number | null;
  previousTotal: number | null;
};

type QStat = { question_text: string; correct: number; total: number };
type TrendPoint = { title: string; date: string; avgPercent: number };

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [paperTitle, setPaperTitle] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [qStats, setQStats] = useState<QStat[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const teacherId = userData.user?.id;

      const { data: paper } = await supabase
        .from("papers")
        .select("title, grade, created_at")
        .eq("id", id)
        .single();
      setPaperTitle(paper?.title ?? "");
      setGrade(paper?.grade ?? null);

      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("paper_id", id);
      setTotalQuestions(count ?? 0);

      const { data: subs } = await supabase
        .from("submissions")
        .select("student_id, score, submitted_at, profiles(full_name)")
        .eq("paper_id", id);

      // Find the immediately preceding paper (same teacher, same grade if set,
      // created before this one) so we can compare each student's progress.
      let prevScores = new Map<string, { score: number | null; total: number }>();
      if (teacherId && paper) {
        const { data: prevPaper } = await supabase
          .from("papers")
          .select("id")
          .eq("teacher_id", teacherId)
          .lt("created_at", paper.created_at)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (prevPaper) {
          const { count: prevTotal } = await supabase
            .from("questions")
            .select("*", { count: "exact", head: true })
            .eq("paper_id", prevPaper.id);
          const { data: prevSubs } = await supabase
            .from("submissions")
            .select("student_id, score")
            .eq("paper_id", prevPaper.id);
          prevSubs?.forEach((s) => prevScores.set(s.student_id, { score: s.score, total: prevTotal ?? 0 }));
        }
      }

      setRows(
        (subs ?? []).map((s: any) => {
          const prev = prevScores.get(s.student_id);
          return {
            student_id: s.student_id,
            full_name: s.profiles?.full_name ?? "Unknown",
            score: s.score,
            submitted_at: s.submitted_at,
            total: count ?? 0,
            previousScore: prev?.score ?? null,
            previousTotal: prev?.total ?? null,
          };
        })
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

      // Trend across this teacher's last several papers (class average %).
      if (teacherId) {
        const { data: allPapers } = await supabase
          .from("papers")
          .select("id, title, created_at")
          .eq("teacher_id", teacherId)
          .order("created_at", { ascending: true });

        const points: TrendPoint[] = [];
        for (const p of allPapers ?? []) {
          const { count: qCount } = await supabase
            .from("questions")
            .select("*", { count: "exact", head: true })
            .eq("paper_id", p.id);
          const { data: pSubs } = await supabase
            .from("submissions")
            .select("score")
            .eq("paper_id", p.id)
            .not("submitted_at", "is", null);
          if (!qCount || !pSubs || pSubs.length === 0) continue;
          const avgPercent =
            (pSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / pSubs.length / qCount) * 100;
          points.push({ title: p.title, date: new Date(p.created_at).toLocaleDateString(), avgPercent: Math.round(avgPercent) });
        }
        setTrend(points);
      }

      setLoading(false);
    })();
  }, [id, supabase]);

  const submittedCount = rows.filter((r) => r.submitted_at).length;
  const avgScore =
    rows.length > 0
      ? (rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / rows.length).toFixed(1)
      : "—";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Analytics — {paperTitle}</h1>
        {grade && <Badge variant="outline">Grade {grade}</Badge>}
      </div>

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

      {trend.length > 1 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Class average trend</CardTitle>
            <CardDescription>Average score (%) across your papers over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Class average"]}
                    labelFormatter={(_, p) => p?.[0]?.payload?.title}
                  />
                  <Line type="monotone" dataKey="avgPercent" stroke="#2563eb" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Per-student results</CardTitle>
          <CardDescription>Compared to their previous paper.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Student</th>
                <th className="py-2">Score</th>
                <th className="py-2">Progress</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const curPct = r.score != null && r.total ? (r.score / r.total) * 100 : null;
                const prevPct =
                  r.previousScore != null && r.previousTotal ? (r.previousScore / r.previousTotal) * 100 : null;
                const delta = curPct != null && prevPct != null ? Math.round(curPct - prevPct) : null;

                return (
                  <tr key={r.student_id} className="border-b last:border-0">
                    <td className="py-2">{r.full_name}</td>
                    <td className="py-2">
                      {r.score ?? "—"}/{r.total}
                    </td>
                    <td className="py-2">
                      {delta === null ? (
                        <span className="text-muted-foreground">No prior paper</span>
                      ) : delta > 0 ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <ArrowUp className="size-3" /> {delta}%
                        </span>
                      ) : delta < 0 ? (
                        <span className="flex items-center gap-1 text-destructive">
                          <ArrowDown className="size-3" /> {Math.abs(delta)}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Minus className="size-3" /> Same
                        </span>
                      )}
                    </td>
                    <td className="py-2">{r.submitted_at ? "Submitted" : "In progress"}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
                    {loading ? "Loading..." : "No submissions yet."}
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
