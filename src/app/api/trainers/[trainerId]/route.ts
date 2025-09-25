import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { Trainer } from '@/types/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { trainerId: string } }
    ) {
    try {
        const trainerId = parseInt(params.trainerId, 10);
        if (isNaN(trainerId)) {
        return NextResponse.json({ error: 'Invalid trainer ID' }, { status: 400 });
        }

        const sql = `SELECT * FROM trainers WHERE id = ?`;
        const [rows] = await db.query<RowDataPacket[]>(sql, [trainerId]);

        if (rows.length === 0) {
        return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
        }

        const trainer: Trainer = {
            id: rows[0].id,
            name: rows[0].name,
            // 必要に応じて他のプロパティも追加
        };

        return NextResponse.json(trainer);
    } catch (error) {
        console.error('Failed to fetch trainer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}