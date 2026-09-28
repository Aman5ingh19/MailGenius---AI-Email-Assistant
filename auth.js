import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '3oR2rzaQX+dRvtDFgHL9M00l31ulHQ3jELnbeK5UTeI=',
  providers: [
    Credentials({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const supabase = getSupabaseAdmin();
          if (!supabase) {
            console.error('[Auth] Supabase client is not configured.');
            return null;
          }

          const email = String(credentials.email).toLowerCase().trim();
          const password = String(credentials.password);

          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (error || !user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image || null,
          };
        } catch (err) {
          console.error('[Auth] authorize error:', err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'credentials') {
        try {
          const supabase = getSupabaseAdmin();
          if (!supabase) return true;

          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          await supabase.from('users').upsert(
            {
              email,
              name: user.name || profile?.name || email.split('@')[0],
              image: user.image || profile?.avatar_url || null,
              provider: account.provider,
            },
            { onConflict: 'email' }
          );
        } catch (err) {
          console.error('[Auth] signIn callback error:', err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (user.id) {
          token.userId = user.id;
        } else {
          try {
            const supabase = getSupabaseAdmin();
            if (supabase && token.email) {
              const { data: dbUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', token.email.toLowerCase().trim())
                .maybeSingle();
              if (dbUser) token.userId = dbUser.id.toString();
            }
          } catch {}
        }
      }

      if (account?.access_token) token.accessToken = account.access_token;
      if (account?.provider) token.provider = account.provider;

      return token;
    },

    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId;
      if (token.accessToken) session.accessToken = token.accessToken;
      if (token.provider) session.provider = token.provider;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
});
