import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const pending =
    state.pending ||
    JSON.parse(localStorage.getItem("pendingRegister") || "null");
  const fullName = pending?.fullName || "Người dùng";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-6"
      style={{ backgroundImage: "url(/login-bg.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-3xl text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-300 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-2xl">
          Xin chào <span className="text-emerald-300">{fullName}</span>!
        </h1>
        <p className="mt-3 text-base md:text-lg text-white drop-shadow-lg">
          Tài khoản của bạn đã sẵn sàng, bắt đầu hành trình thuê xe điện ngay
          thôi.
        </p>
        <p className="mt-2 text-base md:text-lg text-white drop-shadow-lg">
          📋 Đừng quên{" "}
          <span className="font-semibold text-emerald-200">
            hoàn thành hồ sơ đăng ký
          </span>{" "}
          để trải nghiệm dịch vụ đầy đủ và nhanh chóng hơn nhé!
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
            onClick={() => navigate("/auth/complete-profile")}
          >
            Hoàn thành hồ sơ đăng ký ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
