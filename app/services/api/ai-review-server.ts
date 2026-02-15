import type { PostgrestError } from "@supabase/supabase-js";
import type { SubmissionWithContentAndReview, SubmissionWithUserAndReview } from "@/app/types";
import { createAdminSupabaseClient, createServerSupabaseClient } from "./supabase-server";

const AI_REVIEW_SELECT = "ai_review:ai_reviews(*)";

/**
 * ユーザーの提出+AIレビュー一覧を取得（RLS経由）
 */
export async function fetchSubmissionsWithReviewsByUserId(userId: number): Promise<{
  data: SubmissionWithContentAndReview[] | null;
  error: PostgrestError | null;
}> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("submissions")
    .select(`*, content:learning_contents(*), ${AI_REVIEW_SELECT}`)
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("提出+レビュー取得エラー:", error.message);
    return { data: null, error };
  }

  return { data: data as SubmissionWithContentAndReview[], error: null };
}

/**
 * 全提出+AIレビュー一覧を取得（管理者・講師用、Service Role）
 */
export async function fetchAllSubmissionsWithReviews(): Promise<{
  data: SubmissionWithUserAndReview[] | null;
  error: PostgrestError | null;
}> {
  const supabase = await createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("submissions")
    .select(
      `*, user:users(id, display_name, email), content:learning_contents(*), ${AI_REVIEW_SELECT}`
    )
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("全提出+レビュー取得エラー:", error.message);
    return { data: null, error };
  }

  return { data: data as SubmissionWithUserAndReview[], error: null };
}

/**
 * AIレビューレコードをUPSERT（pending状態で作成、既存があれば更新）
 */
export async function upsertPendingAIReview(submissionId: number): Promise<{ id: number } | null> {
  const supabase = await createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("ai_reviews")
    .upsert(
      {
        submission_id: submissionId,
        status: "pending",
        review_content: null,
        overall_score: null,
        error_message: null,
        reviewed_at: null,
      },
      { onConflict: "submission_id" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("AIレビュー作成エラー:", error.message);
    return null;
  }

  return data;
}

/**
 * AIレビューをprocessing状態に更新
 */
export async function updateAIReviewProcessing(reviewId: number): Promise<boolean> {
  const supabase = await createAdminSupabaseClient();

  const { error } = await supabase
    .from("ai_reviews")
    .update({ status: "processing" })
    .eq("id", reviewId);

  if (error) {
    console.error("AIレビュー更新エラー:", error.message);
    return false;
  }

  return true;
}

/**
 * AIレビューをcompleted状態に更新（結果保存）
 */
export async function updateAIReviewCompleted(
  reviewId: number,
  params: {
    reviewContent: string;
    overallScore: number | null;
    modelUsed: string;
    promptTokens: number | null;
    completionTokens: number | null;
  }
): Promise<boolean> {
  const supabase = await createAdminSupabaseClient();

  const { error } = await supabase
    .from("ai_reviews")
    .update({
      status: "completed",
      review_content: params.reviewContent,
      overall_score: params.overallScore,
      model_used: params.modelUsed,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) {
    console.error("AIレビュー完了更新エラー:", error.message);
    return false;
  }

  return true;
}

/**
 * AIレビューをfailed状態に更新
 */
export async function updateAIReviewFailed(
  reviewId: number,
  errorMessage: string
): Promise<boolean> {
  const supabase = await createAdminSupabaseClient();

  const { error } = await supabase
    .from("ai_reviews")
    .update({
      status: "failed",
      error_message: errorMessage,
    })
    .eq("id", reviewId);

  if (error) {
    console.error("AIレビュー失敗更新エラー:", error.message);
    return false;
  }

  return true;
}
