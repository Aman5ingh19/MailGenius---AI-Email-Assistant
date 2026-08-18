import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignup: { label: 'Is Signup', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const isSignup = credentials.isSignup === 'true';

        if (isSignup) {
          // Registration flow
          const existing = await User.findOne({ email });
          if (existing) throw new Error('Email already in use. Please log in.');

          const hashed = await bcrypt.hash(password, 12);
          const user = await User.create({
            name: String(credentials.name || 'User').trim(),
            email,
            password: hashed,
            provider: 'credentials',
          });

          return { id: user._id.toString(), email: user.email, name: user.name, image: null };
        } else {
          // Login flow
          const user = await User.findOne({ email });
          if (!user || !user.password) {
            throw new Error('No account found. Please sign up first.');
          }

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) throw new Error('Incorrect password.');

          return { id: user._id.toString(), email: user.email, name: user.name, image: user.image || null };
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, upsert the user in MongoDB
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
        // On initial sign in, attach the user's DB _id to the token
        if (user.id) {
          token.userId = user.id;
        } else {
          // For OAuth users, look up by email
          try {
            await connectDB();
            const dbUser = await User.findOne({ email: token.email });
            if (dbUser) token.userId = dbUser._id.toString();
          } catch {}
        }
      }

      // Persist OAuth access tokens for Gmail / Outlook
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

  secret: process.env.NEXTAUTH_SECRET,
});
