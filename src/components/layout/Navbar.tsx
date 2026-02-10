import { useAuth } from "@/features/auth/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b p-4 flex justify-between">
      <span className="font-bold">Buzz</span>

      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
