export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login to Buzz</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-black text-white p-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}
