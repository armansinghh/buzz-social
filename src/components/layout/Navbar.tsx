import { useAuth } from "@/features/auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b p-4 flex justify-between align-middle">
      <span className="font-bold text-2xl">Buzz</span>

      {user ? (
        <div className="flex gap-4 items-center">
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <a href="/login" className="flex items-center">Login</a>
      )}
    </nav>
  );
}
