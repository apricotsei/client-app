'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
    } from "@/components/ui/navigation-menu";
    import { Button } from './ui/button';

    export default function Header() {
    const { data: session, status } = useSession();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Example Gym</span>
            </Link>
            
            <div className="flex flex-1 items-center justify-end">
            <NavigationMenu>
                <NavigationMenuList>
                {/* ★ 文言とリンク先を修正 */}
                <NavigationMenuItem>
                    <Link href="/plans" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        プラン・予約
                    </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                {status === 'loading' ? (
                    <NavigationMenuItem><p>...</p></NavigationMenuItem>
                ) : session ? (
                    <>
                    <NavigationMenuItem>
                        <Link href="/mypage" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            マイページ
                        </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Button variant="ghost" onClick={() => signOut()}>
                        ログアウト
                        </Button>
                    </NavigationMenuItem>
                    </>
                ) : (
                    <>
                    <NavigationMenuItem>
                        <Link href="/login" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            ログイン
                        </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/register" passHref>
                        <Button asChild>
                            <a>新規登録</a>
                        </Button>
                        </Link>
                    </NavigationMenuItem>
                    </>
                )}
                </NavigationMenuList>
            </NavigationMenu>
            </div>
        </div>
        </header>
    );
}