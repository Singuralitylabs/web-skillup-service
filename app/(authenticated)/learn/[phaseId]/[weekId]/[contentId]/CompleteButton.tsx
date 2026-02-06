"use client";

import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { useState } from "react";

interface CompleteButtonProps {
  contentId: number;
  userId: number;
  initialCompleted: boolean;
}

export function CompleteButton({ contentId, userId, initialCompleted }: CompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          userId,
          isCompleted: !isCompleted,
        }),
      });

      if (response.ok) {
        setIsCompleted(!isCompleted);
      } else {
        console.error("進捗更新エラー");
      }
    } catch (error) {
      console.error("進捗更新エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`btn w-full ${
        isCompleted ? "btn-secondary" : "btn-primary"
      } flex items-center justify-center gap-2`}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isCompleted ? (
        <>
          <CheckCircle className="h-5 w-5" />
          完了済み（クリックで未完了に戻す）
        </>
      ) : (
        <>
          <Circle className="h-5 w-5" />
          このコンテンツを完了としてマーク
        </>
      )}
    </button>
  );
}
