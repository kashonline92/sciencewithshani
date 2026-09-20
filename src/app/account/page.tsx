"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

type Profile = { full_name: string; role: "student" | "teacher" };
type HistoryRow = {
  paper_id: string;
  title: string;
  score: number | null;
  total: number;
  submitted_at: string | null;
  share_slug: string;
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }
    setEmail(userData.user.email ?? "");

    const { data: p } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userData.user.id)
      .single();
    setProfile(p);
    setNameInput(p?.full_name ?? "");

    if (p?.role === "student") {
      const { data: subs } = await supabase
        .from("submissions")
        .select("paper_id, score, submitted_at, papers(title, share_slug)")
        .eq("student_id", userData.user.id)
        .order("started_at", { ascending: false });

      const rows: HistoryRow[] = [];
      for (const s of subs ?? []) {
        const { count } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("paper_id", s.paper_id);
        rows.push({
          paper_id: s.paper_id,
          // @ts-expect-error - joined relation typing
          title: s.papers?.title ?? "Untitled paper",
          score: s.score,
          total: count ?? 0,
          submitted_at: s.submitted_at,
          // @ts-expect-error - joined relation typing
          share_slug: s.papers?.share_slug,
        });
      }
      setHistory(rows);
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ full_name: nameInput }).eq("id", userData.user!.id);
    setProfile((prev) => (prev ? { ...prev, full_name: nameInput } : prev));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading || !profile) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-muted-foreground">Loading...</div>;
  }

  const submittedCount = history.filter((h) => h.submitted_at).length;
  const avg =
    submittedCount > 0
      ? (
          history.filter((h) => h.submitted_at).reduce((sum, h) => sum + (h.score ?? 0), 0) /
          submittedCount
        ).toFixed(1)
      : "—";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">My account</h1>

      <Card className="mt-6">
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-medium">{profile.full_name}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
            <Badge variant="secondary" className="mt-1 capitalize">
              {profile.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveName} className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile.role === "student" && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{submittedCount}</div>
                <div className="text-xs text-muted-foreground">Papers submitted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{avg}</div>
                <div className="text-xs text-muted-foreground">Average score</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quiz history</CardTitle>
              <CardDescription>Papers you've started or completed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No quizzes yet — visit the{" "}
                  <Link href="/quiz" className="underline">
                    weekly quiz
                  </Link>{" "}
                  page to get started.
                </p>
              )}
              {history.map((h) => (
                <Link key={h.paper_id} href={`/quiz/${h.share_slug}`}>
                  <div className="flex items-center justify-between rounded-md border p-3 hover:bg-accent">
                    <span className="text-sm font-medium">{h.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {h.submitted_at ? `${h.score}/${h.total}` : "In progress"}
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Button variant="outline" className="mt-8" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  );
}
