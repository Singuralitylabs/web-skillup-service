import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/app/components/MarkdownRenderer";
import { PageTitle } from "@/app/components/PageTitle";
import { YouTubeEmbed } from "@/app/components/YouTubeEmbed";
import {
  fetchContentById,
  fetchContentsByWeekId,
  fetchUserProgressByContentId,
} from "@/app/services/api/learning-server";
import { getServerAuth } from "@/app/services/auth/server-auth";
import { CompleteButton } from "./CompleteButton";
import { SubmissionForm } from "./SubmissionForm";

interface PageProps {
  params: Promise<{ phaseId: string; weekId: string; contentId: string }>;
}

export default async function ContentPage({ params }: PageProps) {
  const { phaseId, weekId, contentId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);
  const weekIdNum = Number.parseInt(weekId, 10);
  const contentIdNum = Number.parseInt(contentId, 10);

  if (Number.isNaN(phaseIdNum) || Number.isNaN(weekIdNum) || Number.isNaN(contentIdNum)) {
    notFound();
  }

  const { userId } = await getServerAuth();
  const { data: content } = await fetchContentById(contentIdNum);

  if (!content || content.week_id !== weekIdNum) {
    notFound();
  }

  // 同じ週の全コンテンツを取得（前後ナビゲーション用）
  const { data: weekContents } = await fetchContentsByWeekId(weekIdNum);
  const currentIndex = weekContents?.findIndex((c) => c.id === contentIdNum) ?? -1;
  const prevContent = currentIndex > 0 ? weekContents?.[currentIndex - 1] : null;
  const nextContent =
    currentIndex >= 0 && currentIndex < (weekContents?.length ?? 0) - 1
      ? weekContents?.[currentIndex + 1]
      : null;

  // 進捗を取得
  const { isCompleted } = userId
    ? await fetchUserProgressByContentId(userId, contentIdNum)
    : { isCompleted: false };

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle
        title={content.title}
        breadcrumbs={[
          { label: "学習コンテンツ", href: "/learn" },
          {
            label: content.week?.phase?.name || "フェーズ",
            href: `/learn/${phaseIdNum}`,
          },
          {
            label: content.week?.name || "週",
            href: `/learn/${phaseIdNum}/${weekIdNum}`,
          },
          { label: content.title },
        ]}
      />

      {/* コンテンツ本体 */}
      <div className="card p-6 mb-6">
        {content.content_type === "video" && content.video_url && (
          <div className="mb-6">
            <YouTubeEmbed url={content.video_url} />
          </div>
        )}

        {content.content_type === "text" && content.text_content && (
          <MarkdownRenderer content={content.text_content} />
        )}

        {content.content_type === "exercise" && content.exercise_instructions && (
          <div>
            <MarkdownRenderer content={content.exercise_instructions} />

            {/* 提出フォーム */}
            {userId && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">課題提出</h3>
                <SubmissionForm contentId={contentIdNum} userId={userId} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 完了ボタン */}
      {userId && (
        <div className="mb-6">
          <CompleteButton contentId={contentIdNum} userId={userId} initialCompleted={isCompleted} />
        </div>
      )}

      {/* 前後ナビゲーション */}
      <div className="flex items-center justify-between gap-4">
        {prevContent ? (
          <Link
            href={`/learn/${phaseIdNum}/${weekIdNum}/${prevContent.id}`}
            className="btn btn-outline flex-1 justify-start"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="truncate">{prevContent.title}</span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextContent ? (
          <Link
            href={`/learn/${phaseIdNum}/${weekIdNum}/${nextContent.id}`}
            className="btn btn-outline flex-1 justify-end"
          >
            <span className="truncate">{nextContent.title}</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        ) : (
          <Link
            href={`/learn/${phaseIdNum}/${weekIdNum}`}
            className="btn btn-primary flex-1 justify-center"
          >
            週の一覧に戻る
          </Link>
        )}
      </div>
    </div>
  );
}
