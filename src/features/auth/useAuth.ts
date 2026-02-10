import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<null | { id: string }>(null);

  const login = () => setUser({ id: "123" });
  const logout = () => setUser(null);

  return { user, login, logout };
}
