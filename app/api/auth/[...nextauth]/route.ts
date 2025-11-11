import NextAuth, { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { supabase } from '@/lib/supabase';
import type { User } from '@/util/type/type';

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === 'github') {
          const { data, error } = await supabase
            .from('users')
            .select('uid')
            .eq('uid', user.id)
            .single();

          if (data) {
            console.log('User founded');
          } else if (!data) {
            const { error: insertError } = await supabase.from('users').insert({
              uid: user.id,
              name: user?.name,
              image: user?.image,
              email: user?.email,
            });

            if (insertError) {
              console.error('Supabase insert error:', insertError.message);
            } else {
              console.log('Insert new  User success');
            }
          } else if (error) {
            console.error('Supabase select error:', (error as Error).message);
          }
          token.uid = user.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // console.log("session " , session)
      (session.user as User).uid = token.uid as string;
      return session;
    },
  },

  pages: {
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
