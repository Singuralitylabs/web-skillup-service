import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { USER_STATUS } from "./app/constants/user";
import { fetchUserStatusByIdInServer } from "./app/services/api/users-server";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

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
  const { status: userStatus, error: userError } = await fetchUserStatusByIdInServer({
    authId: user.id,
  });

  if (userError) {
    console.error("User data fetch error:", userError);
  }

  // ユーザーステータスに応じてポータルにリダイレクト
  if (!userStatus) {
    // ユーザー情報がない場合は承認待ちページへ
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
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
