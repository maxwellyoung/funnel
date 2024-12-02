"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Plus, Upload, Loader2, Clipboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { categorizeResource } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { extractFileContent } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { type NewResource } from "@/lib/hooks/use-resources";

interface ResourceInputProps {
  onAdd: (resource: NewResource) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ResourceInput({
  onAdd,
  open,
  onOpenChange,
}: ResourceInputProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open !== "undefined";
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = useCallback(
    (value: boolean) => {
      if (isControlled) {
        onOpenChange?.(value);
      } else {
        setInternalOpen(value);
      }
    },
    [isControlled, onOpenChange]
  );
  const [isMac, setIsMac] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const categories = title || notes ? categorizeResource(title, notes) : [];
  const MAX_NOTES_LENGTH = 500;
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    if (!isValidUrl(url)) {
      setUrlError("Please enter a valid URL");
      return;
    }

    onAdd({
      title,
      url,
      notes,
      categories,
      is_completed: false,
      progress: 0,
    });

    setTitle("");
    setUrl("");
    setNotes("");
    setIsOpen(false);
  };

  const fetchUrlMetadata = async (url: string) => {
    setIsLoading(true);
    setMetadataError(null);
    try {
      const response = await axios.get(
        `/api/metadata?url=${encodeURIComponent(url)}`
      );
      const { title: fetchedTitle, description } = response.data;
      if (fetchedTitle && fetchedTitle !== url) {
        setTitle(fetchedTitle);
      }
      if (description) {
        setNotes(description);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setMetadataError("Failed to fetch URL metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setUrlError(null);

    if (newUrl && isValidUrl(newUrl)) {
      fetchUrlMetadata(newUrl);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          setError("File size exceeds 10MB limit");
          return;
        }
        try {
          setUploadProgress(0);
          setIsLoading(true);

          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90));
          }, 200);

          const content = await extractFileContent(file);
          setPreview(content.slice(0, 200) + "...");

          const fileTitle = file.name.replace(/\.[^/.]+$/, "");

          clearInterval(progressInterval);
          setUploadProgress(100);

          setTitle(fileTitle);
          setNotes(content.slice(0, MAX_NOTES_LENGTH));

          const fileUrl = URL.createObjectURL(file);
          setUrl(fileUrl);

          setIsOpen(true);
        } catch (error) {
          console.error("Error processing file:", error);
          setError("Failed to process file. Please try again.");
        } finally {
          setIsLoading(false);
          setUploadProgress(0);
        }
      }
    },
    [setIsOpen]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
    multiple: false,
  });

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (isValidUrl(text)) {
        setUrl(text);
        fetchUrlMetadata(text);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
      }

      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full group relative overflow-hidden hover-lift transition-all",
              isDragActive && "border-primary border-2 bg-primary/5"
            )}
            aria-label="Add new resource"
          >
            <motion.div
              initial={false}
              animate={{
                rotate: isOpen ? 45 : 0,
                scale: isDragActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {isDragActive ? (
                <Upload className="mr-2 h-4 w-4 text-primary" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
            </motion.div>
            {isDragActive ? (
              <span className="text-primary font-medium">Drop files here</span>
            ) : (
              "Add Resource"
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 ml-auto text-xs text-muted-foreground">
              <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>
              <span>K</span>
            </kbd>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          onEscapeKeyDown={() => setIsOpen(false)}
          onInteractOutside={() => setIsOpen(false)}
        >
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Add Resource
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Add a new learning resource to your collection
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <AnimatePresence>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleSubmit}
              className="space-y-6 pt-4"
            >
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 transition-colors text-center",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload
                  className={cn(
                    "h-8 w-8 mx-auto mb-2",
                    isDragActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Drop files here"
                    : "Drag and drop files here, or click to select"}
                </p>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="URL"
                    type="url"
                    value={url}
                    onChange={handleUrlChange}
                    disabled={isLoading}
                    className={cn(
                      "pr-10 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isLoading && "opacity-50"
                    )}
                  />
                  {urlError && (
                    <p className="text-sm text-red-500 mt-1">{urlError}</p>
                  )}
                  {metadataError && (
                    <p className="text-sm text-amber-500 mt-1">
                      {metadataError}
                    </p>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted/50"
                          onClick={handlePaste}
                          disabled={isLoading}
                        >
                          <Clipboard
                            className={cn(
                              "h-4 w-4 text-muted-foreground",
                              isLoading && "opacity-50"
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Paste from clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    "text-lg font-medium focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    isLoading && "opacity-50"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))
                  }
                  disabled={isLoading}
                  className={cn(
                    "min-h-[100px] focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    isLoading && "opacity-50"
                  )}
                />
                <div className="flex justify-end">
                  <p
                    className={cn(
                      "text-xs text-muted-foreground",
                      notes.length >= MAX_NOTES_LENGTH && "text-red-500"
                    )}
                  >
                    {notes.length}/{MAX_NOTES_LENGTH}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Filter categories..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((category) =>
                      category
                        .toLowerCase()
                        .includes(categoryFilter.toLowerCase())
                    )
                    .map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Categories will be automatically generated from the title and
                  notes
                </p>
              </div>
              {preview && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview:</p>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {preview}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading
                    </>
                  ) : (
                    "Add Resource"
                  )}
                </Button>
              </div>
            </motion.form>
          </AnimatePresence>
          {isLoading && uploadProgress > 0 && (
            <div className="absolute inset-x-0 top-0">
              <Progress value={uploadProgress} className="h-1 rounded-none" />
            </div>
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
