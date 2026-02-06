import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchAllWeeks } from "@/app/services/api/admin-server";

export default async function AdminWeeksPage() {
  const { data: weeks } = await fetchAllWeeks();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="週管理" description="学習週の作成・編集・削除" />
        <Link href="/admin/weeks/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      {!weeks || weeks.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted-foreground">週がまだ登録されていません。</p>
          <Link href="/admin/weeks/new" className="btn btn-primary mt-4">
            最初の週を作成
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">順序</th>
                <th className="px-4 py-3 text-left text-sm font-medium">フェーズ</th>
                <th className="px-4 py-3 text-left text-sm font-medium">名前</th>
                <th className="px-4 py-3 text-center text-sm font-medium">公開</th>
                <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{week.display_order}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {week.phase?.name || "-"}
                  </td>
                  <td className="px-4 py-3 font-medium">{week.name}</td>
                  <td className="px-4 py-3 text-center">
                    {week.is_published ? (
                      <Eye className="h-4 w-4 text-success mx-auto" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/weeks/${week.id}/edit`}
                        className="btn btn-ghost p-2"
                        title="編集"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/weeks/${week.id}/delete`}
                        className="btn btn-ghost p-2 text-destructive"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
