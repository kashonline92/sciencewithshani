"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Paper = { id: string; title: string; share_slug: string; status: string };

export default function QuizListPage() {
  const router = useRouter();
  const supabase = createClient();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("papers")
        .select("id, title, share_slug, status")
        .in("status", ["live", "closed"])
        .order("created_at", { ascending: false });
      setPapers(data ?? []);
      setLoading(false);
    })();
  }, [router, supabase]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Weekly Quiz</h1>
      <p className="mt-1 text-muted-foreground">
        Papers your teacher has published. You can also open a paper directly from a WhatsApp link.
      </p>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && papers.length === 0 && (
          <p className="text-sm text-muted-foreground">No papers published yet — check back soon.</p>
        )}
        {papers.map((p) => (
          <Link key={p.id} href={`/quiz/${p.share_slug}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription>
                  <Badge variant={p.status === "live" ? "default" : "outline"}>{p.status}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
