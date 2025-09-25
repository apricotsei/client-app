'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Trainer, Shift } from '@/types/db';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type PageProps = {
    params: { trainerId: string };
};

// YYYY-MM-DD HH:MM:SS 形式の文字列を生成するヘルパー関数
const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export default function BookingPage({ params }: PageProps) {
    const { data: session } = useSession();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]); // ★ 予約済みの枠を保持するstate
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ shiftId: number; startTime: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const trainerId = params.trainerId;

    // ★ データをまとめて取得する関数を定義
    const fetchData = useCallback(async () => {
        try {
            // ローディング状態をリセット
            setLoading(true);
            const [trainerRes, shiftsRes, bookingsRes] = await Promise.all([
                fetch(`/api/trainers/${trainerId}`),
                fetch(`/api/trainers/${trainerId}/shifts`),
                fetch(`/api/trainers/${trainerId}/bookings`) // ★ 予約情報も取得
            ]);

            if (!trainerRes.ok) throw new Error('トレーナー情報の取得に失敗しました。');
            const trainerData = await trainerRes.json();
            setTrainer(trainerData);

            if (!shiftsRes.ok) throw new Error('シフト情報の取得に失敗しました。');
            const shiftsData = await shiftsRes.json();
            setShifts(shiftsData);
            
            if (!bookingsRes.ok) throw new Error('予約情報の取得に失敗しました。');
            const bookingsData = await bookingsRes.json();
            setBookedSlots(bookingsData);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [trainerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const generateTimeSlots = (shift: Shift) => {
        const slots = [];
        let current = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        while (current < end) {
            slots.push(new Date(current));
            current.setHours(current.getHours() + 1);
        }
        return slots;
    };

    const handleBooking = async () => {
        if (!selectedSlot || !session?.user?.id) {
            alert('予約する時間を選択し、ログインしてください。');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shift_id: selectedSlot.shiftId,
                    session_start_time: selectedSlot.startTime,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '予約に失敗しました。');
            }

            alert('予約が完了しました！');
            setSelectedSlot(null);
            // ★ 予約完了後、最新の予約状況を再取得して画面を更新
            fetchData();
        } catch (err) {
            console.error(err);
            alert((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="container mx-auto p-8"><p>読み込み中...</p></div>;
    if (error) return <div className="container mx-auto p-8"><p className="text-red-500">エラー: {error}</p></div>;
    if (!trainer) return <div className="container mx-auto p-8"><p>トレーナーが見つかりません。</p></div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{trainer.name}トレーナー</CardTitle>
                    <CardDescription className="text-lg">ご希望の予約時間を選択してください。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {shifts.length > 0 ? (
                        shifts.map(shift => (
                            <div key={shift.id}>
                                <h3 className="font-semibold text-lg mb-2 border-b pb-1">
                                    {format(new Date(shift.start_time), 'yyyy年M月d日 (E)', { locale: ja })}
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {generateTimeSlots(shift).map(slot => {
                                        const slotString = toLocalISOString(slot);
                                        const isSelected = selectedSlot?.shiftId === shift.id && selectedSlot?.startTime === slotString;
                                        const isBooked = bookedSlots.includes(slotString); // ★ 予約済みかチェック
                                        
                                        return (
                                            <Button
                                                key={slotString}
                                                variant={isSelected ? "default" : "outline"}
                                                onClick={() => setSelectedSlot({ shiftId: shift.id, startTime: slotString })}
                                                disabled={isBooked} // ★ 予約済みならボタンを無効化
                                            >
                                                {isBooked ? '予約済' : format(slot, 'HH:mm')}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>現在予約可能なシフトはありません。</p>
                    )}

                    <div className="pt-4 mt-4 border-t">
                        <Button
                            onClick={handleBooking}
                            disabled={!selectedSlot || isSubmitting || !session}
                            size="lg"
                            className="w-full"
                        >
                            {isSubmitting ? '予約処理中...' : (session ? 'この時間で予約する' : 'ログインして予約する')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}