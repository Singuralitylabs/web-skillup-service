import { CheckCircle, Clock, FileText, PenLine, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/app/components/PageTitle";
import {
  fetchContentsByWeekId,
  fetchUserProgressByContentIds,
  fetchWeekById,
} from "@/app/services/api/learning-server";
import { getServerAuth } from "@/app/services/auth/server-auth";
import type { ContentType } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PageProps {
  params: Promise<{ phaseId: string; weekId: string }>;
}

function getContentIcon(type: ContentType) {
  switch (type) {
    case "video":
      return <Play className="h-4 w-4" />;
    case "text":
      return <FileText className="h-4 w-4" />;
    case "exercise":
      return <PenLine className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getContentTypeLabel(type: ContentType) {
  switch (type) {
    case "video":
      return "動画";
    case "text":
      return "テキスト";
    case "exercise":
      return "演習";
    default:
      return type;
  }
}

export default async function WeekPage({ params }: PageProps) {
  const { phaseId, weekId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);
  const weekIdNum = Number.parseInt(weekId, 10);

  if (Number.isNaN(phaseIdNum) || Number.isNaN(weekIdNum)) {
    notFound();
  }

  const { userId } = await getServerAuth();
  const [{ data: week }, { data: contents }] = await Promise.all([
    fetchWeekById(weekIdNum),
    fetchContentsByWeekId(weekIdNum),
  ]);

  if (!week || week.phase_id !== phaseIdNum) {
    notFound();
  }

  const contentIds = contents?.map((c) => c.id) || [];
  const { data: progressMap } = userId
    ? await fetchUserProgressByContentIds(userId, contentIds)
    : { data: new Map<number, boolean>() };

  const completedCount = Array.from(progressMap.values()).filter(Boolean).length;
  const totalCount = contents?.length || 0;
  const progressValue = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle
        title={week.name}
        description={week.description || undefined}
        breadcrumbs={[
          { label: "学習コンテンツ", href: "/learn" },
          { label: week.phase?.name || "フェーズ", href: `/learn/${phaseIdNum}` },
          { label: week.name },
        ]}
      />

      {/* 進捗サマリー */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              進捗: {completedCount} / {totalCount} 完了
            </span>
            <span className="text-sm font-medium">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </CardContent>
      </Card>

      {!contents || contents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">この週にはまだコンテンツが登録されていません。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {contents.map((content) => {
            const isCompleted = progressMap.get(content.id) || false;

            return (
              <Link
                key={content.id}
                href={`/learn/${phaseIdNum}/${weekIdNum}/${content.id}`}
                className="block group"
              >
                <Card
                  className={`transition-all hover:shadow-md hover:border-primary/20 ${isCompleted ? "border-l-4 border-l-success" : ""}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          isCompleted
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {content.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="gap-1">
                            {getContentIcon(content.content_type)}
                            {getContentTypeLabel(content.content_type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
