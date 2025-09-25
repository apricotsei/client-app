import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { Shift } from '@/types/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { trainerId: string } }
    ) {
    try {
        const trainerId = parseInt(params.trainerId, 10);
        if (isNaN(trainerId)) {
        return NextResponse.json({ error: 'Invalid trainer ID' }, { status: 400 });
        }

        // 予約可能な 'confirmed' ステータスのシフトのみを取得
        const sql = `
        SELECT * FROM shifts 
        WHERE trainer_id = ? AND status = 'confirmed' 
        ORDER BY start_time ASC
        `;
        const [rows] = await db.query<RowDataPacket[]>(sql, [trainerId]);

        const shifts: Shift[] = rows.map(row => ({
            id: row.id,
            trainer_id: row.trainer_id,
            start_time: new Date(row.start_time).toISOString(),
            end_time: new Date(row.end_time).toISOString(),
            status: row.status,
        }));

        return NextResponse.json(shifts);
    } catch (error) {
        console.error('Failed to fetch shifts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}