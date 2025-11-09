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

export function LoginComponent() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"customer" | "carDealership">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the login function from AuthContext
      await login({ email, password, role });
      setOpen(false);
      // Reset form
      setEmail("");
      setPassword("");
      setRole("customer");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg transition-all duration-200">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/80 backdrop-blur-sm border border-gray-200/50">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Login
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Sign in to your account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div className="grid gap-2">
            <Label>Login as</Label>
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
              placeholder="Enter your password"
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button 
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}