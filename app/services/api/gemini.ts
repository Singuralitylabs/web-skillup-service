import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.0-flash";
const MAX_CODE_LENGTH = 50000;

const SYSTEM_PROMPT = `あなたはWeb技術講座のAI講師アシスタントです。受講生が提出した課題をレビューし、学習を促進するフィードバックを提供してください。

以下の5つのセクションでMarkdown形式のレビューを生成してください：

## 1. 要件達成度
課題の各要件について、以下のいずれかで判定してください：
- **達成**: 要件を満たしている
- **部分的**: 一部満たしているが改善の余地がある
- **未達成**: 要件を満たしていない

## 2. コード品質・可読性
コードの構造、命名規則、フォーマット、ベストプラクティスの観点から評価してください。

## 3. 改善提案（最大3つ）
具体的なコード例を含めた改善提案を最大3つ提示してください。

## 4. 学習アドバイス
この課題を通じて学ぶべきポイントや、次のステップとして取り組むべきことを提案してください。

## 5. 総合スコア
100点満点で総合スコアを提示してください。フォーマット: **総合スコア: XX/100**

---
フィードバックは建設的で励ましを含むものにしてください。初学者にもわかりやすい日本語で記述してください。`;

interface ReviewResult {
  reviewContent: string;
  overallScore: number | null;
  modelUsed: string;
  promptTokens: number | null;
  completionTokens: number | null;
}

export async function generateReview(
  exerciseInstructions: string,
  submissionContent: string,
  submissionType: "code" | "url"
): Promise<ReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_PROMPT,
  });

  let userPrompt: string;
  if (submissionType === "url") {
    userPrompt = `## 課題内容
${exerciseInstructions}

## 提出内容（URL）
${submissionContent}

※ URL提出のため、URLの内容を直接確認することはできません。URL形式の妥当性と、課題要件への適合性（URLの構造やドメインから推測できる範囲）のみ評価してください。`;
  } else {
    const truncated =
      submissionContent.length > MAX_CODE_LENGTH
        ? `${submissionContent.substring(0, MAX_CODE_LENGTH)}\n\n... (${submissionContent.length - MAX_CODE_LENGTH}文字省略)`
        : submissionContent;

    userPrompt = `## 課題内容
${exerciseInstructions}

## 提出コード
\`\`\`
${truncated}
\`\`\``;
  }

  const result = await model.generateContent(userPrompt);
  const response = result.response;
  const reviewContent = response.text();

  const scoreMatch = reviewContent.match(/総合スコア:\s*(\d+)\s*\/\s*100/);
  const overallScore = scoreMatch ? Number.parseInt(scoreMatch[1], 10) : null;

  const usageMetadata = response.usageMetadata;

  return {
    reviewContent,
    overallScore,
    modelUsed: MODEL_NAME,
    promptTokens: usageMetadata?.promptTokenCount ?? null,
    completionTokens: usageMetadata?.candidatesTokenCount ?? null,
  };
}
