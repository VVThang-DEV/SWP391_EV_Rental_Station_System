import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentUpload from "@/components/DocumentUpload";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Info, ShieldCheck } from "lucide-react";

type RequiredDocKey =
  | "driverLicense"
  | "driverLicenseBack"
  | "nationalId_front"
  | "nationalId_back";

const REQUIRED_DOCS: RequiredDocKey[] = [
  "driverLicense",
  "driverLicenseBack",
  "nationalId_front",
  "nationalId_back",
];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState<Record<RequiredDocKey, File | null>>(
    {
      driverLicense: null,
      driverLicenseBack: null,
      nationalId_front: null,
      nationalId_back: null,
    }
  );

  const handleDocumentUpload = (documentType: string, file: File) => {
    const key = documentType as RequiredDocKey;
    if (REQUIRED_DOCS.includes(key)) {
      setUploaded((prev) => ({ ...prev, [key]: file }));
    }
  };

  const allDone = REQUIRED_DOCS.every((k) => Boolean(uploaded[k]));

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
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <h2 className="text-base font-semibold mb-3">Yêu cầu bắt buộc</h2>
            <ul className="space-y-2">
              {REQUIRED_DOCS.map((k) => {
                const ok = Boolean(uploaded[k]);
                const labelMap: Record<RequiredDocKey, string> = {
                  driverLicense: "Bằng lái xe - Mặt trước",
                  driverLicenseBack: "Bằng lái xe - Mặt sau",
                  nationalId_front: "CMND/CCCD - Mặt trước",
                  nationalId_back: "CMND/CCCD - Mặt sau",
                };
                return (
                  <li key={k} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 ${
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
              Hoàn tất và tiếp tục
            </Button>
            {!allDone && (
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Vui lòng tải đủ 4 ảnh để tiếp tục.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CompleteProfile;
