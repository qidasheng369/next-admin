/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2025-01-06 09:45:15
 * @LastEditors: 齐大胜 782395122@qq.com
 * @LastEditTime: 2025-02-23 12:23:11
 * @Description: 用户登录鉴权
 */
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import prisma from '@/lib/prisma';
import Gitee from '@/providers/gitee';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Github({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Gitee({
      clientId: process.env.GITEE_CLIENT_ID,
      clientSecret: process.env.GITEE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET, // 目前生产环境是必须的
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7天过期
    updateAge: 24 * 60 * 60, // 每24小时刷新一次会话
  },
  callbacks: {
    // authorized({ request, auth }) {
    //   const { pathname } = request.nextUrl
    //   console.log('auth pathname', pathname);
    //   console.log('auth auth', auth);
    //   if (pathname === "/middleware-example") return !!auth
    //   return true
    // },
    jwt: async ({ token, trigger, session, account }) => {
      if (trigger === "update") token.name = session.user.name
      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token }
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      
      return session;
    },
  },
});
