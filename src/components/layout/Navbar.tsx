import { useAuth } from "@/features/auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b p-4 flex justify-between">
      <span className="font-bold">Buzz</span>

      {user ? (
        <div className="flex gap-4 items-center">
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
