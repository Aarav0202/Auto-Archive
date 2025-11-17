"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { LoginComponent } from "./LoginComponent";
import { RegisterComponent } from "./RegisterComponent";
import { useAuth } from "@/app/context/AuthContext";

const Navbar = () => {
  
  const scrolled = useScrollTop();
  const { isLoggedIn, login, register, logout } = useAuth(); // 👈 from context

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

      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2 ">
        {isLoggedIn ? (
          <Button 
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white cursor-pointer"
          >
            Logout
          </Button>
        ) : (
          <LoginComponent />
        )}

        <RegisterComponent />
      </div>
    </div>
  );
};

export default Navbar;
