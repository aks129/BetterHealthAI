import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Eye, Download, Trash2 } from "lucide-react";
import { formatDate, formatFileSize, getFileIcon, getFileIconColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { HealthDocument } from "@shared/schema";

interface DocumentListProps {
  documents: HealthDocument[];
  onDelete: (id: number) => Promise<void>;
  onDownload: (id: number) => void;
  isLoading?: boolean;
}

export default function DocumentList({ 
  documents, 
  onDelete, 
  onDownload, 
  isLoading 
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'lab results':
        return 'bg-blue-100 text-blue-800';
      case 'imaging':
        return 'bg-purple-100 text-purple-800';
      case 'prescription':
        return 'bg-green-100 text-green-800';
      case 'insurance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-folder-open text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600">Upload your first medical document to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((document) => (
            <div 
              key={document.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <i className={`${getFileIcon(document.fileType)} ${getFileIconColor(document.fileType)} text-lg`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {document.fileName}
                    </p>
                    {document.category && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(document.category)}`}
                      >
                        {document.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span>
                      {document.uploadDate ? formatDate(document.uploadDate) : 'Unknown date'}
                    </span>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                  {document.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {document.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {/* View functionality */}}
                  className="h-8 w-8 text-gray-500 hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownload(document.id)}
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      disabled={deletingId === document.id}
                    >
                      {deletingId === document.id ? (
                        <i className="fas fa-spinner fa-spin text-xs" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{document.fileName}"? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(document.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
