"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Resource } from "@/lib/hooks/use-resources";
import {
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  Tag,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface ResourceDialogProps {
  resource: Resource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<Resource>) => void;
  onDelete: (id: string) => void;
}

export function ResourceDialog({
  resource,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: ResourceDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(resource.notes || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveNotes = () => {
    onUpdate({ notes });
    setIsEditing(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-xl font-semibold">
                  {resource.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Added {format(new Date(resource.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => window.open(resource.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Progress</div>
                  <div className="text-sm text-muted-foreground">
                    Track your learning progress
                  </div>
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {resource.progress}%
                </div>
              </div>
              <Progress value={resource.progress} className="h-2" />
              <input
                type="range"
                value={resource.progress}
                onChange={(e) =>
                  onUpdate({ progress: parseInt(e.target.value) })
                }
                min="0"
                max="100"
                className="w-full accent-primary"
              />
            </div>

            {/* Status Section */}
            <div className="flex items-center gap-4">
              <Button
                variant={resource.is_completed ? "default" : "outline"}
                onClick={() =>
                  onUpdate({ is_completed: !resource.is_completed })
                }
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {resource.is_completed ? "Completed" : "Mark as Complete"}
              </Button>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {resource.is_completed ? "Completed" : "In Progress"}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Notes</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    className="min-h-[100px]"
                  />
                  <Button size="sm" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {resource.notes || "No notes added yet."}
                </p>
              )}
            </div>

            {/* Categories Section */}
            {resource.categories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Categories
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resource.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add delete button */}
            <div className="flex justify-end mt-6 pt-6 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => {
          onDelete(resource.id);
          onOpenChange(false);
        }}
        title="Delete Resource"
        description={`Are you sure you want to delete "${resource.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
