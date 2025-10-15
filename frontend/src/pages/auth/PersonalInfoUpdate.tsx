import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import DocumentUpload from "@/components/DocumentUpload";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import {
  User,
  FileText,
  MapPin,
  ArrowRight,
  CheckCircle,
  Upload,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
}

interface PersonalInfoUpdateProps {
  user: User | null;
}

const PersonalInfoUpdate = ({ user }: PersonalInfoUpdateProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from registration
  const isFromRegistration = location.state?.fromRegistration || false;

  const [personalData, setPersonalData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "0399106850", // Use correct phone from database
    address: "",
    cccd: "",
    licenseNumber: "",
    gender: "",
    dateOfBirth: "",
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, File>
  >({});

  const [step, setStep] = useState(1); // 1: Personal Info, 2: Documents, 3: Review
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    phone: "",
    address: "",
    cccd: "",
    licenseNumber: "",
    gender: "",
    dateOfBirth: "",
  });

  const requiredDocuments = ["nationalId", "driverLicense"];

  const handleInputChange = (
    field: keyof typeof personalData,
    value: string
  ) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDocumentUpload = (documentType: string, file: File) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [documentType]: file,
    }));

    toast({
      title: "Document Uploaded",
      description: `${documentType} has been successfully uploaded.`,
    });
  };

  const handleDocumentRemove = (documentType: string) => {
    setUploadedDocuments((prev) => {
      const newDocs = { ...prev };
      delete newDocs[documentType];
      return newDocs;
    });

    toast({
      title: "Document Removed",
      description: `${documentType} has been removed.`,
    });
  };

  const validatePersonalInfo = () => {
    const newErrors = {
      phone: "",
      address: "",
      cccd: "",
      licenseNumber: "",
      gender: "",
      dateOfBirth: "",
    };

    const phoneRegex = /^(?:0|\+84|84)[1-9]\d{8}$/;
    const cccdRegex = /^\d{12}$/;

    if (!personalData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(personalData.phone.replace(/[\s\-.()]/g, ""))) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!personalData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!personalData.cccd.trim()) {
      newErrors.cccd = "CCCD is required";
    } else if (!cccdRegex.test(personalData.cccd)) {
      newErrors.cccd = "CCCD must be 12 digits";
    }

    if (!personalData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    }

    if (!personalData.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    if (!personalData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validatePersonalInfo()) {
        setStep(2);
      }
    } else if (step === 2) {
      // Check if all required documents are uploaded
      const missingDocs = requiredDocuments.filter((doc) => {
        if (doc === "nationalId") {
          return (
            !uploadedDocuments["nationalId_front"] ||
            !uploadedDocuments["nationalId_back"]
          );
        }
        return !uploadedDocuments[doc];
      });

      if (missingDocs.length > 0) {
        toast({
          title: "Missing Documents",
          description: "Please upload all required documents to continue.",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Prepare data for API call
      const updateData = {
        email: personalData.email,
        cccd: personalData.cccd,
        LicenseNumber: personalData.licenseNumber,
        address: personalData.address,
        gender: personalData.gender,
        dateOfBirth: personalData.dateOfBirth,
        phone: personalData.phone,
      };

      // Debug logging
      console.log("Sending data to API:", updateData);
      console.log("Data types:", {
        email: typeof updateData.email,
        cccd: typeof updateData.cccd,
        LicenseNumber: typeof updateData.LicenseNumber,
        address: typeof updateData.address,
        gender: typeof updateData.gender,
        dateOfBirth: typeof updateData.dateOfBirth,
        phone: typeof updateData.phone
      });

      // Call API to update personal information
      const response = await fetch("http://localhost:5000/auth/update-personal-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        console.error("Response Status:", response.status);
        console.error("Response Headers:", Object.fromEntries(response.headers.entries()));
        throw new Error(`Failed to update personal information: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Upload documents if any
        const documentEntries = Object.entries(uploadedDocuments);
        if (documentEntries.length > 0) {
          console.log("Documents to upload:", documentEntries);
          
          // Upload each document
          for (const [documentType, file] of documentEntries) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('email', personalData.email);
              formData.append('documentType', documentType);

              const uploadResponse = await fetch("http://localhost:5000/api/documents/upload-document", {
                method: "POST",
                body: formData,
              });

              if (!uploadResponse.ok) {
                throw new Error(`Failed to upload ${documentType}`);
              }

              const uploadResult = await uploadResponse.json();
              console.log(`Uploaded ${documentType}:`, uploadResult);
            } catch (error) {
              console.error(`Error uploading ${documentType}:`, error);
              toast({
                title: "Upload Error",
                description: `Failed to upload ${documentType}. Please try again.`,
                variant: "destructive",
              });
            }
          }
          
          toast({
            title: "Documents Uploaded",
            description: "Your documents have been uploaded successfully.",
          });
        }

        // Update localStorage with new data
        const updatedUser = {
          ...user,
          personalInfo: personalData,
          documentsVerified: true,
          documents: Object.keys(uploadedDocuments),
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast({
          title: "Profile Updated Successfully!",
          description: result.message || "Your personal information has been saved.",
        });

        // Navigate to stations page
        navigate("/stations", {
          state: {
            fromPersonalInfo: true,
            message:
              "Great! Now you can browse available vehicles at our stations.",
          },
        });
      } else {
        throw new Error(result.message || "Failed to update personal information");
      }
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressValue = () => {
    switch (step) {
      case 1:
        return 33;
      case 2:
        return 66;
      case 3:
        return 100;
      default:
        return 0;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <FadeIn>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <SlideIn direction="top" delay={100}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {isFromRegistration
                    ? "Complete Your Profile"
                    : "Update Personal Information"}
                </h1>
              </SlideIn>
              <SlideIn direction="top" delay={200}>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {isFromRegistration
                    ? "Please provide your personal details and upload required documents to start renting vehicles."
                    : "Update your personal information and manage your documents."}
                </p>
              </SlideIn>
              <SlideIn direction="top" delay={300}>
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-white/80 text-sm mb-2">
                    <span>Step {step} of 3</span>
                    <span>{getProgressValue()}%</span>
                  </div>
                  <Progress
                    value={getProgressValue()}
                    className="bg-white/20"
                  />
                </div>
              </SlideIn>
            </div>
          </div>
        </FadeIn>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SlideIn direction="bottom" delay={400}>
            {step === 1 && (
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Please provide your personal details for account
                    verification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={personalData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="text-black"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        value={personalData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="text-black"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={personalData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="text-black"
                        placeholder="0912345678"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={personalData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="text-black"
                        placeholder="Your full address"
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cccd">
                        CCCD *
                      </Label>
                      <Input
                        id="cccd"
                        value={personalData.cccd}
                        onChange={(e) =>
                          handleInputChange("cccd", e.target.value)
                        }
                        className="text-black"
                        placeholder="123456789012"
                        maxLength={12}
                      />
                      {errors.cccd && (
                        <p className="text-sm text-destructive">
                          {errors.cccd}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">
                        License Number *
                      </Label>
                      <Input
                        id="licenseNumber"
                        value={personalData.licenseNumber}
                        onChange={(e) =>
                          handleInputChange("licenseNumber", e.target.value)
                        }
                        className="text-black"
                        placeholder="A123456789"
                      />
                      {errors.licenseNumber && (
                        <p className="text-sm text-destructive">
                          {errors.licenseNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        Gender *
                      </Label>
                      <select
                        id="gender"
                        value={personalData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-sm text-destructive">
                          {errors.gender}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        Date of Birth *
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={personalData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        className="text-black"
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-destructive">
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button onClick={handleNextStep} className="btn-hero">
                      Next: Upload Documents
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>
                    Please upload the required documents for identity
                    verification.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload
                    onDocumentUpload={handleDocumentUpload}
                    onDocumentRemove={handleDocumentRemove}
                    uploadedDocuments={uploadedDocuments}
                    requiredDocuments={requiredDocuments}
                  />

                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleNextStep} className="btn-hero">
                      Next: Review & Submit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>
                    Please review your information before submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Full Name
                        </p>
                        <p className="font-medium">{personalData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{personalData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{personalData.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{personalData.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          CCCD
                        </p>
                        <p className="font-medium">
                          {personalData.cccd}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          License Number
                        </p>
                        <p className="font-medium">
                          {personalData.licenseNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Gender
                        </p>
                        <p className="font-medium capitalize">
                          {personalData.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date of Birth
                        </p>
                        <p className="font-medium">
                          {personalData.dateOfBirth}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4">Uploaded Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(uploadedDocuments).map(([type, file]) => (
                        <div
                          key={type}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium capitalize">
                              {type
                                .replace(/([A-Z])/g, " $1")
                                .replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {file.name}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="btn-hero"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Complete Profile"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </SlideIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default PersonalInfoUpdate;
