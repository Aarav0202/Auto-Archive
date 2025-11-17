"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";
import { LoginComponent } from "./LoginComponent";
import { RegisterComponent } from "./RegisterComponent";
import { useAuth } from "@/app/context/AuthContext";

const HeadingSection = () => {
  
  const { isLoggedIn, login, register, logout } = useAuth(); // 👈 from context

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Your Dealership, Inventory & Customer Records. Unified. Welcome to{" "}
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent underline decoration-blue-500">
          Auto Archive
        </span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-400">
        AutoArchive is the connected platform where <br />
        <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold">
          automotive service management
        </span> becomes smarter, faster, and more efficient
      </h3>

      <div className="flex gap-3 justify-center flex-wrap">
        {isLoggedIn ? (
          <Button 
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-all duration-200 cursor-pointer"
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

export default HeadingSection;
