"use client";

import { Code, Link as LinkIcon, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { AIReviewDisplay } from "@/app/components/AIReviewDisplay";
import { CodeEditor, type CodeLanguage } from "@/app/components/CodeEditor";
import type { AIReview, SubmissionType } from "@/app/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DemoSubmissionFormProps {
  exerciseInstructions: string;
  referenceAnswer: string | null;
  allowedSubmissionTypes: "code" | "url" | "both";
  codeLanguage: CodeLanguage;
}

export function DemoSubmissionForm({
  exerciseInstructions,
  referenceAnswer,
  allowedSubmissionTypes,
  codeLanguage,
}: DemoSubmissionFormProps) {
  const [submissionType, setSubmissionType] = useState<SubmissionType>(
    allowedSubmissionTypes === "url" ? "url" : "code"
  );
  const [codeContent, setCodeContent] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsReviewLoading(true);
    setMessage(null);
    setAiReview(null);

    const submissionContent = submissionType === "code" ? codeContent : url;

    try {
      const response = await fetch("/api/demo/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseInstructions,
          referenceAnswer,
          submissionContent,
          submissionType,
        }),
      });

      setIsLoading(false);

      if (response.ok) {
        const data = await response.json();
        setAiReview({
          id: 0,
          submission_id: 0,
          status: data.review.status,
          review_content: data.review.review_content,
          overall_score: data.review.overall_score,
          model_used: data.review.model_used,
          prompt_tokens: null,
          completion_tokens: null,
          error_message: null,
          reviewed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setMessage({ type: "success", text: "AIレビューが完了しました。" });
      } else if (response.status === 429) {
        const errorData = await response.json().catch(() => null);
        setMessage({
          type: "error",
          text: errorData?.error ?? "リクエスト上限に達しました。しばらくお待ちください。",
        });
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error ?? "AIレビューの生成に失敗しました";
        setMessage({ type: "error", text: errorMsg });
        setAiReview({
          id: 0,
          submission_id: 0,
          status: "failed",
          review_content: null,
          overall_score: null,
          model_used: null,
          prompt_tokens: null,
          completion_tokens: null,
          error_message: errorMsg,
          reviewed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      setIsLoading(false);
      const errorMsg = "ネットワークエラーが発生しました。再試行してください。";
      setMessage({ type: "error", text: errorMsg });
      setAiReview({
        id: 0,
        submission_id: 0,
        status: "failed",
        review_content: null,
        overall_score: null,
        model_used: null,
        prompt_tokens: null,
        completion_tokens: null,
        error_message: errorMsg,
        reviewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsReviewLoading(false);
    }
  };

  const isValid =
    (submissionType === "code" && codeContent.trim().length > 0) ||
    (submissionType === "url" && url.trim().length > 0);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {allowedSubmissionTypes === "both" && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSubmissionType("code")}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                submissionType === "code"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Code className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">コードで提出</span>
            </button>
            <button
              type="button"
              onClick={() => setSubmissionType("url")}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                submissionType === "url"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <LinkIcon className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">URLで提出</span>
            </button>
          </div>
        )}

        {submissionType === "code" ? (
          <div className="space-y-2">
            <Label>コード</Label>
            <CodeEditor
              value={codeContent}
              onChange={setCodeContent}
              language={codeLanguage}
              placeholder="ここにコードを貼り付けてください..."
              minHeight="200px"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="demo-url">URL</Label>
            <Input
              type="url"
              id="demo-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription className={message.type === "success" ? "text-success" : ""}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={!isValid || isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              提出してAIレビューを受ける
            </>
          )}
        </Button>
      </form>

      <AIReviewDisplay review={aiReview} isLoading={isReviewLoading} defaultExpanded={true} />
    </div>
  );
}
