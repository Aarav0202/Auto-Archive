"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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
import { Trash2, AlertTriangle, Building2, Users, Car } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface DeleteDealershipDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
}

const DeleteDealershipDialog: React.FC<DeleteDealershipDialogProps> = ({
  isOpen,
  onOpenChange,
  triggerButton
}) => {
  const { logout } = useAuth();

  const handleDeleteDealership = async () => {
    try {
      console.log("Attempting to delete dealership account...");
      
      // API call to delete dealership account endpoint
      const response = await fetch("http://localhost:8080/api/auth/delete-account", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status);
      
      const data = await response.json();
      console.log("Delete response data:", data);

      if (response.ok) {
        console.log("Dealership deleted successfully:", data.message);
        // Show success message
        alert("Dealership deleted successfully. All associated data has been removed.");
        // Logout the user after successful deletion
        logout();
      } else {
        console.error("Failed to delete dealership:", data.message);
        // Show error message
        alert(`Failed to delete dealership: ${data.message}`);
      }
    } catch (error) {
      console.error("Delete dealership error:", error);
      // Show network error message
      alert("Network error. Please check your connection and try again.");
    }
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      className="w-full flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200"
    >
      <Trash2 className="h-4 w-4" />
      Delete Dealership
    </Button>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white/80 backdrop-blur-sm border border-red-200/50 max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Delete Dealership Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-bold text-red-800 flex items-center gap-2 mb-2">
                  <Trash2 className="h-5 w-5" />
                  CRITICAL WARNING: This action cannot be undone!
                </p>
                <p className="text-red-700 text-sm">
                  Deleting your dealership will permanently remove ALL data and cannot be recovered.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="font-semibold text-gray-900">
                  This will permanently delete:
                </p>
                
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Dealership Information</p>
                      <p className="text-sm text-gray-600">Business profile, settings, and preferences</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">All Employee Accounts</p>
                      <p className="text-sm text-gray-600">Employee profiles and access permissions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">All Customer Records</p>
                      <p className="text-sm text-gray-600">Customer profiles and service history</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Car className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Vehicle & Sales Data</p>
                      <p className="text-sm text-gray-600">Inventory, sales records, and service history</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alternative: Export your data first or contact support for assistance
                </p>
              </div>
              
              <p className="text-sm font-bold text-gray-900 mt-4">
                Are you absolutely certain you want to permanently delete your entire dealership?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteDealership}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Dealership Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDealershipDialog;