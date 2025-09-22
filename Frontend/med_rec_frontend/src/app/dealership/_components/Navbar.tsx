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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NavSelect from "./NavSelect";

const Navbar = () => {
  const { user } = useAuth();
  const scrolled = useScrollTop();
  const { isLoggedIn, login, register, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "z-50 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 fixed top-0 flex items-center w-full p-6 border-b border-gray-200/50 dark:border-gray-700/50",
        scrolled && "shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"
      )}
    >
      <div className="flex items-center">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md">
          <Image
            src="/Images/Logo.svg"
            alt="logo"
            width={24}
            height={24}
            className="filter brightness-0 invert"
          />
        </div>
        <p className="pl-3 font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Auto Archive
        </p>
      </div>

      <div className="ml-auto flex items-center gap-x-4">
        <div className="md:flex md:ml-auto md:justify-end md:space-x-4 hidden">
          <NavSelect />
        </div>

        <div className="flex items-center gap-x-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="cursor-pointer">
                <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <div className="flex justify-between space-x-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-500/30">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {user?.name || "User"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {user?.email || "user@example.com"}
                  </p>
                  <div className="flex items-center pt-2 space-x-2">
                    <span className="text-xs text-gray-500">Role:</span>
                    <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full">
                      Dealership Admin
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200 transition-all duration-200"
              >
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">
                  Are you sure you want to logout?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  You will be redirected to the login page and will need to sign in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={logout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="md:hidden p-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
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
              <SheetTitle className="text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Navigation Menu
              </SheetTitle>
              <SheetDescription className="text-left text-gray-600">
                Access all dealership features and sections
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <NavSelect />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;
