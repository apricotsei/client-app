import Link from 'next/link';
import { db } from '@/lib/db';
import { Trainer } from '@/types/db';
import type { RowDataPacket } from 'mysql2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


async function getTrainers(): Promise<Trainer[]> {
    try {
        const [rows] = await db.query<RowDataPacket[]>('SELECT id, name FROM trainers ORDER BY id ASC');
        // 念のため型アサーションを行う前にフィルタリング
        return (rows as Trainer[]).filter(t => t && typeof t.id === 'number' && typeof t.name === 'string');
    } catch (error) {
        console.error('Failed to fetch trainers:', error);
        return [];
    }
}

export default async function BookingTopPage() {
    const trainers = await getTrainers();

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">トレーナーを選択</h1>
                <p className="mt-4 text-lg text-muted-foreground">ご希望のパーソナルトレーナーを選択して、予約に進んでください。</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {trainers.map((trainer) => (
                    <Link href={`/booking/${trainer.id}`} key={trainer.id} className="group">
                        <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                            <CardHeader>
                                {/* 将来的にトレーナーの画像などをここに表示できます */}
                            </CardHeader>
                            <CardContent className="p-6 text-center">
                                <h3 className="text-xl font-bold">{trainer.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">詳細を見て予約する →</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}