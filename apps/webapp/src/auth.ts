import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { authorizeRequest, isAllowedEmail, isDummyAuthEnabled } from './auth-policy';

// 認可ポリシーは ./auth-policy(純粋関数・単体テスト可能)に集約。
// 既存の import 互換のためここから re-export する。
export { authorizeRequest, isAllowedEmail, isDummyAuthEnabled };

// providers を動的に組む。Google は常に有効。
// dummy(Credentials)は AUTH_DUMMY_ENABLED=true のローカル開発時だけ追加する。
// 本番では AUTH_DUMMY_ENABLED を未設定にすること(有効だと誰でもログインできてしまう)。
const dummyProvider = Credentials({
  id: 'dummy',
  name: 'Dummy (local only)',
  credentials: {
    email: { label: 'Email', type: 'text' },
  },
  authorize: (credentials) => {
    const input = credentials?.email;
    const email = typeof input === 'string' && input.length > 0 ? input : 'dev@team-mir.ai';
    return { id: 'dummy-user', name: 'Dummy User', email };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Vercel preview で OAuth を回すため PKCE を無効化し state チェックのみ残す
      // (Google は client_secret を使う confidential client なので実用上の安全性は保たれる)。
      checks: ['state'],
    }),
    ...(isDummyAuthEnabled() ? [dummyProvider] : []),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    signIn({ account, profile }) {
      // dummy provider は AUTH_DUMMY_ENABLED が有効なときだけ通す。
      if (account?.provider === 'dummy') return isDummyAuthEnabled();
      return isAllowedEmail(profile?.email);
    },
    // default-deny。判定ロジックは authorizeRequest(./auth-policy)に集約。
    authorized({ auth, request }) {
      return authorizeRequest(request.nextUrl.pathname, auth?.user);
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
