import { type NextRequest, NextResponse } from "next/server";
import {
  updateAIReviewCompleted,
  updateAIReviewFailed,
  updateAIReviewProcessing,
  upsertPendingAIReview,
} from "@/app/services/api/ai-review-server";
import { generateReview } from "@/app/services/api/gemini";
import { createServerSupabaseClient } from "@/app/services/api/supabase-server";

const MAX_CODE_LENGTH = 50000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId は必須です" }, { status: 400 });
    }

    // 認証チェック
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザー情報取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .eq("is_deleted", false)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "ユーザー情報が見つかりません" }, { status: 403 });
    }

    // 提出データ + コンテンツ取得
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*, content:learning_contents(*)")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: "提出データが見つかりません" }, { status: 404 });
    }

    // 本人の提出か検証
    if (submission.user_id !== userData.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // 演習コンテンツの確認
    const content = submission.content;
    if (!content?.exercise_instructions) {
      return NextResponse.json(
        { error: "この提出に関連する演習課題が見つかりません" },
        { status: 400 }
      );
    }

    // 提出内容の取得
    const submissionContent =
      submission.submission_type === "code" ? submission.code_content : submission.url;

    if (!submissionContent) {
      return NextResponse.json({ error: "提出内容が空です" }, { status: 400 });
    }

    // コード長チェック
    if (submission.submission_type === "code" && submissionContent.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `コードが長すぎます（上限: ${MAX_CODE_LENGTH}文字）` },
        { status: 400 }
      );
    }

    // GEMINI_API_KEY 確認
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AIレビュー機能が設定されていません" }, { status: 503 });
    }

    // AIレビューレコードをUPSERT（pending）
    const reviewRecord = await upsertPendingAIReview(submissionId);
    if (!reviewRecord) {
      return NextResponse.json({ error: "AIレビューの初期化に失敗しました" }, { status: 500 });
    }

    // processing に更新
    await updateAIReviewProcessing(reviewRecord.id);

    // Gemini API 呼び出し
    try {
      const result = await generateReview(
        content.exercise_instructions,
        submissionContent,
        submission.submission_type as "code" | "url"
      );

      // completed 状態で保存
      await updateAIReviewCompleted(reviewRecord.id, {
        reviewContent: result.reviewContent,
        overallScore: result.overallScore,
        modelUsed: result.modelUsed,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
      });

      return NextResponse.json({
        success: true,
        review: {
          id: reviewRecord.id,
          status: "completed",
          review_content: result.reviewContent,
          overall_score: result.overallScore,
          model_used: result.modelUsed,
        },
      });
    } catch (geminiError) {
      const errorMessage =
        geminiError instanceof Error ? geminiError.message : "AI レビュー生成に失敗しました";
      console.error("Gemini APIエラー:", errorMessage);

      await updateAIReviewFailed(reviewRecord.id, errorMessage);

      return NextResponse.json(
        { error: "AIレビューの生成に失敗しました。再試行してください。" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("AIレビューAPIエラー:", error);
    return NextResponse.json({ error: "内部エラーが発生しました" }, { status: 500 });
  }
}
