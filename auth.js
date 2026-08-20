import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

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
          await connectDB();
          const email = String(credentials.email).toLowerCase().trim();
          const password = String(credentials.password);

          const user = await User.findOne({ email });
          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
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
          await connectDB();
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          await User.findOneAndUpdate(
            { email },
            {
              $set: {
                name: user.name || profile?.name || email.split('@')[0],
                image: user.image || profile?.avatar_url || null,
                provider: account.provider,
              },
              $setOnInsert: { email, createdAt: new Date() },
            },
            { upsert: true, new: true }
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
            await connectDB();
            const dbUser = await User.findOne({ email: token.email });
            if (dbUser) token.userId = dbUser._id.toString();
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
