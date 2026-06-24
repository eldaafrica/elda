import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import Page0  from "./pages/about";
import Page1  from "./pages/dashboard.followups";
import Page2  from "./pages/dashboard.index";
import Page3  from "./pages/dashboard.institutions";
import Page4  from "./pages/dashboard.missions";
import Page5  from "./pages/dashboard.publications";
import Page6  from "./pages/dashboard.recommendations";
import Page7  from "./pages/dashboard.settings";
import Page8  from "./pages/dashboard.users";
import Page9  from "./pages/index";
import Page10 from "./pages/login";
import Page11 from "./pages/missions";
import Page12 from "./pages/recommendations.$recoId";
import Page13 from "./pages/recommendations.index";
import Page14 from "./pages/dashboard.country";

// ─── Écran de chargement centré ──────────────────────────────────────────────
function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// ─── Protection des routes privées ───────────────────────────────────────────
// Affiche un loader pendant la vérification de session, redirige vers /login
// si l'utilisateur n'est pas authentifié.
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}

// ─── Page 404 ────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

// ─── Application ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <I18nProvider>
      <Routes>
        {/* ── Routes publiques ── */}
        <Route path="/"                        element={<Page9  />} />
        <Route path="/about"                   element={<Page0  />} />
        <Route path="/missions"                element={<Page11 />} />
        <Route path="/recommendations"         element={<Page13 />} />
        <Route path="/recommendations/:recoId" element={<Page12 />} />
        <Route path="/login"                   element={<Page10 />} />

        {/* ── Routes protégées (dashboard) ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Page2 /></ProtectedRoute>
        } />
        <Route path="/dashboard/recommendations" element={
          <ProtectedRoute><Page6 /></ProtectedRoute>
        } />
        <Route path="/dashboard/missions" element={
          <ProtectedRoute><Page4 /></ProtectedRoute>
        } />
        <Route path="/dashboard/institutions" element={
          <ProtectedRoute><Page3 /></ProtectedRoute>
        } />
        <Route path="/dashboard/pays" element={
          <ProtectedRoute><Page14 /></ProtectedRoute>
        } />
        <Route path="/dashboard/followups" element={
          <ProtectedRoute><Page1 /></ProtectedRoute>
        } />
        <Route path="/dashboard/publications" element={
          <ProtectedRoute><Page5 /></ProtectedRoute>
        } />
        <Route path="/dashboard/users" element={
          <ProtectedRoute><Page8 /></ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute><Page7 /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </I18nProvider>
  );
}
