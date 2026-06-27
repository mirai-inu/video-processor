export { auth as middleware } from './auth';

export const config = {
  // 認可ゲートは default-deny。「ログイン画面以外は露出させない」を構造で担保するため、
  // 個別ページを allowlist 列挙せず「静的アセットと /api/* 以外の全パス」にゲートをかける。
  // 新規ページを足しても matcher の追記なしで自動的に保護される。
  //
  // 除外するもの:
  // - _next/static, _next/image, favicon.ico: 静的アセット(認証不要)
  // - api/*: 全 API route はハンドラ内で自前に認可する(BFF の X-API-Key 等)。NextAuth
  //   ゲートに通すと header bearer 認証の route が無認証扱いで壊れるため一律に除外する。
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
