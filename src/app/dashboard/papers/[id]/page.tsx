"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ImagePlus, X } from "lucide-react";

type Option = { id: string; option_text: string; is_correct: boolean; position: number };
type Question = {
  id: string;
  question_text: string;
  image_url: string | null;
  position: number;
  options: Option[];
};
type Paper = {
  id: string;
  title: string;
  status: "draft" | "live" | "closed";
  share_slug: string;
  grade: number | null;
};

export default function PaperBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paper, setPaper] = useState<Paper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qText, setQText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: p } = await supabase.from("papers").select("*").eq("id", id).single();
    setPaper(p);
    const { data: qs } = await supabase
      .from("questions")
      .select("id, question_text, image_url, position, options(id, option_text, is_correct, position)")
      .eq("paper_id", id)
      .order("position");
    setQuestions(
      (qs ?? []).map((q) => ({ ...q, options: (q.options ?? []).sort((a, b) => a.position - b.position) }))
    );
  }, [id, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB.");
      return;
    }
    setUploadError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!qText.trim() || opts.some((o) => !o.trim())) return;
    setSaving(true);
    setUploadError(null);

    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("question-images")
        .upload(path, imageFile);
      if (uploadErr) {
        setUploadError(`Image upload failed: ${uploadErr.message}`);
        setSaving(false);
        return;
      }
      const { data: pub } = supabase.storage.from("question-images").getPublicUrl(path);
      image_url = pub.publicUrl;
    }

    const { data: q, error } = await supabase
      .from("questions")
      .insert({ paper_id: id, question_text: qText, image_url, position: questions.length })
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
      clearImage();
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
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={paper.status === "live" ? "default" : "secondary"}>{paper.status}</Badge>
            {paper.grade && <Badge variant="outline">Grade {paper.grade}</Badge>}
          </div>
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
              {q.image_url && (
                <img
                  src={q.image_url}
                  alt="Question attachment"
                  className="mt-2 max-h-48 rounded-md border object-contain"
                />
              )}
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

              <div className="space-y-1.5">
                <Label>Image (optional)</Label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-40 rounded-md border object-contain" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    <ImagePlus className="size-4" /> Attach image
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
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
