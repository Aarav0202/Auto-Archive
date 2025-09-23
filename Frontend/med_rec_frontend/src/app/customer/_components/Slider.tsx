"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Trash2, User, Mail, Settings } from "lucide-react";

const Slider = () => {
  const { user, logout } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleDeleteAccount = async () => {
    try {
      // API call to delete account endpoint
      const response = await fetch("http://localhost:8080/api/auth/delete-account", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Account deleted successfully:", data.message);
        // Show success message
        alert("Account deleted successfully. You will now be logged out.");
        // Logout the user after successful deletion
        logout();
        setDeleteDialogOpen(false);
      } else {
        console.error("Failed to delete account:", data.message);
        // Show error message
        alert(`Failed to delete account: ${data.message}`);
      }
    } catch (error) {
      console.error("Delete account error:", error);
      // Show network error message
      alert("Network error. Please check your connection and try again.");
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-all duration-200">
          <Settings className="h-4 w-4 text-blue-600" />
          <span className="text-blue-800 font-medium">Settings</span>
        </SheetTrigger>
        <SheetContent className="w-80 bg-white/90 backdrop-blur-sm border-l border-gray-200/50">
          <SheetHeader>
            <SheetTitle className="text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile Settings
            </SheetTitle>
            <SheetDescription className="text-left text-gray-600">
              Manage your account settings and preferences
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <div className="flex w-full justify-center mb-6">
              <Avatar className="h-20 w-20 ring-4 ring-blue-500/30">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="parent-div flex flex-col justify-between h-[60vh] w-full">
              <div className="space-y-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-500">Username:</span>
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-500">Email:</span>
                    <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {/* Logout Button */}
                <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900">
                        Do you want to logout?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        You will be logged out of your account and redirected to the login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={logout}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      >
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete Account Button */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/80 backdrop-blur-sm border border-red-200/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-900 flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-600" />
                        Are you sure you want to permanently delete your account?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        <div className="space-y-2">
                          <p className="font-semibold text-red-700">
                            This action cannot be undone!
                          </p>
                          <p>
                            Deleting your account will permanently remove:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Your profile information</li>
                            <li>All your vehicle records</li>
                            <li>Service history</li>
                            <li>Account preferences</li>
                          </ul>
                          <p className="text-sm font-medium text-gray-800 mt-3">
                            Are you absolutely sure you want to proceed?
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Slider


