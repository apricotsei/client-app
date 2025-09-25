import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
    }

    const customerId = session.user.id; // ★ 変数名を customerId に変更

    try {
        // SQLクエリを修正
        const sql = `
            SELECT
                b.id,
                t.name AS trainer_name,
                b.session_start_time,
                b.session_end_time,
                b.status
            FROM bookings AS b
            JOIN shifts AS s ON b.shift_id = s.id
            JOIN trainers AS t ON s.trainer_id = t.id
            WHERE b.customer_id = ? 
            ORDER BY b.session_start_time DESC;
        `;

        const [rows] = await db.query<RowDataPacket[]>(sql, [customerId]); // ★ customerId を使用

        return NextResponse.json(rows);

    } catch (error) {
        console.error('予約履歴の取得に失敗しました:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    }
}