
"use client";

import React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { useAuth } from "@/app/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {HoverCard,HoverCardContent,HoverCardTrigger,} from "@/components/ui/hover-card"
import {Sheet,SheetContent,SheetDescription,SheetHeader,SheetTitle,SheetTrigger,} from "@/components/ui/sheet"

import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger,} from "@/components/ui/dialog"
import { Gift, Zap, Bell, Home } from "lucide-react"
import { useRouter } from "next/navigation"


const Navbar = () => {

    const { user } = useAuth();
    const router = useRouter()
    
  const scrolled = useScrollTop();
  const { isLoggedIn, login, register, logout } = useAuth(); // 👈 from context
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div
      className={cn(
        "z-50 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 fixed top-0 flex items-center w-full p-6 border-b border-gray-200/50 dark:border-gray-700/50",
        scrolled && "shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"
      )}
    >
      <div className="flex items-center">
        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-md">
          <Image 
            src="/Images/Logo.svg" 
            alt="logo" 
            width={24} 
            height={24} 
            className="filter brightness-0 invert"
          />
        </div>
        <p className="pl-3 font-bold text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Auto Archive
        </p>
      </div>
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-4">
        <div className="md:flex md:items-center md:gap-4 hidden">
          <Button 
            variant="ghost"
            onClick={() => handleNavigation('/customer/home')}
            className="text-sm font-medium hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-green-600" />
            Home
          </Button>
          <Button 
            variant="ghost"
            onClick={() => handleNavigation('/customer/promotions')}
            className="text-sm font-medium hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-orange-500" />
            Promotions
          </Button>
          <Button 
            variant="ghost"
            onClick={() => handleNavigation('/customer/launches')}
            className="text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-blue-600" />
            New Launches
          </Button>
          <Button 
            variant="ghost"
            onClick={() => handleNavigation('/customer/notifications')}
            className="text-sm font-medium hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-purple-600" />
            Notifications
          </Button>
        </div>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              <Avatar className="h-8 w-8 ring-2 ring-green-500/30">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50">
            <div className="flex justify-between space-x-4">
              <Avatar className="h-16 w-16 ring-2 ring-green-500/30">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-lg">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <h4 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {user?.name || "Customer"}
                </h4>
                <p className="text-sm text-gray-600">
                  {user?.email || "customer@example.com"}
                </p>
                <div className="flex items-center pt-2 space-x-2">
                  <span className="text-xs text-gray-500">Role:</span>
                  <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 rounded-full">
                    Customer
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white cursor-pointer">
          Dashboard
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="md:hidden p-2 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 cursor-pointer"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-80 bg-white/90 backdrop-blur-sm border-l border-gray-200/50"
          >
            <SheetHeader>
              <SheetTitle className="text-left bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Navigation Menu
              </SheetTitle>
              <SheetDescription className="text-left text-gray-600">
                Access your account features and explore deals
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              <Button 
                variant="ghost"
                onClick={() => handleNavigation('/customer/home')}
                className="w-full justify-start hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-green-600" />
                Home
              </Button>
              <Button 
                variant="ghost"
                onClick={() => handleNavigation('/customer/promotions')}
                className="w-full justify-start hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-orange-500" />
                Promotions
              </Button>
              <Button 
                variant="ghost"
                onClick={() => handleNavigation('/customer/launches')}
                className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-blue-600" />
                New Launches
              </Button>
              <Button 
                variant="ghost"
                onClick={() => handleNavigation('/customer/notifications')}
                className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-purple-600" />
                Notifications
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;
