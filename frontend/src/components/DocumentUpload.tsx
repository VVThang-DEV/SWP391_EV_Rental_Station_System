import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import './DocumentUpload.css';

interface DocumentUploadProps {
  onDocumentUpload: (documentType: string, file: File) => void;
  requiredDocuments?: string[];
  uploadedDocuments?: Record<string, File>;
  onDocumentRemove?: (documentType: string) => void;
}

const DocumentUpload = ({
  onDocumentUpload,
  requiredDocuments = ["driverLicense", "nationalId", "collateral"],
  uploadedDocuments = {},
  onDocumentRemove,
}: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const documentTypes = {
    driverLicense: {
      title: "Driver's License - Front",
      description: "Upload front side of your valid driver's license",
      accept: "image/*,.pdf",
      maxSize: 5 * 1024 * 1024, // 5MB
      icon: FileText,
    },
     driverLicenseBack: {
      title: "Driver's License - Back",
      description: "Upload back side of your valid driver's license",
      accept: "image/*,application/pdf",
      maxSize: 5 * 1024 * 1024,
      icon: FileText,
    },
    // split into front/back sides
    nationalId_front: {
      title: "National ID - Front",
      description:
        "Upload front side of your national identification card (photo and ID number)",
      accept: "image/*,.pdf",
      maxSize: 5 * 1024 * 1024, // 5MB
      icon: FileText,
    },
    nationalId_back: {
      title: "National ID - Back",
      description:
        "Upload back side of your national identification card (address / other info)",
      accept: "image/*,.pdf",
      maxSize: 5 * 1024 * 1024, // 5MB
      icon: FileText,
    },
    passport: {
      title: "Passport",
      description: "Upload your passport (alternative to National ID)",
      accept: "image/*,.pdf",
      maxSize: 5 * 1024 * 1024, // 5MB
      icon: FileText,
    },
    collateral: {
      title: "Collateral Asset Documentation",
      description: "Upload documents for security deposit alternative",
      accept: "image/*,.pdf",
      maxSize: 10 * 1024 * 1024, // 10MB
      icon: FileText,
    },
  };

  // Normalize required documents: expand `nationalId` into front/back if present
  const normalizeRequired = (reqs: string[]) => {
    const out: string[] = [];
    reqs.forEach((d) => {
      if (d === "nationalId") {
        out.push("nationalId_front", "nationalId_back");
      } else {
        out.push(d);
      }
    });
    return out;
  };

  const normalizedRequired = normalizeRequired(requiredDocuments);

  const handleDrag = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(documentType);
    } else if (e.type === "dragleave") {
      setDragActive("");
    }
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive("");

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0], documentType);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0], documentType);
    }
  };

  const handleFileUpload = (file: File, documentType: string) => {
    const docType = documentTypes[documentType as keyof typeof documentTypes];

    // Validate file size
    if (file.size > docType.maxSize) {
      toast({
        title: "File too large",
        description: `File size should be less than ${docType.maxSize / (1024 * 1024)
          }MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const acceptedTypes = docType.accept.split(",").map((type) => type.trim());
    const isValidType = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type);
      } else if (type.includes("*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(baseType);
      } else {
        return file.type === type;
      }
    });

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please upload a ${docType.accept} file`,
        variant: "destructive",
      });
      return;
    }

    // Simulate upload progress
    setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }));

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[documentType] || 0;
        const nextProgress = Math.min(currentProgress + 10, 100);

        // Build the new state to return
        const newState = { ...prev, [documentType]: nextProgress };

        if (nextProgress >= 100) {
          // clear the interval here
          clearInterval(progressInterval);

          // Defer calling parent handlers/toasts to next tick so we don't trigger
          // a parent state update while React is rendering/updating this component.
          // Calling parent setState inside a state updater can cause the
          // "Cannot update a component while rendering a different component"
          // warning. Using setTimeout(..., 0) defers the call outside the
          // render/update phase.
          setTimeout(() => {
            try {
              onDocumentUpload(documentType, file);
            } catch (err) {
              // swallow to avoid uncaught exceptions from user-provided handler
              // and still show a toast for visibility.
              console.error("onDocumentUpload handler error:", err);
            }

            toast({
              title: "Document uploaded",
              description: `${docType.title} has been uploaded successfully`,
            });
          }, 0);
        }

        return newState;
      });
    }, 200);
  };

  const openCamera = (documentType: string) => {
    // In a real app, this would open camera or file picker with camera option
    const input = fileInputRefs.current[documentType];
    if (input) {
      input.setAttribute("capture", "environment");
      input.click();
    }
  };

  const handlePreview = (documentType: string) => {
    const file = uploadedDocuments[documentType];
    if (!file) {
      toast({
        title: "No file to preview",
        description: "There is no uploaded file to preview for this document.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = URL.createObjectURL(file as any);
      // open in new tab/window
      window.open(url, "_blank");
      // revoke after a short delay to allow the new tab to load
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      toast({
        title: "Preview failed",
        description: "Unable to preview the uploaded file.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = (documentType: string) => {
    if (typeof onDocumentRemove === "function") {
      onDocumentRemove(documentType);
      return;
    }

    // If parent didn't provide a remove handler, show guidance
    toast({
      title: "Remove not available",
      description:
        "Removal handler is not implemented in the parent. Provide `onDocumentRemove` prop to enable file removal.",
      variant: "destructive",
    });
  };

  const renderDocumentUploader = (documentType: string) => {
    const docType = documentTypes[documentType as keyof typeof documentTypes];
    const isUploaded = uploadedDocuments[documentType];
    const isUploading =
      uploadProgress[documentType] !== undefined &&
      uploadProgress[documentType] < 100;
    const progress = uploadProgress[documentType] || 0;
    const Icon = docType.icon;

    return (
      <Card
        key={documentType}
        className={`relative ${dragActive === documentType ? "border-primary bg-primary/5" : ""
          }`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Icon className="h-5 w-5" />
            <span>{docType.title}</span>
            {normalizedRequired.includes(documentType) && (
              <span className="text-destructive text-sm">*</span>
            )}
          </CardTitle>
          <CardDescription>{docType.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isUploaded ? (
            <div className="p-4 bg-success-light rounded-lg">
              <div className="flex items-center space-x-2 min-w-0">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="font-medium text-success truncate text-sm">
                  Document uploaded
                </span>
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(documentType)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemove(documentType)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} />
            </div>
          ) : (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive === documentType
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                onDragEnter={(e) => handleDrag(e, documentType)}
                onDragLeave={(e) => handleDrag(e, documentType)}
                onDragOver={(e) => handleDrag(e, documentType)}
                onDrop={(e) => handleDrop(e, documentType)}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Drop files here or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Max size: {docType.maxSize / (1024 * 1024)}MB
                    </p>
                  </div>

                </div>

                <input
                  ref={(el) => (fileInputRefs.current[documentType] = el)}
                  type="file"
                  accept={docType.accept}
                  onChange={(e) => handleFileSelect(e, documentType)}
                  className="hidden"
                />
              </div>
              <div className="upload-actions">
                <Button
                  className="btn"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[documentType]?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <Button
                  className="btn"
                  variant="outline"
                  size="sm"
                  onClick={() => openCamera(documentType)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const getUploadStatus = () => {
    const required = normalizedRequired.filter(
      (doc) => documentTypes[doc as keyof typeof documentTypes]
    );
    const uploaded = required.filter((doc) => uploadedDocuments[doc]);
    const uploading = required.filter(
      (doc) => uploadProgress[doc] !== undefined && uploadProgress[doc] < 100
    );

    return {
      total: required.length,
      uploaded: uploaded.length,
      uploading: uploading.length,
      completed: uploaded.length === required.length && uploading.length === 0,
    };
  };

  const status = getUploadStatus();

  return (
    <div className="space-y-6">
      {/* Upload Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Document Upload Progress</h3>
            <div className="flex items-center space-x-2">
              {status.completed ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              <span className="text-sm font-medium">
                {status.uploaded}/{status.total} documents uploaded
              </span>
            </div>
          </div>
          <Progress
            value={(status.uploaded / status.total) * 100}
            className="h-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {status.completed
              ? "All required documents have been uploaded successfully"
              : `${status.total - status.uploaded} documents remaining`}
          </p>
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {normalizedRequired.map((documentType) =>
          documentTypes[documentType as keyof typeof documentTypes]
            ? renderDocumentUploader(documentType)
            : null
        )}
      </div>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Ensure documents are clear and all text is readable</li>
            <li>• Upload high-resolution images or clear PDF files</li>
            <li>• All information should be visible and not cropped</li>
            <li>• Documents must be valid and not expired</li>
            <li>• File size should not exceed the specified limits</li>
            <li>• Supported formats: JPG, PNG, PDF</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
