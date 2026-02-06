import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchAllPhases } from "@/app/services/api/admin-server";

export default async function AdminPhasesPage() {
  const { data: phases } = await fetchAllPhases();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="フェーズ管理" description="学習フェーズの作成・編集・削除" />
        <Link href="/admin/phases/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      {!phases || phases.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted-foreground">フェーズがまだ登録されていません。</p>
          <Link href="/admin/phases/new" className="btn btn-primary mt-4">
            最初のフェーズを作成
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">順序</th>
                <th className="px-4 py-3 text-left text-sm font-medium">名前</th>
                <th className="px-4 py-3 text-left text-sm font-medium">説明</th>
                <th className="px-4 py-3 text-center text-sm font-medium">公開</th>
                <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((phase) => (
                <tr key={phase.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{phase.display_order}</td>
                  <td className="px-4 py-3 font-medium">{phase.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {phase.description ? (
                      <span className="line-clamp-1">{phase.description}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {phase.is_published ? (
                      <Eye className="h-4 w-4 text-success mx-auto" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/phases/${phase.id}/edit`}
                        className="btn btn-ghost p-2"
                        title="編集"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/phases/${phase.id}/delete`}
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
