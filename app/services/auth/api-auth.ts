import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@/app/services/api/supabase-server";

interface ApiAuthResult {
  userId: number;
  authId: string;
}

/**
 * SKIP_AUTH時にDBから実在するユーザーIDを取得する
 */
async function getSkipAuthUserId(): Promise<number> {
  const supabase = await createAdminSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("is_deleted", false)
    .eq("status", "active")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  return data?.id ?? 1;
}

/**
 * APIルート用の認証チェック
 * SKIP_AUTH=true の場合はDBから実在するユーザーを取得して返す
 */
export async function getApiAuth(): Promise<
  { success: true; data: ApiAuthResult } | { success: false; error: string; status: number }
> {
  if (process.env.SKIP_AUTH === "true") {
    const userId = await getSkipAuthUserId();
    return { success: true, data: { userId, authId: "skip-auth" } };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "認証が必要です", status: 401 };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .eq("is_deleted", false)
    .single();

  if (userError || !userData) {
    return { success: false, error: "ユーザー情報が見つかりません", status: 403 };
  }

  return { success: true, data: { userId: userData.id, authId: user.id } };
}

/**
 * SKIP_AUTH用: Service Roleクライアントを取得
 * SKIP_AUTH=true の場合はRLSをバイパスするAdminクライアントを返す
 */
export async function getApiSupabaseClient() {
  if (process.env.SKIP_AUTH === "true") {
    return createAdminSupabaseClient();
  }
  return createServerSupabaseClient();
}
