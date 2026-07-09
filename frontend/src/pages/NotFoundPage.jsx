import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { ROUTES } from "../constants";
import Button from "../components/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Compass className="h-6 w-6" />
      </span>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to={ROUTES.HOME}>
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
