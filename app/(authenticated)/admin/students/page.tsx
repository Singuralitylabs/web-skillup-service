import { Users } from "lucide-react";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchStudentsProgress } from "@/app/services/api/admin-server";

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function AdminStudentsPage() {
  const { data: students } = await fetchStudentsProgress();

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle title="受講生進捗" description="受講生の学習進捗状況" />

      {!students || students.length === 0 ? (
        <div className="card p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">受講生がまだいません。</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">名前</th>
                <th className="px-4 py-3 text-left text-sm font-medium">メール</th>
                <th className="px-4 py-3 text-center text-sm font-medium">進捗</th>
                <th className="px-4 py-3 text-right text-sm font-medium">最終アクティビティ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const progress =
                  student.totalContents > 0
                    ? Math.round((student.completedContents / student.totalContents) * 100)
                    : 0;

                return (
                  <tr key={student.user.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{student.user.display_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {student.user.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {student.completedContents}/{student.totalContents}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {formatDate(student.lastActivity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
