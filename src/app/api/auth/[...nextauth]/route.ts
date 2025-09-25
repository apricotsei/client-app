import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';
import { User as DbUser } from '@/types/db'; // DBの型を別名でインポート

// DBから取得するユーザー情報の型
interface UserPacket extends DbUser, RowDataPacket {}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
        name: 'Credentials',
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials): Promise<NextAuthUser | null> {
            if (!credentials?.email || !credentials?.password) {
                return null;
            }

            try {
                const findUserSql = `SELECT * FROM users WHERE email = ?`;
                const [users] = await db.query<UserPacket[]>(findUserSql, [credentials.email]);
                
                if (users.length === 0) {
                    return null;
                }
                
                const user = users[0];
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

                if (!isPasswordValid) {
                    return null;
                }

                // NextAuthが期待するUserオブジェクトを返す
                return {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                };

            } catch (error) {
                console.error('Authorize error:', error);
                return null;
            }
        }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };