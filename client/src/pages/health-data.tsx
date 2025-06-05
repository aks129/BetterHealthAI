import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type HealthDocument } from "@shared/schema";
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  FolderOpen,
  Calendar,
  FileCheck,
  Activity
} from "lucide-react";

export default function HealthData() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>("other");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/health-documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/health-documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-documents"] });
      setUploadFile(null);
      setUploadDescription("");
      setUploadCategory("other");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/health-documents/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-documents"] });
      toast({
        title: "Success", 
        description: "Document deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only PDF, JPEG, and PNG files are allowed",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be under 10MB",
          variant: "destructive",
        });
        return;
      }

      setUploadFile(file);
    }
  };

  const handleUpload = () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("category", uploadCategory);
    formData.append("description", uploadDescription);

    uploadMutation.mutate(formData);
  };

  const handleDownload = (document: HealthDocument) => {
    window.open(`/api/health-documents/${document.id}/download`, "_blank");
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.startsWith("image/")) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "lab-results":
        return <Activity className="h-4 w-4" />;
      case "imaging":
        return <Eye className="h-4 w-4" />;
      case "records":
        return <FileCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const groupedDocuments = documents.reduce((acc: Record<string, HealthDocument[]>, doc) => {
    const category = doc.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    "lab-results": "Lab Results",
    "imaging": "Imaging Reports", 
    "records": "Medical Records",
    "other": "Other Documents"
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Health Data Management</h1>
          <p className="text-lg text-muted-foreground">
            Organize your medical records, understand test results, and prepare effectively for healthcare appointments with secure data management tools.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium text-foreground mb-2">
                    {uploadFile ? uploadFile.name : "Upload Medical Documents"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {uploadFile 
                      ? `${formatFileSize(uploadFile.size)} - ${uploadFile.type}`
                      : "Drag and drop files or click to browse"
                    }
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    Choose Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PDF, JPEG, PNG files up to 10MB
                  </p>
                </div>

                {uploadFile && (
                  <>
                    {/* Category Selection */}
                    <div>
                      <Label htmlFor="category">Document Category</Label>
                      <Select value={uploadCategory} onValueChange={setUploadCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lab-results">Lab Results</SelectItem>
                          <SelectItem value="imaging">Imaging Reports</SelectItem>
                          <SelectItem value="records">Medical Records</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Brief description of the document"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                      />
                    </div>

                    {/* Upload Button */}
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="w-full btn-primary"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Generate Health Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Prepare for Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2 text-primary" />
                  Your Health Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No documents yet</h3>
                    <p className="text-muted-foreground">
                      Upload your first medical document to get started with organizing your health data.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedDocuments).map(([category, docs]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center">
                          {getCategoryIcon(category)}
                          <span className="ml-2">{categoryLabels[category]} ({docs.length})</span>
                        </h3>
                        <div className="space-y-3">
                          {docs.map((document) => (
                            <div
                              key={document.id}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {getFileIcon(document.fileType)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {document.fileName}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                    <span>{formatFileSize(document.fileSize)}</span>
                                    <span>
                                      {new Date(document.uploadDate).toLocaleDateString()}
                                    </span>
                                    {document.description && (
                                      <span className="truncate max-w-32">
                                        {document.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(document)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(document)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate(document.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Health Data Management Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Medical Records Organization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Securely upload, categorize, and organize your medical documents, test results, and imaging reports in one central location.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Secure file upload and storage</li>
                <li>• Smart categorization by document type</li>
                <li>• Timeline view of your health history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Test Results Interpretation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get help understanding your lab results, imaging reports, and other medical tests with clear explanations and context.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Plain language explanations</li>
                <li>• Normal range comparisons</li>
                <li>• Trend analysis over time</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Appointment Preparation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create customized health summaries and preparation guides for your medical appointments to maximize your time with providers.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Personalized health summary generation</li>
                <li>• Question suggestions for your visit</li>
                <li>• Medication and allergy tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
