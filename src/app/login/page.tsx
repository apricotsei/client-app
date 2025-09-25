'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // NextAuthのsignIn関数を呼び出す
            const result = await signIn('credentials', {
                redirect: false, // ページリダイレクトを手動で制御する
                email,
                password,
            });

            if (result?.error) {
                // 認証失敗時のエラーハンドリング
                setError('メールアドレスまたはパスワードが正しくありません。');
                setIsLoading(false);
            } else if (result?.ok) {
                // ログイン成功時、トップページにリダイレクト
                router.push('/');
                router.refresh(); // サーバーコンポーネントを再描画させる
            }
        } catch (err) {
            setError('ログイン中に予期せぬエラーが発生しました。');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">ログイン</CardTitle>
                    <CardDescription>
                        メールアドレスとパスワードを入力してログインしてください
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">パスワード</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'ログイン中...' : 'ログイン'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}