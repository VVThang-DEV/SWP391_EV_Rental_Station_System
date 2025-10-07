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
    phone: "",
    address: "",
<<<<<<< HEAD
    cccd: "",
    licenseNumber: "",
    gender: "",
    dateOfBirth: "",
    avatarUrl: "",
=======
    emergencyContact: "",
    emergencyPhone: "",
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, File>
  >({});

  const [step, setStep] = useState(1); // 1: Personal Info, 2: Documents, 3: Review
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    phone: "",
    address: "",
<<<<<<< HEAD
    cccd: "",
    licenseNumber: "",
    gender: "",
    dateOfBirth: "",
=======
    emergencyContact: "",
    emergencyPhone: "",
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26
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
<<<<<<< HEAD
      cccd: "",
      licenseNumber: "",
      gender: "",
      dateOfBirth: "",
=======
      emergencyContact: "",
      emergencyPhone: "",
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26
    };

    const phoneRegex = /^(?:0|\+84|84)[1-9]\d{8}$/;

    if (!personalData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(personalData.phone.replace(/[\s\-.()]/g, ""))) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!personalData.address.trim()) {
      newErrors.address = "Address is required";
    }

<<<<<<< HEAD
    if (!personalData.cccd.trim()) {
      newErrors.cccd = "CCCD is required";
    } else if (!/^\d{12}$/.test(personalData.cccd)) {
      newErrors.cccd = "CCCD must be 12 digits";
    }

    if (!personalData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    } else if (personalData.licenseNumber.length < 8 || personalData.licenseNumber.length > 15) {
      newErrors.licenseNumber = "License number must be 8-15 characters";
    }

    if (!personalData.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    if (!personalData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(personalData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      }
    }

    // emergency contact/phone removed by request
=======
    if (!personalData.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact name is required";
    }

    if (!personalData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = "Emergency contact phone is required";
    } else if (
      !phoneRegex.test(personalData.emergencyPhone.replace(/[\s\-.()]/g, ""))
    ) {
      newErrors.emergencyPhone = "Invalid emergency phone number format";
    }
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26

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
<<<<<<< HEAD
      // Basic pre-submit checks to avoid known server-side validation errors
      if (!personalData.email || !personalData.email.trim()) {
        toast({
          title: "Missing email",
          description: "Email is required to update personal information.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const payload = {
        email: personalData.email,
        cccd: personalData.cccd,
        licenseNumber: personalData.licenseNumber,
        address: personalData.address,
        gender: personalData.gender,
        dateOfBirth: personalData.dateOfBirth,
        avatarUrl: personalData.avatarUrl,
      };

      console.debug("Submitting personal info ->", payload);
      // Call backend API to update personal information
      const response = await fetch('http://localhost:5000/auth/update-personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (e) {
        // If response isn't JSON, read text for debugging
        const text = await response.text();
        console.warn("Non-JSON response from update-personal-info:", text);
      }

      if (!response.ok) {
        console.error("Update personal info failed. status:", response.status, "body:", result);
        const serverMessage = result?.message || `Server returned status ${response.status}`;
        throw new Error(serverMessage);
      }

      if (result && result.success === false) {
        throw new Error(result.message || 'Failed to update personal information');
      }

      // Save to localStorage for frontend state
=======
      // Simulate API call to save personal information and documents
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save to localStorage or send to backend
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26
      const updatedUser = {
        ...user,
        personalInfo: personalData,
        documentsVerified: true,
        documents: Object.keys(uploadedDocuments),
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast({
        title: "Profile Updated Successfully!",
        description: "Your personal information and documents have been saved.",
      });

      // Navigate to stations page
      navigate("/stations", {
        state: {
          fromPersonalInfo: true,
          message:
            "Great! Now you can browse available vehicles at our stations.",
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your information. Please try again.",
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
<<<<<<< HEAD
                      <Label htmlFor="cccd">CCCD Number *</Label>
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
=======
                      <Label htmlFor="emergencyContact">
                        Emergency Contact Name *
                      </Label>
                      <Input
                        id="emergencyContact"
                        value={personalData.emergencyContact}
                        onChange={(e) =>
                          handleInputChange("emergencyContact", e.target.value)
                        }
                        className="text-black"
                        placeholder="Contact person name"
                      />
                      {errors.emergencyContact && (
                        <p className="text-sm text-destructive">
                          {errors.emergencyContact}
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
<<<<<<< HEAD
                      <Label htmlFor="licenseNumber">Driver License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={personalData.licenseNumber}
                        onChange={(e) =>
                          handleInputChange("licenseNumber", e.target.value)
                        }
                        className="text-black"
                        placeholder="License number"
                      />
                      {errors.licenseNumber && (
                        <p className="text-sm text-destructive">
                          {errors.licenseNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
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
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
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

                    {/* Emergency contact fields removed */}
=======
                      <Label htmlFor="emergencyPhone">
                        Emergency Contact Phone *
                      </Label>
                      <Input
                        id="emergencyPhone"
                        value={personalData.emergencyPhone}
                        onChange={(e) =>
                          handleInputChange("emergencyPhone", e.target.value)
                        }
                        className="text-black"
                        placeholder="0912345678"
                      />
                      {errors.emergencyPhone && (
                        <p className="text-sm text-destructive">
                          {errors.emergencyPhone}
                        </p>
                      )}
                    </div>
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26
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
<<<<<<< HEAD
                        <p className="text-sm text-muted-foreground">CCCD</p>
                        <p className="font-medium">{personalData.cccd}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">License Number</p>
                        <p className="font-medium">{personalData.licenseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium">{personalData.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{personalData.dateOfBirth}</p>
                      </div>
                      {/* Emergency contact info removed */}
=======
                        <p className="text-sm text-muted-foreground">
                          Emergency Contact
                        </p>
                        <p className="font-medium">
                          {personalData.emergencyContact}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Emergency Phone
                        </p>
                        <p className="font-medium">
                          {personalData.emergencyPhone}
                        </p>
                      </div>
>>>>>>> 28f63344742cb11a83fd059956a972d8be961d26
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
