'use client';
import { useState } from 'react';
import {
  Home,
  Plus,
  LogOut,
  Code,
  Menu,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const navigation = [
  { name: 'โพสต์ทั้งหมด', href: '/dashboard', icon: Home },
  { name: 'เพิ่มโพสต์ใหม่', href: '/dashboard/add', icon: Plus },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
      <Code className="h-6 w-6 text-primary" />
      <span className="hidden sm:inline-block">DevMarkCode</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-10">
        <Logo />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button size={'icon-lg'} variant="ghost" onClick={() => setIsOpen(true)}>
              <Menu/>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-2 mt-8 justify-between h-full">
              <div>
                 {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 m-1 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-accent"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              
              <div className="my-4 border-t" />
              </div>
              
              <Button
                variant="ghost"
                className="justify-start mb-10 w-full mx-1"
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
              >
                <LogOut className="h-5 w-5 mr-3" />
                ออกจากระบบ
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
