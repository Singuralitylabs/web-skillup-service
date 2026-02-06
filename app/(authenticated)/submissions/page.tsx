import { ClipboardList, Code, ExternalLink, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchSubmissionsByUserId } from "@/app/services/api/submissions-server";
import { getServerAuth } from "@/app/services/auth/server-auth";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SubmissionsPage() {
  const { userId } = await getServerAuth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>ユーザー情報を読み込み中...</p>
      </div>
    );
  }

  const { data: submissions } = await fetchSubmissionsByUserId(userId);

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle title="提出履歴" description="これまでに提出した課題の一覧です" />

      {!submissions || submissions.length === 0 ? (
        <div className="card p-8 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">まだ提出がありません。</p>
          <Link href="/learn" className="btn btn-primary mt-4">
            学習を始める
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {submission.submission_type === "code" ? (
                      <Code className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {submission.submission_type === "code" ? "コード提出" : "URL提出"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      • {formatDate(submission.submitted_at)}
                    </span>
                  </div>

                  <h3 className="font-medium">{submission.content?.title || "不明なコンテンツ"}</h3>

                  {submission.submission_type === "code" && submission.code_content && (
                    <pre className="mt-3 p-3 bg-muted rounded-lg text-sm overflow-x-auto max-h-40">
                      <code>{submission.code_content}</code>
                    </pre>
                  )}

                  {submission.submission_type === "url" && submission.url && (
                    <a
                      href={submission.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {submission.url}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
