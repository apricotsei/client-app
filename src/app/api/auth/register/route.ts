import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import { randomUUID } from 'crypto';

type ReqBody = {
    full_name: string;
    email: string;
    password?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { full_name, email, password } = (await request.json()) as ReqBody;

        if (!full_name || !email || !password) {
            return NextResponse.json({ error: 'すべてのフィールドは必須です。' }, { status: 400 });
        }

        const userId = randomUUID();
        const hashedPassword = await bcrypt.hash(password, 10);
        const planName = 'お試しプラン';
        const remainingSessions = 1;

        const sql = `
            INSERT INTO users (id, full_name, email, password_hash, plan_name, remaining_sessions)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query<ResultSetHeader>(sql, [
            userId, 
            full_name, 
            email, 
            hashedPassword, 
            planName, 
            remainingSessions
        ]);

        return NextResponse.json({ 
            message: 'ユーザー登録が成功しました。',
            userId: userId 
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration failed:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'このメールアドレスは既に使用されています。' }, { status: 409 });
        }
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    }
}