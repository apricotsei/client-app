import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, OkPacket } from 'mysql2';

type RouteContext = {
    params: {
        bookingId: string;
    }
}

// PATCHメソッドで予約を更新（キャンセル）する
export async function PATCH(request: NextRequest, { params }: RouteContext) {
    const session = await getServerSession(authOptions);
    const { bookingId } = params;

    // 1. ユーザーがログインしているか確認
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
    }

    const customerId = session.user.id;

    if (!bookingId || isNaN(Number(bookingId))) {
        return NextResponse.json({ error: '無効な予約IDです。' }, { status: 400 });
    }

    try {
        // 2. キャンセルしようとしている予約が、本当にログイン中のユーザー自身のものかを確認
        const [bookingRows] = await db.query<RowDataPacket[]>(
            'SELECT customer_id FROM bookings WHERE id = ?',
            [bookingId]
        );

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: '指定された予約が見つかりません。' }, { status: 404 });
        }

        if (bookingRows[0].customer_id !== customerId) {
            // 他人の予約をキャンセルしようとした場合は、権限エラーを返す
            return NextResponse.json({ error: 'この予約をキャンセルする権限がありません。' }, { status: 403 });
        }

        // 3. 安全性が確認できたら、ステータスを'cancelled'に更新
        const sql = `
            UPDATE bookings
            SET status = 'cancelled'
            WHERE id = ? AND customer_id = ?
        `;

        const [result] = await db.query<OkPacket>(sql, [bookingId, customerId]);

        if (result.affectedRows === 0) {
            throw new Error('予約のキャンセルに失敗しました。');
        }

        return NextResponse.json({ message: '予約が正常にキャンセルされました。' });

    } catch (error) {
        console.error('予約のキャンセルに失敗しました:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    }
}