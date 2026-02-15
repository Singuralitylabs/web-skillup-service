import type { User } from "@supabase/supabase-js";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@/app/services/api/supabase-server";
import type { UserRoleType, UserStatusType } from "@/app/types";

export interface ServerAuthResult {
  user: User | null;
  userId: number | null;
  userStatus: UserStatusType | null;
  userRole: UserRoleType | null;
  error?: string;
}

// サーバーサイドで認証とユーザーステータスを確認
export async function getServerAuth(): Promise<ServerAuthResult> {
  // ポータル連携前は認証スキップして実在するユーザーを返す
  // TODO: ポータルサービス連携時に削除すること
  if (process.env.SKIP_AUTH === "true") {
    const supabase = await createAdminSupabaseClient();
    const { data } = await supabase
      .from("users")
      .select("id, status, role")
      .eq("is_deleted", false)
      .eq("status", "active")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (!data) {
      return {
        user: null,
        userId: null,
        userStatus: null,
        userRole: null,
        error: "SKIP_AUTH: アクティブなユーザーがDBに存在しません",
      };
    }

    return {
      user: null,
      userId: data.id,
      userStatus: data.status as UserStatusType,
      userRole: data.role as UserRoleType,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // ユーザー認証確認（セキュア）
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, userId: null, userStatus: null, userRole: null };
    }

    // ユーザーステータス確認
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, status, role")
      .eq("auth_id", user.id)
      .eq("is_deleted", false)
      .single();

    if (userError || !userData) {
      return {
        user,
        userId: null,
        userStatus: null,
        userRole: null,
        error: "ユーザー情報が見つかりません",
      };
    }

    return {
      user,
      userId: userData.id,
      userStatus: userData.status as UserStatusType,
      userRole: userData.role as UserRoleType,
    };
  } catch (error) {
    console.error("サーバー認証エラー:", error);
    return {
      user: null,
      userId: null,
      userStatus: null,
      userRole: null,
      error: "サーバー認証エラーが発生しました",
    };
  }
}
