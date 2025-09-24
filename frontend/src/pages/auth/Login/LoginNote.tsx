import { useTranslation } from "@/contexts/TranslationContext";

const LoginNote = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-6 text-center">
      <p className="text-white/80 text-sm">{t("common.demoNote")}</p>
    </div>
  );
};

export default LoginNote;
