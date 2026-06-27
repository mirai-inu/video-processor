// 認可ポリシー(純粋関数)。next-auth に依存しないので単体テスト可能。
// NextAuth 本体の組み立ては ./auth が行い、ここから import して使う。

function getAllowedDomains(): string[] {
  const raw = process.env.ALLOWED_DOMAINS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
}

// ローカル開発用の dummy ログインが有効かどうか。
// 環境変数 AUTH_DUMMY_ENABLED === 'true' のときだけ有効。
// 本番では絶対に設定しないこと(有効だと誰でもログインできてしまう)。
export function isDummyAuthEnabled(): boolean {
  return process.env.AUTH_DUMMY_ENABLED === 'true';
}

// 許可ドメインのメールか判定する。ALLOWED_DOMAINS 未設定は fail-closed(誰も通さない)。
export function isAllowedEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const domains = getAllowedDomains();
  if (domains.length === 0) return false;
  return domains.some((domain) => email.endsWith(`@${domain}`));
}

// ログイン画面と公開ページ(法的ページ)は未ログインでも到達可能にする。
// /auth/* を deny にすると signin への無限リダイレクトになる。
// /privacy・/terms は Google OAuth の同意画面が参照するため公開しておく。
export function isPublicPath(path: string): boolean {
  if (path === '/auth' || path.startsWith('/auth/')) return true;
  if (path === '/privacy' || path.startsWith('/privacy/')) return true;
  if (path === '/terms' || path.startsWith('/terms/')) return true;
  return false;
}

// 認可ゲートの大原則: default-deny。
// middleware の matcher は静的アセットと /api/* を除く全パスにかかる(= 全ページが対象)。
// public 扱い以外は「ログイン済み + 許可ドメイン」を要求する。新規ページを足しても
// 設定の追記なしで自動的に保護される(allowlist 追記漏れによる無認証露出を防ぐ)。
export function authorizeRequest(
  path: string,
  user: { email?: string | null } | null | undefined
): boolean {
  if (isPublicPath(path)) return true;

  // ローカル dummy モード: 認証済みなら誰でも通す。
  // 本番では AUTH_DUMMY_ENABLED 未設定なのでこの分岐は無効。
  if (isDummyAuthEnabled()) return Boolean(user?.email);

  // それ以外は要ログイン + 許可ドメイン(default-deny)。
  return isAllowedEmail(user?.email);
}
