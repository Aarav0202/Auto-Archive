import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Building2, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const [role, setRole] = useState<"customer" | "carDealership">("customer");
  const [error, setError] = useState<string>("");

  // No form wrapper here! Only render fields
  return (
    <>
      {/* Role selection */}
      <div className="grid gap-3 mt-4">
        <Label className="text-sm font-semibold text-gray-700">Login as</Label>
        <RadioGroup
          value={role}
          onValueChange={(v) => setRole(v as "customer" | "carDealership")}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <div className="flex items-center space-x-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
            <RadioGroupItem id="role-customer" value="customer" className="border-blue-500 text-blue-600" />
            <User className="h-4 w-4 text-blue-600" />
            <Label htmlFor="role-customer" className="cursor-pointer font-medium text-blue-800">
              Customer
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-4 hover:from-purple-100 hover:to-purple-200 transition-all duration-200">
            <RadioGroupItem id="role-dealer" value="carDealership" className="border-purple-500 text-purple-600" />
            <Building2 className="h-4 w-4 text-purple-600" />
            <Label htmlFor="role-dealer" className="cursor-pointer font-medium text-purple-800">
              Car Dealership
            </Label>
          </div>
        </RadioGroup>
        <input type="hidden" name="role" value={role} />
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
          placeholder="Enter your password"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
    </>
  );
}
