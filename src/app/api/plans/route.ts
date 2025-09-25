import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import type { OkPacket } from 'mysql2';

type ReqBody = {
    planName: '8回プラン' | '16回プラン' | '24回プラン';
}

// 各プランのセッション回数を定義
const PLAN_DETAILS = {
    '8回プラン': { sessions: 8 },
    '16回プラン': { sessions: 16 },
    '24回プラン': { sessions: 24 },
};

// PATCHメソッドでユーザーのプランを更新する
export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
    }

    try {
        const { planName } = (await request.json()) as ReqBody;
        const customerId = session.user.id;

        const plan = PLAN_DETAILS[planName];

        if (!plan) {
            return NextResponse.json({ error: '無効なプランです。' }, { status: 400 });
        }
        
        const { sessions } = plan;

        // データベースのユーザー情報を更新
        const sql = `
            UPDATE users 
            SET plan_name = ?, remaining_sessions = ? 
            WHERE id = ?
        `;
        
        const [result] = await db.query<OkPacket>(sql, [planName, sessions, customerId]);
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'ユーザーの更新に失敗しました。' }, { status: 404 });
        }

        return NextResponse.json({ message: `${planName}にアップグレードしました。` });

    } catch (error) {
        console.error('プランの更新に失敗しました:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    }
}