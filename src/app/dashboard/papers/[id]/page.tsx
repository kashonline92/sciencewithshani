"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

type Option = { id: string; option_text: string; is_correct: boolean; position: number };
type Question = { id: string; question_text: string; position: number; options: Option[] };
type Paper = { id: string; title: string; status: "draft" | "live" | "closed"; share_slug: string };

export default function PaperBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qText, setQText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: p } = await supabase.from("papers").select("*").eq("id", id).single();
    setPaper(p);
    const { data: qs } = await supabase
      .from("questions")
      .select("id, question_text, position, options(id, option_text, is_correct, position)")
      .eq("paper_id", id)
      .order("position");
    setQuestions(
      (qs ?? []).map((q) => ({ ...q, options: (q.options ?? []).sort((a, b) => a.position - b.position) }))
    );
  }, [id, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!qText.trim() || opts.some((o) => !o.trim())) return;
    setSaving(true);

    const { data: q, error } = await supabase
      .from("questions")
      .insert({ paper_id: id, question_text: qText, position: questions.length })
      .select()
      .single();

    if (!error && q) {
      await supabase.from("options").insert(
        opts.map((text, i) => ({
          question_id: q.id,
          option_text: text,
          is_correct: i === correctIdx,
          position: i,
        }))
      );
      setQText("");
      setOpts(["", "", "", ""]);
      setCorrectIdx(0);
      await load();
    }
    setSaving(false);
  }

  async function deleteQuestion(qid: string) {
    await supabase.from("questions").delete().eq("id", qid);
    load();
  }

  async function setStatus(status: "draft" | "live" | "closed") {
    await supabase
      .from("papers")
      .update({
        status,
        ...(status === "live" ? { live_at: new Date().toISOString() } : {}),
        ...(status === "closed" ? { closed_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    load();
  }

  if (!paper) return <div className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">Loading...</div>;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/quiz/${paper.share_slug}` : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{paper.title}</h1>
          <Badge className="mt-1" variant={paper.status === "live" ? "default" : "secondary"}>
            {paper.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {paper.status !== "live" && <Button onClick={() => setStatus("live")}>Publish live</Button>}
          {paper.status === "live" && (
            <Button variant="outline" onClick={() => setStatus("closed")}>
              Close paper
            </Button>
          )}
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/papers/${id}/analytics`}>Analytics</Link>
          </Button>
        </div>
      </div>

      {paper.status === "live" && (
        <Card className="mt-4">
          <CardContent className="p-4 text-sm">
            Share this link on WhatsApp:{" "}
            <a href={shareUrl} className="font-medium underline" target="_blank">
              {shareUrl}
            </a>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 space-y-4">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium">
                  {i + 1}. {q.question_text}
                </p>
                <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {q.options.map((o) => (
                  <li key={o.id} className={o.is_correct ? "font-medium text-green-600" : "text-muted-foreground"}>
                    {o.option_text} {o.is_correct && "✓"}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {paper.status === "draft" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add a question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addQuestion} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Question</Label>
                <Input value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Question text" />
              </div>
              <div className="grid gap-2">
                {opts.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctIdx === i}
                      onChange={() => setCorrectIdx(i)}
                      title="Mark as correct answer"
                    />
                    <Input
                      value={val}
                      onChange={(e) => {
                        const next = [...opts];
                        next[i] = e.target.value;
                        setOpts(next);
                      }}
                      placeholder={`Option ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select the radio button next to the correct answer.
              </p>
              <Button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add question"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
