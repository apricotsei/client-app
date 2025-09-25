import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, OkPacket } from 'mysql2';
import { User } from '@/types/db';

// GET: ログインユーザーのプロフィール情報を取得
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
    }

    try {
        // ★ plan_name と remaining_sessions も取得するように修正
        const sql = `
            SELECT full_name, date_of_birth, address, height, weight, goal, plan_name, remaining_sessions 
            FROM users WHERE id = ?
        `;
        const [rows] = await db.query<RowDataPacket[]>(sql, [session.user.id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'ユーザーが見つかりません。' }, { status: 404 });
        }
        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error('プロフィールの取得に失敗しました:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    }
}

// PATCH: ログインユーザーのプロフィール情報を更新
export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
    }

    try {
        const body: Partial<User> = await request.json();
        
        const fields = Object.keys(body).filter(key => {
            const userKey = key as keyof User;
            // plan_name と remaining_sessions は更新対象から除外
            if (userKey === 'plan_name' || userKey === 'remaining_sessions') {
                return false;
            }
            return body[userKey] !== undefined;
        });
        
        if (fields.length === 0) {
            return NextResponse.json({ error: '更新するデータがありません。' }, { status: 400 });
        }

        const setClause = fields.map(key => `${key} = ?`).join(', ');
        const values = fields.map(key => body[key as keyof User]);

        const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
        values.push(session.user.id);

        const [result] = await db.query<OkPacket>(sql, values);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'ユーザーが見つからないか、データが変更されていません。' }, { status: 404 });
        }

        return NextResponse.json({ message: 'プロフィールが正常に更新されました。' });

    } catch (error) {
        console.error('プロフィールの更新に失敗しました:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    }
}