import { RegisterForm } from "./RegisterForm";
import { RegisterProps } from "./types";

const Register = (props: RegisterProps) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url(/login-bg.jpg)" }}
    >
      <RegisterForm {...props} />
    </div>
  );
};

export default Register;
