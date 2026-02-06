"use client";

import { useEffect, useState } from "react";
import { USER_STATUS } from "@/app/constants/user";
import { useSupabaseAuth } from "@/app/providers/supabase-auth-provider";
import { fetchUserStatusById } from "@/app/services/api/users-client";
import type { UserStatusType } from "@/app/types";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth();
  const [userStatus, setUserStatus] = useState<UserStatusType | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // ポータルのログインページにリダイレクト
      const redirectUrl = new URL("/login", PORTAL_URL);
      redirectUrl.searchParams.set("redirect", window.location.href);
      window.location.href = redirectUrl.toString();
      return;
    }

    // ユーザーのステータスを確認
    const checkUserStatus = async () => {
      try {
        const { status, error } = await fetchUserStatusById({ authId: user.id });

        if (error || !status) {
          window.location.href = `${PORTAL_URL}/login`;
          return;
        }

        // ステータスに応じてポータルにリダイレクト
        if (status === USER_STATUS.PENDING) {
          window.location.href = `${PORTAL_URL}/pending`;
          return;
        }
        if (status === USER_STATUS.REJECTED) {
          window.location.href = `${PORTAL_URL}/rejected`;
          return;
        }
        if (status !== USER_STATUS.ACTIVE) {
          console.error("不正なユーザーステータス:", status);
          window.location.href = `${PORTAL_URL}/login`;
          return;
        }
        setUserStatus(status as UserStatusType);
      } catch (error) {
        console.error("ユーザーステータス確認エラー:", error);
        window.location.href = `${PORTAL_URL}/login`;
      } finally {
        setStatusLoading(false);
      }
    };

    checkUserStatus();
  }, [user, loading]);

  // ローディング中
  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">読み込み中...</div>
        </div>
      </div>
    );
  }

  // 認証済みかつactiveな場合のみコンテンツを表示
  if (user && userStatus === USER_STATUS.ACTIVE) {
    return <>{children}</>;
  }

  // その他の場合は何も表示しない（リダイレクト処理が実行される）
  return null;
}
