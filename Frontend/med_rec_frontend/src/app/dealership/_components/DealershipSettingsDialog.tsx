'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogOut, Trash2, Mail, Lock, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';

interface DealershipSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealershipSettingsDialog({ isOpen, onOpenChange }: DealershipSettingsDialogProps) {
  const { user, logout } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account deleted successfully. You will now be logged out.');
        logout();
        setDeleteDialogOpen(false);
        onOpenChange(false);
      } else {
        toast.error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('An error occurred while deleting account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dealership Settings
            </DialogTitle>
            <DialogDescription>
              Manage your dealership account settings and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            {/* Profile Info */}
            <div className="flex w-full justify-center mb-6">
              <Avatar className="h-20 w-20 ring-4 ring-blue-500/30">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg">
                  {user?.name?.charAt(0) || "D"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg mb-6">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Building className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-gray-500">Dealership:</span>
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

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Change Password Button */}
              <Button
                onClick={() => setChangePasswordDialogOpen(true)}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>

              {/* Logout Button */}
              <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200 cursor-pointer"
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
                    <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={logout}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white cursor-pointer"
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
                    className="w-full flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/80 backdrop-blur-sm border border-red-200/50">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-900 flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-red-600" />
                      Are you sure you want to permanently delete your dealership account?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      <div className="space-y-2">
                        <p className="font-semibold text-red-700">
                          This action cannot be undone!
                        </p>
                        <p>
                          Deleting your dealership account will permanently remove:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Your dealership profile and information</li>
                          <li>All employees associated with your dealership</li>
                          <li>Customer relationships and booking history</li>
                          <li>All promotions and vehicle launch data</li>
                          <li>Account preferences and settings</li>
                        </ul>
                        <p className="text-sm font-medium text-gray-800 mt-3">
                          Are you absolutely sure you want to proceed?
                        </p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={changePasswordDialogOpen}
        onOpenChange={setChangePasswordDialogOpen}
      />
    </>
  );
}
