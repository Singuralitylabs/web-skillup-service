import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { USER_STATUS } from "./app/constants/user";

function getPortalUrl(): string {
  const url = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
  // プロトコルが省略された場合にhttps://を補完
  if (url && !/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

const PORTAL_URL = getPortalUrl();

function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的ファイルなどはスキップ
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ポータル連携前は認証スキップ（.env.localでSKIP_AUTH=trueを設定）
  // TODO: ポータルサービス連携時に削除すること
  if (process.env.SKIP_AUTH === "true") {
    return response;
  }

  // 環境変数の存在チェック
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[middleware] Missing env vars:",
      !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
      !supabaseKey ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" : ""
    );
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    // ユーザー確認
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // 未認証の場合はポータルのログインページにリダイレクト
    if (error || !user) {
      const redirectUrl = new URL("/login", PORTAL_URL);
      redirectUrl.searchParams.set("redirect", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // 認証済みユーザーとして自分のユーザー情報を確認
    // ミドルウェアではcookies()が使えないため、既存のsupabaseクライアントで直接クエリ
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("status")
      .eq("auth_id", user.id)
      .eq("is_deleted", false)
      .maybeSingle();

    if (userError) {
      console.error("[middleware] User data fetch error:", userError);
    }

    const userStatus = userData?.status as string | null;

    // ユーザーステータスに応じてポータルにリダイレクト
    if (!userStatus) {
      const redirectUrl = new URL("/pending", PORTAL_URL);
      return NextResponse.redirect(redirectUrl);
    }

    if (userStatus === USER_STATUS.PENDING) {
      const redirectUrl = new URL("/pending", PORTAL_URL);
      return NextResponse.redirect(redirectUrl);
    }

    if (userStatus === USER_STATUS.REJECTED) {
      const redirectUrl = new URL("/rejected", PORTAL_URL);
      return NextResponse.redirect(redirectUrl);
    }

    // activeユーザーは通常ページにアクセス可能
    return response;
  } catch (e) {
    console.error("[middleware] Unhandled error:", e);
    return response;
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
