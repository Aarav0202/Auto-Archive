'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Photo {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

interface UploadIssuePhotosDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  onPhotosUploaded?: () => void;
}

export function UploadIssuePhotosDialog({
  isOpen,
  onOpenChange,
  requestId,
  onPhotosUploaded,
}: UploadIssuePhotosDialogProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newPhotos: Photo[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        newPhotos.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          caption: '',
        });

        if (newPhotos.length === Array.from(files).filter((f) => f.type.startsWith('image/')).length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
          toast.success(`${newPhotos.length} photo(s) added`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, caption } : photo
      )
    );
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    toast.success('Photo removed');
  };

  const handleUpload = async () => {
    if (photos.length === 0) {
      toast.error('Please add at least one photo');
      return;
    }

    setIsLoading(true);
    try {
      // Convert files to base64 for transmission
      const photosData = await Promise.all(
        photos.map(
          (photo) =>
            new Promise<{
              filename: string;
              url: string;
              caption: string;
            }>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  filename: photo.file.name,
                  url: e.target?.result as string,
                  caption: photo.caption,
                });
              };
              reader.readAsDataURL(photo.file);
            })
        )
      );

      const response = await fetch(
        `http://localhost:8080/api/service-requests/customer/upload-photos/${requestId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photos: photosData }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to upload photos');
        return;
      }

      toast.success(`${photos.length} photo(s) uploaded successfully!`);
      setPhotos([]);
      setShowConfirmation(false);
      onOpenChange(false);

      if (onPhotosUploaded) {
        onPhotosUploaded();
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('An error occurred while uploading photos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && photos.length > 0) {
      setShowConfirmation(true);
    } else {
      setPhotos([]);
      onOpenChange(open);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Upload Issue Photos
            </DialogTitle>
            <DialogDescription>
              Upload photos of your vehicle issues to help our technicians better understand the problem
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium mb-1">
                Drag and drop your photos here
              </p>
              <p className="text-gray-500 text-sm mb-4">
                or click the button below to select files
              </p>
              <label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                >
                  Select Photos
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: JPG, PNG, WebP (Max 5MB per file)
              </p>
            </div>

            {/* Photos Grid */}
            {photos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">
                    Photos ({photos.length})
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPhotos([])}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Photo Preview */}
                      <div className="relative w-full h-40 bg-gray-100">
                        <img
                          src={photo.preview}
                          alt={`Issue photo ${photo.id}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Caption Input */}
                      <div className="p-3 bg-white">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Caption (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Brake issue, Engine knock sound"
                          value={photo.caption}
                          onChange={(e) =>
                            updateCaption(photo.id, e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {photo.caption.length}/100
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          File: {photo.file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Tips for better photos:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Take photos in good lighting</li>
                  <li>Show the issue clearly from multiple angles</li>
                  <li>Add captions to explain what's shown</li>
                  <li>Close-up shots are helpful</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={photos.length === 0 || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Uploading...' : `Upload ${photos.length} Photo(s)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Confirm Photo Upload
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              You are about to upload {photos.length} photo{photos.length !== 1 ? 's' : ''} to
              your service request. This will help our technicians better understand the issue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 max-h-40 overflow-y-auto">
            <ul className="space-y-2">
              {photos.map((photo) => (
                <li key={photo.id} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {photo.caption || photo.file.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpload}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Uploading...' : 'Upload Photos'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
