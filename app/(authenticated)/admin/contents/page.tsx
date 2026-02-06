import { Edit, Eye, EyeOff, FileText, PenLine, Play, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchAllContents } from "@/app/services/api/admin-server";
import type { ContentType } from "@/app/types";

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

export default async function AdminContentsPage() {
  const { data: contents } = await fetchAllContents();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="コンテンツ管理" description="学習コンテンツの作成・編集・削除" />
        <Link href="/admin/contents/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      {!contents || contents.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted-foreground">コンテンツがまだ登録されていません。</p>
          <Link href="/admin/contents/new" className="btn btn-primary mt-4">
            最初のコンテンツを作成
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">順序</th>
                <th className="px-4 py-3 text-left text-sm font-medium">タイトル</th>
                <th className="px-4 py-3 text-left text-sm font-medium">種類</th>
                <th className="px-4 py-3 text-left text-sm font-medium">週</th>
                <th className="px-4 py-3 text-left text-sm font-medium">フェーズ</th>
                <th className="px-4 py-3 text-center text-sm font-medium">公開</th>
                <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content) => (
                <tr key={content.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{content.display_order}</td>
                  <td className="px-4 py-3 font-medium">
                    <span className="line-clamp-1">{content.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded">
                      {getContentIcon(content.content_type)}
                      {getContentTypeLabel(content.content_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {content.week?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {content.week?.phase?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {content.is_published ? (
                      <Eye className="h-4 w-4 text-success mx-auto" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/contents/${content.id}/edit`}
                        className="btn btn-ghost p-2"
                        title="編集"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/contents/${content.id}/delete`}
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
