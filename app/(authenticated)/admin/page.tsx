import { BookOpen, Calendar, ClipboardList, FileText, Users } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/app/components/PageTitle";
import {
  fetchAllContents,
  fetchAllPhases,
  fetchAllWeeks,
  fetchStudentsProgress,
} from "@/app/services/api/admin-server";
import { fetchAllSubmissions } from "@/app/services/api/submissions-server";

export default async function AdminDashboardPage() {
  const [
    { data: phases },
    { data: weeks },
    { data: contents },
    { data: students },
    { data: submissions },
  ] = await Promise.all([
    fetchAllPhases(),
    fetchAllWeeks(),
    fetchAllContents(),
    fetchStudentsProgress(),
    fetchAllSubmissions(),
  ]);

  const stats = [
    {
      title: "フェーズ数",
      value: phases?.length || 0,
      href: "/admin/phases",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "週数",
      value: weeks?.length || 0,
      href: "/admin/weeks",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "コンテンツ数",
      value: contents?.length || 0,
      href: "/admin/contents",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "受講生数",
      value: students?.length || 0,
      href: "/admin/students",
      icon: Users,
      color: "bg-orange-500",
    },
    {
      title: "提出数",
      value: submissions?.length || 0,
      href: "/admin/submissions",
      icon: ClipboardList,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageTitle title="管理ダッシュボード" description="学習コンテンツと受講生の管理" />

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="card p-4 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} text-white mb-3`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* 最近の提出 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近の提出</h2>
          <Link href="/admin/submissions" className="text-sm text-primary hover:underline">
            すべて表示
          </Link>
        </div>

        {!submissions || submissions.length === 0 ? (
          <p className="text-muted-foreground">まだ提出がありません。</p>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 5).map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium">{submission.user?.display_name}</p>
                  <p className="text-sm text-muted-foreground">{submission.content?.title}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(submission.submitted_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
