import { AuthProvider } from "./context/AuthContext";
import { AppRoutes } from "./AppRoutes";
import "./styles/tokens.css";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
