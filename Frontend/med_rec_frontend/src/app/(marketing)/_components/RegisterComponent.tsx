"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export function RegisterComponent() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"customer" | "carDealership">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the register function from AuthContext
      await register({ name, email, password, role });
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("customer");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 cursor-pointer">
          Register
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/80 backdrop-blur-sm border border-gray-200/50">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Sign up for a new account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div className="grid gap-2">
            <Label>Register as</Label>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as "customer" | "carDealership")}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem id="role-customer" value="customer" />
                <Label htmlFor="role-customer" className="cursor-pointer">
                  Customer
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem id="role-dealer" value="carDealership" />
                <Label htmlFor="role-dealer" className="cursor-pointer">
                  Car Dealership
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button 
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white cursor-pointer"
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}