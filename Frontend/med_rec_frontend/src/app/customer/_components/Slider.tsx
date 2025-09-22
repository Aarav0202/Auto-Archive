"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { useAuth } from "@/app/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {HoverCard,HoverCardContent,HoverCardTrigger,} from "@/components/ui/hover-card"
import {Sheet,SheetContent,SheetDescription,SheetHeader,SheetTitle,SheetTrigger,} from "@/components/ui/sheet"

import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger,} from "@/components/ui/dialog"

const Slider = () => {
    const { user } = useAuth();
  return (
    <>
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
                            <Button>Logout</Button>
                          </div>
                        </div>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
    </>
  )
}

export default Slider


