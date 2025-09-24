"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, MessageSquare } from "lucide-react";

export default function Nav() {
  const { user, loading, logout, isAuthenticated } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="flex absolute px-10 z-10 w-full justify-between items-center pt-6 bg-transparent">
      {/* Left side - Logo/Home */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-authtext hover:text-primary transition-colors"
        >
          <Home className="h-5 w-5 md:h-6 md:w-6" />
          <h4 className="">Travel App</h4>
        </Link>
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-4">
        {/* User Menu */}
        {loading ? (
          <div className="w-8 h-8 rounded-full animate-pulse" />
        ) : isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-0 h-auto hover:bg-transparent"
            >
              <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                <AvatarImage
                  src={user.avatar_url || undefined}
                  alt={user.name || user.email}
                />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 liquid-glass-heavy rounded-lg shadow-lg border border-white/10 py-2 z-50">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-sm font-medium text-authtext truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-authtext truncate">{user.email}</p>
                </div>

                <Link
                  href="/user"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-authtext hover:bg-white/10 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-white/10 transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="text-white relative group">
            <p className="text-white group-hover:text-primary transition-colors duration-300">
              Login
            </p>
            {/* Animated bar */}
            <div className="w-0 h-0.5 bg-primary absolute -bottom-1 left-0 transition-all duration-300 ease-out group-hover:w-full"></div>
          </Link>
        )}
      </div>
    </nav>
  );
}
