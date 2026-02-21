"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <FileText className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight hidden sm:inline">
            TaxGrievance<span className="text-primary">Pro</span>
          </span>
        </Link>
      </div>

      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col gap-4 mt-8">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Menu */}
      <nav className="items-center gap-6 hidden md:flex">
        <Link
          href="/#how-it-works"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          How It Works
        </Link>
        <Link
          href="/#features"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Features
        </Link>
        <div className="h-4 w-px bg-border" />
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
