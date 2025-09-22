"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Building2, Mail, Lock, UserPlus } from "lucide-react";

export function RegisterForm() {
  const [role, setRole] = useState<"customer" | "carDealership">("customer");

  // No form wrapper here! Only render fields
  return (
    <>
      {/* Role selection */}
      <div className="grid gap-3 mt-4">
        <Label className="text-sm font-semibold text-gray-700">Register as</Label>
        <RadioGroup
          value={role}
          onValueChange={(v) => setRole(v as "customer" | "carDealership")}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <div className="flex items-center space-x-3 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4 hover:from-green-100 hover:to-green-200 transition-all duration-200">
            <RadioGroupItem id="role-customer" value="customer" className="border-green-500 text-green-600" />
            <User className="h-4 w-4 text-green-600" />
            <Label htmlFor="role-customer" className="cursor-pointer font-medium text-green-800">
              Customer
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-4 hover:from-orange-100 hover:to-orange-200 transition-all duration-200">
            <RadioGroupItem id="role-dealer" value="carDealership" className="border-orange-500 text-orange-600" />
            <Building2 className="h-4 w-4 text-orange-600" />
            <Label htmlFor="role-dealer" className="cursor-pointer font-medium text-orange-800">
              Car Dealership
            </Label>
          </div>
        </RadioGroup>
        {/* Hidden input so FormData picks it up */}
        <input type="hidden" name="role" value={role} />
      </div>

      {/* Name */}
      <div className="grid gap-2 mt-4">
        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <UserPlus className="h-4 w-4 text-green-600" />
          Name
        </Label>
        <Input 
          id="name" 
          name="name" 
          type="text" 
          required 
          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
          placeholder="Enter your full name"
        />
      </div>

      {/* Email */}
      <div className="grid gap-2 mt-4">
        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Mail className="h-4 w-4 text-blue-600" />
          Email
        </Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter your email address"
        />
      </div>

      {/* Password */}
      <div className="grid gap-2 mt-4">
        <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Lock className="h-4 w-4 text-purple-600" />
          Password
        </Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          placeholder="Create a secure password"
        />
      </div>
    </>
  );
}
