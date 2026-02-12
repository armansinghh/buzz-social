import { useAuth } from "@/features/auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
   const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-14 w-full flex justify-between items-center px-6 bg-white">
      <h1 className="text-xl font-bold">Buzz</h1>
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user.name}
          </span>

          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm rounded-md border hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100 transition"
        >
          Login
        </Link>
      )}
    </div>
  );
}
function logout() {
  throw new Error("Function not implemented.");
}

