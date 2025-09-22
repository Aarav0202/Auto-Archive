
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


const Navbar = () => {

    const { user } = useAuth();
    
  const scrolled = useScrollTop();
  const { isLoggedIn, login, register, logout } = useAuth(); // 👈 from context
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
        scrolled && "border-b shadow-sm"
      )}
    >
      <div>
        <Image src="/Images/Logo.svg" alt="logo" width={30} height={30} />
        <p className="pl-2">AA</p>
      </div>
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2 ">
        <HoverCard>
          <HoverCardTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="">
              <span className="text-xs font-bold text-muted-foreground">
                Username:
              </span>{" "}
              <span className="text-xs font-bold">{user?.name}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground">
                Email:
              </span>{" "}
              <span className="text-xs font-bold">{user?.email}</span>
            </div>
            <div className="w-full flex justify-center mt-5 gap-1.5">
              <div>
                <Sheet>
                  <SheetTrigger className="btn">Settings</SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Profile Info</SheetTitle>
                      <SheetDescription>
                        <div className="flex w-full justify-center">
                          <Avatar className="h-30 w-30">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="parent-div flex flex-col justify-between h-[70vh] w-full p-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-bold text-muted-foreground">
                                Username:
                              </span>{" "}
                              <span className="text-xs font-bold">
                                {user?.name}
                              </span>

                              <Dialog >
                                <DialogTrigger className="px-2 text-blue-500 cursor-pointer">Change Name</DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete your account and remove
                                      your data from our servers.
                                    </DialogDescription>
                                  </DialogHeader>
                                </DialogContent>
                              </Dialog>

                            </div>
                            <div>
                              <span className="text-xs font-bold text-muted-foreground">
                                Email:
                              </span>{" "}
                              <span className="text-xs font-bold">
                                {user?.email}
                              </span>
                            </div>
                          </div>

                          <div className="justify-center w-52 ">
                            <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">Logout</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Do you want to logout?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    You will be logged out of your account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={logout}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
              <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Logout</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Do you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be logged out of your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={logout}>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </HoverCardContent>
        </HoverCard>

        <Button>Hello</Button>
      </div>
    </div>
  );
};

export default Navbar;
