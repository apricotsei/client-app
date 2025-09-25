'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Loader2, Ticket } from 'lucide-react';
import { User } from '@/types/db';

// 予約情報の型定義
type Booking = {
    id: number;
    trainer_name: string;
    session_start_time: string;
    session_end_time: string;
    status: 'confirmed' | 'cancelled' | string;
};

// プロフィールフォーム用のコンポーネント
function ProfileForm() {
    const [profile, setProfile] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (!response.ok) throw new Error('プロフィールの取得に失敗しました。');
                const data = await response.json();
                // DBのNULL値を空文字に変換してフォームで扱いやすくする
                Object.keys(data).forEach(key => {
                    if (data[key] === null) {
                        data[key] = '';
                    }
                });
                setProfile(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '更新に失敗しました。');
            }
            alert('プロフィールを更新しました。');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>;

    return (
        <div className="space-y-8">
            {/* 現在のプラン表示セクション */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Ticket className="mr-2 h-5 w-5 text-primary" />
                        現在のプラン
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">契約プラン</span>
                        <span className="font-bold text-xl">{profile.plan_name || '未契約'}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">残りセッション回数</span>
                        <span className="font-bold text-xl">{profile.remaining_sessions ?? 0}回</span>
                    </div>
                </CardContent>
            </Card>

            {/* プロフィール編集フォーム */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">氏名</Label>
                        <Input id="full_name" name="full_name" value={profile.full_name || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">生年月日</Label>
                        <Input id="date_of_birth" name="date_of_birth" type="date" value={profile.date_of_birth || ''} onChange={handleChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">住所</Label>
                    <Input id="address" name="address" value={profile.address || ''} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="height">身長 (cm)</Label>
                        <Input id="height" name="height" type="number" step="0.1" value={profile.height || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weight">体重 (kg)</Label>
                        <Input id="weight" name="weight" type="number" step="0.1" value={profile.weight || ''} onChange={handleChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="goal">目標</Label>
                    <Textarea id="goal" name="goal" value={profile.goal || ''} onChange={handleChange} placeholder="例：3ヶ月で-5kg、健康的な身体作り" />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'プロフィールを更新'}
                </Button>
            </form>
        </div>
    );
}


// 予約履歴用のコンポーネント
function BookingHistory() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/my-bookings');
            if (!response.ok) throw new Error('予約履歴の取得に失敗しました。');
            const data: Booking[] = await response.json();
            setBookings(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleCancelBooking = async (bookingId: number) => {
        if (!window.confirm('本当にこの予約をキャンセルしますか？')) return;
        setCancellingId(bookingId);
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, { method: 'PATCH' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '予約のキャンセルに失敗しました。');
            }
            alert('予約をキャンセルしました。');
            fetchBookings();
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setCancellingId(null);
        }
    };
    
    if (loading) return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>;
    if (error) return <p className="text-red-500">エラー: {error}</p>;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>日時</TableHead>
                    <TableHead>トレーナー</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>{format(new Date(booking.session_start_time), 'M月d日 HH:mm', { locale: ja })}</TableCell>
                            <TableCell>{booking.trainer_name}</TableCell>
                            <TableCell>
                                <Badge variant={booking.status === 'cancelled' ? 'destructive' : 'default'}>
                                    {booking.status === 'confirmed' ? '確定' : 'キャンセル済'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {booking.status === 'confirmed' && (
                                    <Button variant="ghost" size="sm" onClick={() => handleCancelBooking(booking.id)} disabled={cancellingId === booking.id}>
                                        {cancellingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'キャンセル'}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">予約履歴はありません。</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

// マイページのメインコンポーネント
export default function MyPage() {
    const { status: sessionStatus } = useSession();

    if (sessionStatus === 'loading') {
        return <div className="container mx-auto p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }

    if (sessionStatus === 'unauthenticated') {
        return <div className="container mx-auto p-8 text-center"><p>このページを表示するには、ログインしてください。</p></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="history">予約履歴</TabsTrigger>
                    <TabsTrigger value="profile">プロフィール情報</TabsTrigger>
                </TabsList>
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>予約履歴</CardTitle>
                            <CardDescription>お客様の予約履歴一覧です。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingHistory />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>プロフィール情報</CardTitle>
                            <CardDescription>お客様の情報を入力・編集してください。トレーナーが指導の参考にします。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}