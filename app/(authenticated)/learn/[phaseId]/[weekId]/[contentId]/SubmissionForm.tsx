"use client";

import { Code, Link as LinkIcon, Loader2, Send } from "lucide-react";
import { useState } from "react";
import type { SubmissionType } from "@/app/types";

interface SubmissionFormProps {
  contentId: number;
  userId: number;
}

export function SubmissionForm({ contentId, userId }: SubmissionFormProps) {
  const [submissionType, setSubmissionType] = useState<SubmissionType>("code");
  const [codeContent, setCodeContent] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          userId,
          submissionType,
          codeContent: submissionType === "code" ? codeContent : null,
          url: submissionType === "url" ? url : null,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "提出が完了しました" });
        setCodeContent("");
        setUrl("");
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "提出に失敗しました" });
      }
    } catch (error) {
      console.error("提出エラー:", error);
      setMessage({ type: "error", text: "提出に失敗しました" });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid =
    (submissionType === "code" && codeContent.trim().length > 0) ||
    (submissionType === "url" && url.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 提出タイプ選択 */}
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

      {/* 入力フィールド */}
      {submissionType === "code" ? (
        <div>
          <label htmlFor="code" className="label block mb-2">
            コード
          </label>
          <textarea
            id="code"
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            className="textarea font-mono min-h-[200px]"
            placeholder="ここにコードを貼り付けてください..."
          />
        </div>
      ) : (
        <div>
          <label htmlFor="url" className="label block mb-2">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input"
            placeholder="https://..."
          />
        </div>
      )}

      {/* メッセージ */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 提出ボタン */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Send className="h-5 w-5" />
            提出する
          </>
        )}
      </button>
    </form>
  );
}
