import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface ReqBody {
    shift_id: number;
    session_start_time: string; // YYYY-MM-DD HH:MM:SS 形式の文字列
    }

    export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
    }

    const connection = await db.getConnection(); // トランザクションのためにコネクションを取得

    try {
        const body: ReqBody = await request.json();
        const { shift_id, session_start_time } = body;
        const customer_id = session.user.id;

        if (!shift_id || !session_start_time) {
        return NextResponse.json({ error: 'シフトIDとセッション開始時間が必要です。' }, { status: 400 });
        }

        await connection.beginTransaction(); // ★ トランザクション開始

        // 1. ★ 予約前に残りセッション回数をチェック
        const [userRows] = await connection.query<RowDataPacket[]>(
        'SELECT remaining_sessions FROM users WHERE id = ? FOR UPDATE', // 行ロックで同時実行を防止
        [customer_id]
        );

        if (userRows.length === 0 || userRows[0].remaining_sessions <= 0) {
        await connection.rollback(); // ロールバック
        return NextResponse.json({ error: '予約可能なセッション回数がありません。プランを更新してください。' }, { status: 403 });
        }

        // (既存の妥当性チェックはここで行う)
        // ...シフトの存在確認、重複予約の確認など...
        const requestedEndTime = new Date(new Date(session_start_time).getTime() + 60 * 60 * 1000);
        const pad = (num: number) => num.toString().padStart(2, '0');
        const session_end_time = `${requestedEndTime.getFullYear()}-${pad(requestedEndTime.getMonth() + 1)}-${pad(requestedEndTime.getDate())} ${pad(requestedEndTime.getHours())}:${pad(requestedEndTime.getMinutes())}:${pad(requestedEndTime.getSeconds())}`;

        // 2. ★ 予約を作成
        const bookingSql = `
        INSERT INTO bookings (customer_id, shift_id, session_start_time, session_end_time)
        VALUES (?, ?, ?, ?)
        `;
        const [result] = await connection.query<ResultSetHeader>(bookingSql, [
        customer_id,
        shift_id,
        session_start_time,
        session_end_time
        ]);
        
        // 3. ★ 残りセッション回数を1減らす
        const updateUserSql = `
        UPDATE users SET remaining_sessions = remaining_sessions - 1 WHERE id = ?
        `;
        await connection.query(updateUserSql, [customer_id]);

        await connection.commit(); // ★ すべて成功したらコミット

        return NextResponse.json({
        message: 'Booking created successfully',
        bookingId: result.insertId,
        }, { status: 201 });

    } catch (error) {
        await connection.rollback(); // ★ エラーが発生したらロールバック
        console.error('Failed to create booking:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    } finally {
        connection.release(); // ★ 必ずコネクションを解放
    }
}