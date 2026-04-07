import { type NextRequest, NextResponse } from "next/server";
import { generateReview } from "@/app/services/api/gemini";

const MAX_CODE_LENGTH = 8000;
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// メモリ内レート制限（サーバー再起動でリセット）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "リクエスト上限に達しました。しばらく時間を置いてからお試しください。" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }

  const { exerciseInstructions, submissionContent, submissionType, referenceAnswer } =
    body as Record<string, unknown>;

  if (
    typeof exerciseInstructions !== "string" ||
    typeof submissionContent !== "string" ||
    (submissionType !== "code" && submissionType !== "url")
  ) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  if (submissionType === "code" && submissionContent.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { error: `コードが長すぎます（上限: ${MAX_CODE_LENGTH}文字）` },
      { status: 400 }
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AIレビュー機能が設定されていません" }, { status: 503 });
  }

  try {
    const result = await generateReview(
      exerciseInstructions,
      submissionContent,
      submissionType,
      typeof referenceAnswer === "string" ? referenceAnswer : null
    );

    return NextResponse.json({
      success: true,
      review: {
        status: "completed",
        review_content: result.reviewContent,
        overall_score: result.overallScore,
        model_used: result.modelUsed,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AIレビュー生成中にエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
