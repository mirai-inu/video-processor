import { signIn } from '@/auth';
import { isDummyAuthEnabled } from '@/auth-policy';

// callbackUrl はオープンリダイレクト防止のため内部パスのみ許可する。
function safeCallbackUrl(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value?.startsWith('/') && !value.startsWith('//')) return value;
  return '/';
}

// Next.js 14 では searchParams は Promise ではなくそのまま渡る。
export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string | string[] };
}) {
  const redirectTo = safeCallbackUrl(searchParams.callbackUrl);
  const dummyEnabled = isDummyAuthEnabled();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F7F4F0 0%, #e8f5f0 100%)',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2.5rem 3rem',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎬</div>
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#089781',
            marginBottom: '0.5rem',
          }}
        >
          みらい動画スタジオ
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
          利用するにはチームみらいのアカウントでログインしてください
        </p>
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo });
          }}
        >
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #64D8C6, #BCECD3)',
              color: '#1F2937',
              fontWeight: 600,
              border: '1px solid #2AA693',
              padding: '0.75rem 2rem',
              borderRadius: '999px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Googleでログイン
          </button>
        </form>
        {dummyEnabled ? (
          <form
            action={async () => {
              'use server';
              await signIn('dummy', { email: 'dev@team-mir.ai', redirectTo });
            }}
          >
            <button
              type="submit"
              style={{
                background: '#fff',
                color: '#6B7280',
                fontWeight: 600,
                border: '1px dashed #D1D5DB',
                padding: '0.6rem 2rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                width: '100%',
                marginTop: '0.75rem',
              }}
            >
              dummyログイン(ローカル開発用)
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
