"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { USER_STATUS } from "@/app/constants/user";
import { useSupabaseAuth } from "@/app/providers/supabase-auth-provider";
import { fetchUserStatusById } from "@/app/services/api/users-client";
import type { UserStatusType } from "@/app/types";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth();
  const [userStatus, setUserStatus] = useState<UserStatusType | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    if (SKIP_AUTH) {
      setStatusLoading(false);
      return;
    }

    if (loading) return;

    if (!user) {
      const redirectUrl = new URL("/login", PORTAL_URL);
      redirectUrl.searchParams.set("redirect", window.location.href);
      window.location.href = redirectUrl.toString();
      return;
    }

    const checkUserStatus = async () => {
      try {
        const { status, error } = await fetchUserStatusById({ authId: user.id });

        if (error || !status) {
          window.location.href = `${PORTAL_URL}/login`;
          return;
        }

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

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (SKIP_AUTH) {
    return <>{children}</>;
  }

  if (user && userStatus === USER_STATUS.ACTIVE) {
    return <>{children}</>;
  }

  return null;
}
