import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createServerSupabaseClient } from "@/app/services/api/supabase-server";
import { getServerAuth } from "@/app/services/auth/server-auth";
import type { LearningPhase } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PhaseWithProgress {
  phase: LearningPhase;
  totalContents: number;
  completedContents: number;
}

async function getProgressSummary(userId: number): Promise<{
  phases: PhaseWithProgress[];
  totalContents: number;
  completedContents: number;
}> {
  const supabase = await createServerSupabaseClient();

  const { data: phases, error: phasesError } = await supabase
    .from("learning_phases")
    .select("*")
    .eq("is_published", true)
    .eq("is_deleted", false)
    .order("display_order");

  if (phasesError || !phases) {
    return { phases: [], totalContents: 0, completedContents: 0 };
  }

  const phasesWithProgress: PhaseWithProgress[] = await Promise.all(
    phases.map(async (phase) => {
      const { count: totalContents } = await supabase
        .from("learning_contents")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .eq("is_deleted", false)
        .in(
          "week_id",
          (
            await supabase
              .from("learning_weeks")
              .select("id")
              .eq("phase_id", phase.id)
              .eq("is_published", true)
              .eq("is_deleted", false)
          ).data?.map((w) => w.id) || []
        );

      const { count: completedContents } = await supabase
        .from("user_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_completed", true)
        .in(
          "content_id",
          (
            await supabase
              .from("learning_contents")
              .select("id")
              .eq("is_published", true)
              .eq("is_deleted", false)
              .in(
                "week_id",
                (
                  await supabase
                    .from("learning_weeks")
                    .select("id")
                    .eq("phase_id", phase.id)
                    .eq("is_published", true)
                    .eq("is_deleted", false)
                ).data?.map((w) => w.id) || []
              )
          ).data?.map((c) => c.id) || []
        );

      return {
        phase,
        totalContents: totalContents || 0,
        completedContents: completedContents || 0,
      };
    })
  );

  const totalContents = phasesWithProgress.reduce((sum, p) => sum + p.totalContents, 0);
  const completedContents = phasesWithProgress.reduce((sum, p) => sum + p.completedContents, 0);

  return { phases: phasesWithProgress, totalContents, completedContents };
}

export default async function HomePage() {
  const { userId } = await getServerAuth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">ユーザー情報を読み込み中...</p>
      </div>
    );
  }

  const { phases, totalContents, completedContents } = await getProgressSummary(userId);
  const overallProgress =
    totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">ダッシュボード</h1>

      {/* 全体進捗 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">学習進捗</h2>
              <p className="text-sm text-muted-foreground">
                {completedContents} / {totalContents} コンテンツ完了
              </p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-right text-sm text-muted-foreground mt-2">{overallProgress}%</p>
        </CardContent>
      </Card>

      {/* フェーズ一覧 */}
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          学習フェーズ
        </h2>

        {phases.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>学習コンテンツはまだ登録されていません。</p>
            </CardContent>
          </Card>
        ) : (
          phases.map(({ phase, totalContents, completedContents }) => {
            const progress =
              totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
            const isCompleted = totalContents > 0 && completedContents === totalContents;

            return (
              <Link key={phase.id} href={`/learn/${phase.id}`} className="block group">
                <Card
                  className={`transition-all hover:shadow-md hover:border-primary/20 ${isCompleted ? "border-l-4 border-l-success" : ""}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {phase.name}
                        </h3>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {completedContents} / {totalContents}
                      </span>
                    </div>
                    {phase.description && (
                      <p className="text-sm text-muted-foreground mb-3 ml-8">{phase.description}</p>
                    )}
                    <div className="ml-8">
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* 学習を始めるボタン */}
      {phases.length > 0 && (
        <div className="mt-6 text-center">
          <Button asChild>
            <Link href="/learn">学習を始める</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
