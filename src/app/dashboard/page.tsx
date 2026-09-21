"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Paper = {
  id: string;
  title: string;
  status: "draft" | "live" | "closed";
  share_slug: string;
  grade: number | null;
  created_at: string;
};

const statusVariant = {
  draft: "secondary",
  live: "default",
  closed: "outline",
} as const;

const GRADES = [6, 7, 8, 9, 10, 11];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState<number>(6);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("papers")
        .select("id, title, status, share_slug, grade, created_at")
        .order("created_at", { ascending: false });
      setPapers(data ?? []);
      setLoading(false);
    })();
  }, [router, supabase]);

  async function createPaper(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("papers")
      .insert({ title, grade, teacher_id: userData.user!.id })
      .select()
      .single();

    setCreating(false);
    if (!error && data) {
      router.push(`/dashboard/papers/${data.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your papers</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>New weekly paper</CardTitle>
          <CardDescription>Give it a title and grade, then add questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createPaper} className="flex gap-2">
            <Input
              placeholder="e.g. Week 5 — Chemical Bonding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <select
              value={grade}
              onChange={(e) => setGrade(parseInt(e.target.value))}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && papers.length === 0 && (
          <p className="text-sm text-muted-foreground">No papers yet — create your first one above.</p>
        )}
        {papers.map((p) => (
          <Link key={p.id} href={`/dashboard/papers/${p.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.grade ? `Grade ${p.grade} · ` : ""}
                    Created {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
