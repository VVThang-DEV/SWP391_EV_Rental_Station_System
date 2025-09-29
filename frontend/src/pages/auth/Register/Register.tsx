import { RegisterForm } from "./RegisterForm";
import { RegisterProps } from "./types";

const Register = (props: RegisterProps) => {
  return (
    <div className="login-page">
      <div className="w-full max-w-md">
        <RegisterForm {...props} />
      </div>
    </div>
  );
};

export default Register;
