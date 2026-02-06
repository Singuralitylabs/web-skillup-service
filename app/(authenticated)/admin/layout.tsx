import { BookOpen, Calendar, ClipboardList, FileText, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkAdminPermissions } from "@/app/services/auth/permissions";
import { getServerAuth } from "@/app/services/auth/server-auth";

const ADMIN_NAV_ITEMS = [
  { title: "ダッシュボード", href: "/admin", icon: LayoutDashboard },
  { title: "フェーズ管理", href: "/admin/phases", icon: BookOpen },
  { title: "週管理", href: "/admin/weeks", icon: Calendar },
  { title: "コンテンツ管理", href: "/admin/contents", icon: FileText },
  { title: "受講生進捗", href: "/admin/students", icon: Users },
  { title: "提出一覧", href: "/admin/submissions", icon: ClipboardList },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userRole } = await getServerAuth();

  if (!userRole || !checkAdminPermissions(userRole)) {
    redirect("/");
  }

  return (
    <div>
      {/* 管理画面ナビゲーション */}
      <nav className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="btn btn-ghost flex items-center gap-2 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      {children}
    </div>
  );
}
