// Authentification locale (démo) — stockage de session dans localStorage.
// ⚠️ À ne PAS utiliser en production : les identifiants sont visibles côté client.

const SESSION_KEY = "local-auth-session";

// Liste des utilisateurs autorisés (codée en dur)
const USERS: Array<{ email: string; password: string; name: string }> = [
  { email: "lenny@eisa.org", password: "admin1234", name: "Admin" },
  { email: "admin@gmail.com", password: "admin1234", name: "Admin" },
];

export type LocalSession = {
  email: string;
  name: string;
  loggedInAt: number;
};

type Listener = (session: LocalSession | null) => void;
const listeners = new Set<Listener>();

function notify(session: LocalSession | null) {
  listeners.forEach((l) => l(session));
}

export const localAuth = {
  signIn(email: string, password: string): { session: LocalSession | null; error: string | null } {
    const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return { session: null, error: "Email ou mot de passe incorrect." };
    }
    const session: LocalSession = {
      email: user.email,
      name: user.name,
      loggedInAt: Date.now(),
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    notify(session);
    return { session, error: null };
  },

  signOut() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    }
    notify(null);
  },

  getSession(): LocalSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as LocalSession) : null;
    } catch {
      return null;
    }
  },

  onChange(listener: Listener): () => void {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        listener(this.getSession());
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  },
};
