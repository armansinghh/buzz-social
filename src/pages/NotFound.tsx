import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-(--bg-secondary)">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-(--accent)">
          404 Error
        </p>

        <h1 className="mt-2 text-4xl font-bold text-(--text-primary)">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-(--text-muted)">
          Sorry, we couldn’t find the page you’re looking for.
        </p>

        <Link
          to="/"
          className="inline-flex mt-8 px-5 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color) text-sm font-medium text-(--text-primary) hover:bg-(--bg-tertiary) transition"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}