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
import { Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface DeleteAccountDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  isOpen,
  onOpenChange,
  triggerButton
}) => {
  const { logout } = useAuth();

    const handleDeleteAccount = async () => {
    try {
      console.log("Attempting to delete customer account...");
      
      // API call to delete account endpoint
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
        console.log("Account deleted successfully:", data.message);
        // Show success message
        alert("Account deleted successfully! You will be logged out now.");
        // Logout the user after successful deletion
        logout();
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

  const defaultTrigger = (
    <Button 
      variant="outline" 
      className="w-full flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200"
    >
      <Trash2 className="h-4 w-4" />
      Delete Account
    </Button>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white/80 backdrop-blur-sm border border-red-200/50 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-800 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  This action cannot be undone!
                </p>
              </div>
              
              <p className="text-sm">
                Deleting your account will permanently remove all of your data including:
              </p>
              
              <ul className="list-disc list-inside text-sm space-y-1 ml-2 text-gray-700">
                <li>Your profile information and preferences</li>
                <li>All vehicle records and service history</li>
                <li>Appointment history and notifications</li>
                <li>Account settings and preferences</li>
              </ul>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  💡 Alternative: You can logout and contact support if you need help with your account.
                </p>
              </div>
              
              <p className="text-sm font-semibold text-gray-900 mt-4">
                Type "DELETE" to confirm you want to permanently delete your account:
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
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
  );
};

export default DeleteAccountDialog;