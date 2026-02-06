"use client";

import { BookOpen, ClipboardList, House, LogOut, Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { createClientSupabaseClient } from "@/app/services/api/supabase-client";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    title: "ホーム",
    href: "/",
    icon: <House className="h-5 w-5" />,
  },
  {
    title: "学習コンテンツ",
    href: "/learn",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "提出履歴",
    href: "/submissions",
    icon: <ClipboardList className="h-5 w-5" />,
  },
];

const ADMIN_NAV_ITEM: NavItem = {
  title: "管理画面",
  href: "/admin",
  icon: <Settings className="h-5 w-5" />,
};

const LOGOUT_NAV_ITEM: NavItem = {
  title: "ログアウト",
  href: "#",
  icon: <LogOut className="h-5 w-5" />,
};

export function SideNav({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // isAdminに応じて動的にnavItemsを構築
  const navItems = useMemo<NavItem[]>(
    () => [...DEFAULT_NAV_ITEMS, ...(isAdmin ? [ADMIN_NAV_ITEM] : []), LOGOUT_NAV_ITEM],
    [isAdmin]
  );

  const handleSignOut = async () => {
    const supabase = createClientSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = `${PORTAL_URL}/login`;
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const NavLink = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => {
    const active = isActive(item.href);

    if (item.title === "ログアウト") {
      return (
        <button
          type="button"
          onClick={() => {
            handleSignOut();
            onClick?.();
          }}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted w-full text-left"
        >
          {item.icon}
          {item.title}
        </button>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all ${
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        {item.icon}
        {item.title}
      </Link>
    );
  };

  return (
    <>
      {/* ハンバーガーメニュー (モバイル用) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border shadow-sm"
        aria-label="メニューを開く"
      >
        <Menu size={24} />
      </button>

      {/* モバイル用ドロワー */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50">
          {/* オーバーレイ */}
          <button
            type="button"
            className="fixed inset-0 bg-black/50 cursor-default"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            aria-label="メニューを閉じる"
          />

          {/* ドロワー */}
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-lg font-bold flex items-center gap-2"
              >
                Sinlab Skillup
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-md hover:bg-muted"
                aria-label="メニューを閉じる"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink key={item.title} item={item} onClick={() => setOpen(false)} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* デスクトップ用サイドバー */}
      <div className="hidden sm:flex h-screen w-64 flex-col fixed left-0 top-0 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            Sinlab Skillup
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.title} item={item} />
          ))}
        </nav>
      </div>
    </>
  );
}
