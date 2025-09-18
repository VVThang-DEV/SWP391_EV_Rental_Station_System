export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  stationId?: string;
}

export interface RegisterProps {
  onRegister: (userData: User) => void;
}
