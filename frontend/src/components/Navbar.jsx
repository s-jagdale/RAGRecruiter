import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants";
import Button from "./Button";

const navLinks = [
  { label: "Home", to: ROUTES.HOME },
  { label: "Dashboard", to: ROUTES.DASHBOARD, authOnly: true },
  { label: "History", to: ROUTES.HISTORY, authOnly: true },
  { label: "About", to: ROUTES.ABOUT },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/5 bg-white/80 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-gradient text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          RAGRecruiter
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks
            .filter((link) => !link.authOnly || isAuthenticated)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary-700" : "text-ink-700 hover:text-primary-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to={ROUTES.PROFILE} className="text-sm font-medium text-ink-700 hover:text-primary-700">
                {user?.username}
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="text-sm font-medium text-ink-700 hover:text-primary-700">
                Log in
              </Link>
              <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-ink-900/5 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks
              .filter((link) => !link.authOnly || isAuthenticated)
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-primary-50 hover:text-primary-700"
                >
                  {link.label}
                </NavLink>
              ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-ink-900/5 pt-3">
              {isAuthenticated ? (
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              ) : (
                <>
                  <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                    Log in
                  </Button>
                  <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
