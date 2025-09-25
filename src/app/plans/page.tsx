'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

type UserProfile = {
    plan_name: string;
    remaining_sessions: number;
};

const plans = [
    { name: '8回プラン', price: '80,000円', description: '週1回の2ヶ月集中プラン', features: ['週1回', '2ヶ月'] },
    { name: '16回プラン', price: '150,000円', description: '週2回の2ヶ月集中プラン', features: ['週2回', '2ヶ月'] },
    { name: '24回プラン', price: '220,000円', description: '週2回の3ヶ月集中プラン', features: ['週2回', '3ヶ月'] },
] as const; // as constでplan.nameの型を固定

export default function PlansPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => {
                    setUserProfile(data);
                    if (data.remaining_sessions > 0) {
                        router.push('/booking');
                    }
                });
        }
    }, [status, router]);
    
    // プランを選択した際の処理
    const handlePlanSelect = async (planName: typeof plans[number]['name']) => {
        setIsSubmitting(planName);
        try {
            const response = await fetch('/api/plans', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'プランの更新に失敗しました。');
            }
            
            alert(`${planName}にアップグレードしました！予約に進みます。`);
            router.push('/booking'); // トレーナー選択ページに移動

        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsSubmitting(null);
        }
    };

    if (status === 'loading' || (status === 'authenticated' && !userProfile)) {
        return (
            <div className="container mx-auto p-8 flex justify-center items-center h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">まずは新規登録から</CardTitle>
                        <CardDescription className="pt-2">
                            ご登録いただくと、特典として「お試しプラン（1回）」が自動で付与されます。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/register" passHref>
                            <Button size="lg">無料で新規登録に進む</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">プランをアップグレード</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    {userProfile?.plan_name}は終了しました。継続プランはこちらからお選びいただけます。
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <Card key={plan.name} className="flex flex-col">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <p className="text-4xl font-bold pt-4">{plan.price}</p>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                            <ul className="space-y-2 mb-6">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button 
                                className="w-full"
                                onClick={() => handlePlanSelect(plan.name)}
                                disabled={!!isSubmitting}
                            >
                                {isSubmitting === plan.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : `このプランを選択`}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
