import type { PostgrestError } from "@supabase/supabase-js";
import type { UserStatusType } from "@/app/types";
import { createClientSupabaseClient } from "./supabase-client";

/**
 * usersテーブルから指定のauth_idのユーザーのステータスを取得する（クライアントサイド用）
 */
export async function fetchUserStatusById({
  authId,
}: {
  authId: string;
}): Promise<{ status: UserStatusType | null; error: PostgrestError | null }> {
  const supabase = createClientSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("status")
    .eq("auth_id", authId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error || !data) {
    console.error("Supabase ユーザーステータス取得エラー:", error?.message || "No data found");
    return { status: null, error };
  }

  return { status: data.status as UserStatusType, error: null };
}

/**
 * usersテーブルから指定のauth_idのユーザーIDを取得する（クライアントサイド用）
 */
export async function fetchUserIdByAuthId({
  authId,
}: {
  authId: string;
}): Promise<{ userId: number | null; error: PostgrestError | null }> {
  const supabase = createClientSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error || !data) {
    return { userId: null, error };
  }

  return { userId: data.id, error: null };
}
