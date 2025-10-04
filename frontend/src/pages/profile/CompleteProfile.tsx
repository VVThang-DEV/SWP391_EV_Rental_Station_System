import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentUpload from "@/components/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Info, ShieldCheck, User, Camera, MapPin } from "lucide-react";
import { documentStorage, type DocumentType } from "@/lib/utils";

const REQUIRED_DOCS: DocumentType[] = [
  "driverLicense",
  "driverLicenseBack",
  "nationalId_front",
  "nationalId_back",
];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState<Record<DocumentType, File | null>>(
    () => {
      // Initialize from localStorage
      const stored = documentStorage.getUploadedDocuments();
      return {
        driverLicense: null, // We can't restore File objects from localStorage
        driverLicenseBack: null,
        nationalId_front: null,
        nationalId_back: null,
      };
    }
  );

  // State for additional information
  const [additionalInfo, setAdditionalInfo] = useState({
    citizenId: "",
    driverLicenseNumber: "",
    currentAddress: "",
  });

  const handleDocumentUpload = (documentType: string, file: File) => {
    const key = documentType as DocumentType;
    if (REQUIRED_DOCS.includes(key)) {
      documentStorage.saveDocument(key, file);
      setUploaded((prev) => ({ ...prev, [key]: file }));
    }
  };

  const handleInfoChange = (field: keyof typeof additionalInfo, value: string) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCitizenId = (id: string) => {
    return /^\d{9}(\d{3})?$/.test(id); // 9 digits for CCCD, 12 for CMND
  };

  const validateDriverLicenseNumber = (number: string) => {
    return /^\d{12}$/.test(number); // 12 digits for Vietnamese driver license
  };

  // Check if all documents uploaded AND additional info filled
  const documentsComplete = REQUIRED_DOCS.every((k) => Boolean(uploaded[k]));
  const infoValid = validateCitizenId(additionalInfo.citizenId) && 
                   validateDriverLicenseNumber(additionalInfo.driverLicenseNumber) && 
                   additionalInfo.currentAddress.trim().length >= 10; // Minimum address length

  const allDone = documentsComplete && infoValid;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="min-h-[260px] bg-cover bg-center bg-no-repeat flex items-center"
        style={{ backgroundImage: "url(/login-bg.jpg)" }}
      >
        <div className="w-full bg-black/40">
          <div className="max-w-6xl mx-auto px-4 py-10 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-emerald-300" />
              <h1 className="text-2xl md:text-3xl font-bold">
                Customer Information
              </h1>
            </div>
            <p className="mt-2 text-white/90">
              Vui lòng tải lên CMND/CCCD và Bằng lái xe để xác minh danh tính và
              hoàn tất hồ sơ.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Additional Information Section */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Thông tin bổ sung</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Citizen ID */}
            <div className="space-y-2">
              <Label htmlFor="citizenId" className="text-sm font-medium">
                Số căn cước công dân / CMND
              </Label>
              <div className="relative">
                <Input
                  id="citizenId"
                  type="text"
                  placeholder="Nhập số căn cước công dân"
                  value={additionalInfo.citizenId}
                  onChange={(e) => handleInfoChange('citizenId', e.target.value)}
                  maxLength={12}
                  className={`${
                    additionalInfo.citizenId && !validateCitizenId(additionalInfo.citizenId)
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                />
                {additionalInfo.citizenId && validateCitizenId(additionalInfo.citizenId) && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Nhập 9 số (CCCD) hoặc 12 số (CMND)
              </p>
            </div>

            {/* Driver License Number */}
            <div className="space-y-2">
              <Label htmlFor="driverLicenseNumber" className="text-sm font-medium">
                Số bằng lái xe
              </Label>
              <div className="relative">
                <Input
                  id="driverLicenseNumber"
                  type="text"
                  placeholder="Nhập số bằng lái xe"
                  value={additionalInfo.driverLicenseNumber}
                  onChange={(e) => handleInfoChange('driverLicenseNumber', e.target.value)}
                  maxLength={12}
                  className={`${
                    additionalInfo.driverLicenseNumber && !validateDriverLicenseNumber(additionalInfo.driverLicenseNumber)
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                />
                {additionalInfo.driverLicenseNumber && validateDriverLicenseNumber(additionalInfo.driverLicenseNumber) && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Nhập 12 số bằng lái xe Việt Nam
              </p>
            </div>

            {/* Current Address */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="currentAddress" className="text-sm font-medium">
                Địa chỉ hiện tại
              </Label>
              <div className="relative">
                <Textarea
                  id="currentAddress"
                  placeholder="Nhập địa chỉ hiện tại đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                  value={additionalInfo.currentAddress}
                  onChange={(e) => handleInfoChange('currentAddress', e.target.value)}
                  className={`min-h-[80px] ${
                    additionalInfo.currentAddress && additionalInfo.currentAddress.trim().length < 10
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                />
                {additionalInfo.currentAddress && additionalInfo.currentAddress.trim().length >= 10 && (
                  <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Địa chỉ phải có ít nhất 10 ký tự
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Uploader */}
          <div className="lg:col-span-2">
            <DocumentUpload
              onDocumentUpload={handleDocumentUpload}
              requiredDocuments={REQUIRED_DOCS}
              uploadedDocuments={uploaded as unknown as Record<string, File>}
            />
          </div>

        {/* Right: Summary / Tips */}
        <aside className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-5">
            <h2 className="text-base font-semibold mb-3">Tình trạng hoàn tất</h2>
            
            {/* Additional Info Status */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin bổ sung
              </h3>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-3 w-3 ${
                    validateCitizenId(additionalInfo.citizenId) ? "text-emerald-500" : "text-muted-foreground"
                  }`} />
                  <span className={validateCitizenId(additionalInfo.citizenId) ? "text-foreground" : "text-muted-foreground"}>
                    Số CCCD/CMND
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-3 w-3 ${
                    validateDriverLicenseNumber(additionalInfo.driverLicenseNumber) ? "text-emerald-500" : "text-muted-foreground"
                  }`} />
                  <span className={validateDriverLicenseNumber(additionalInfo.driverLicenseNumber) ? "text-foreground" : "text-muted-foreground"}>
                    Số bằng lái xe
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-3 w-3 ${
                    additionalInfo.currentAddress.trim().length >= 10 ? "text-emerald-500" : "text-muted-foreground"
                  }`} />
                  <span className={additionalInfo.currentAddress.trim().length >= 10 ? "text-foreground" : "text-muted-foreground"}>
                    Địa chỉ hiện tại
                  </span>
                </li>
              </ul>
            </div>

            {/* Documents Status */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Tài liệu bắt buộc
              </h3>
              <ul className="space-y-1 text-xs">
                {REQUIRED_DOCS.map((k) => {
                  const ok = Boolean(uploaded[k]);
                  const labelMap: Record<DocumentType, string> = {
                    driverLicense: "Bằng lái xe - Mặt trước",
                    driverLicenseBack: "Bằng lái xe - Mặt sau",
                    nationalId_front: "CMND/CCCD - Mặt trước",
                    nationalId_back: "CMND/CCCD - Mặt sau",
                  };
                  return (
                    <li key={k} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3 w-3 ${
                          ok ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          ok ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {labelMap[k]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow p-5">
            <h2 className="text-base font-semibold mb-3">Lưu ý khi tải lên</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <Info className="h-4 w-4 mt-0.5" /> Ảnh rõ nét, đủ 4 góc, không
                chói sáng.
              </li>
              <li className="flex gap-2">
                <Info className="h-4 w-4 mt-0.5" /> Dung lượng tối đa 5MB, định
                dạng JPG/PNG.
              </li>
              <li className="flex gap-2">
                <Info className="h-4 w-4 mt-0.5" /> Thông tin phải trùng khớp
                với tài khoản.
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              className="w-full"
              disabled={!allDone}
              onClick={() => navigate("/stations")}
            >
              {allDone ? "Hoàn tất và tiếp tục" : "Chưa hoàn tất"}
            </Button>
            {!allDone && (
              <div className="mt-2 text-xs text-muted-foreground text-center space-y-1">
                {!documentsComplete && (
                  <p>• Vui lòng tải đủ 4 ảnh giấy tờ</p>
                )}
                {!infoValid && (
                  <p>• Vui lòng điền đầy đủ thông tin bổ sung</p>
                )}
              </div>
            )}
            {allDone && (
              <p className="mt-2 text-xs text-green-600 text-center font-medium">
                ✓ Tất cả các yêu cầu đã được hoàn tất!
              </p>
            )}
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
