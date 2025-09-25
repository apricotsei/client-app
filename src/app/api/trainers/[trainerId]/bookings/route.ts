import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';

type RouteParams = {
    params: {
        trainerId: string;
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { trainerId } = params;

    if (!trainerId || isNaN(Number(trainerId))) {
        return NextResponse.json({ error: '無効なトレーナーIDです。' }, { status: 400 });
    }

    try {
        // bookingsテーブルとshiftsテーブルを結合し、特定のトレーナーIDに関連する予約のみを取得
        const sql = `
            SELECT b.session_start_time
            FROM bookings AS b
            JOIN shifts AS s ON b.shift_id = s.id
            WHERE s.trainer_id = ?
        `;

        const [rows] = await db.query<RowDataPacket[]>(sql, [trainerId]);
        
        // 予約済みの開始時刻の配列を返す
        const bookedTimes = rows.map(row => {
            // DBから取得したDateオブジェクトを 'YYYY-MM-DD HH:MM:SS' 形式の文字列に変換
            const date = new Date(row.session_start_time);
            const pad = (num: number) => num.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        });
        
        return NextResponse.json(bookedTimes);

    } catch (error) {
        console.error('予約情報の取得に失敗しました:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
    }
}