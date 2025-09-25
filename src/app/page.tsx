import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Calendar, Target, MapPin, Users } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
        {/* ヒーローセクション */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4">
                あなたの理想を現実に変える場所
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
                経験豊富なトレーナー陣が、科学的根拠に基づいた指導であなたの目標達成を全力でサポートします。
            </p>
            {/* ★ リンク先を /plans に変更済み */}
            <Link href="/plans" passHref>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                今すぐ予約を始める
                </Button>
            </Link>
            </div>
        </section>

        {/* 特徴セクション */}
        <section className="w-full py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">選ばれる3つの理由</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                <CardHeader className="items-center">
                    <Dumbbell className="h-10 w-10 text-indigo-600 mb-4" />
                    <CardTitle>個別指導</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">一人ひとりの骨格や目標に合わせた、完全オーダーメイドのトレーニングプランを提供します。</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="items-center">
                    <Calendar className="h-10 w-10 text-indigo-600 mb-4" />
                    <CardTitle>柔軟な予約</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">24時間いつでもオンラインで予約可能。あなたのライフスタイルに合わせてトレーニングを続けられます。</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="items-center">
                    <Target className="h-10 w-10 text-indigo-600 mb-4" />
                    <CardTitle>目標達成</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">最新の設備と専門知識で、あなたの「なりたい姿」への最短ルートをナビゲートします。</p>
                </CardContent>
                </Card>
            </div>
            </div>
        </section>

        {/* 料金体系セクション */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">料金プラン</h2>
                <p className="text-muted-foreground mt-2">あなたの目標とペースに合わせて選べるプランをご用意しています。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="flex flex-col">
                <CardHeader><CardTitle>お試しプラン</CardTitle></CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-4xl font-bold">5,000円</p>
                    <p className="text-muted-foreground mt-2">初回の方限定プラン</p>
                </CardContent>
                </Card>
                <Card className="flex flex-col">
                <CardHeader><CardTitle>8回プラン</CardTitle></CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-4xl font-bold">80,000円</p>
                    <p className="text-muted-foreground mt-2">週に1回の2か月プラン</p>
                </CardContent>
                </Card>
                <Card className="flex flex-col">
                <CardHeader><CardTitle>16回プラン</CardTitle></CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-4xl font-bold">150,000円</p>
                    <p className="text-muted-foreground mt-2">週1の4か月 or 週2の2か月</p>
                </CardContent>
                </Card>
                <Card className="flex flex-col">
                <CardHeader><CardTitle>24回プラン</CardTitle></CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-4xl font-bold">220,000円</p>
                    <p className="text-muted-foreground mt-2">週1の6か月 or 週2の3か月</p>
                </CardContent>
                </Card>
            </div>
            </div>
        </section>

        {/* 店舗一覧セクション */}
        <section className="w-full py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">店舗一覧</h2>
                <p className="text-muted-foreground mt-2">通いやすい店舗をお選びいただけます。</p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center">
                <CardHeader><CardTitle>千葉駅前店</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p className="flex items-center justify-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> 千葉駅から徒歩7分</p>
                    <p className="flex items-center justify-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" /> トレーナー15名在籍</p>
                </CardContent>
                </Card>
                <Card className="text-center">
                <CardHeader><CardTitle>船橋駅前店</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p className="flex items-center justify-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> 船橋駅から徒歩5分</p>
                    <p className="flex items-center justify-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" /> トレーナー15名在籍</p>
                </CardContent>
                </Card>
                <Card className="text-center">
                <CardHeader><CardTitle>松戸駅前店</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p className="flex items-center justify-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> 松戸駅から徒歩5分</p>
                    <p className="flex items-center justify-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" /> トレーナー10名在籍</p>
                </CardContent>
                </Card>
            </div>
            </div>
        </section>
        
        {/* フッター */}
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4 md:px-6 text-center text-sm">
            <p>&copy; 2025 Example Gym. All Rights Reserved.</p>
            </div>
        </footer>
        </div>
    );
}