"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Users,
  MessageCircle,
  Brain,
  Network,
  LogOut,
  Settings,
  BookOpen,
} from "lucide-react";
import AuthModal from "@/components/auth/auth-modal";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const navItems = [
    { href: "/dashboard/peer-learning", label: "Peer Learning", icon: Users },
    { href: "/dashboard/community", label: "Community", icon: MessageCircle },
    { href: "/dashboard/learn-ai", label: "Learn AI", icon: Brain },
    { href: "/dashboard/connections", label: "Connections", icon: Network },
    { href: "/meet", label: "Meet", icon: BookOpen },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                {/* Removed BookOpen icon as requested */}
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  PeerUp
                </span>
              </motion.div>
            </Link>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          size="sm"
                          className={`text-slate-300 hover:text-white transition-colors ${
                            isActive(item.href)
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  <Link href="/dashboard/notifications">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-slate-300 hover:text-white hover:bg-white/10"
                    >
                      <Bell className="w-5 h-5" />
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 border-0">
                        3
                      </Badge>
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                      >
                        <Avatar className="h-10 w-10 border-2 border-blue-400/20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-card border-white/20 bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl">
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard/profile")}
                        className="text-slate-200 hover:bg-white/10 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => handleAuthClick("login")}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => handleAuthClick("signup")}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}
