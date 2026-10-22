import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => z.object({ redirect: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Sign In — Studio Demo" },
      { name: "description", content: "Salon staff sign in." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      }
      navigate({ to: (redirect as any) || "/admin" });
    } catch (e: any) {
      setErr(e.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-32 md:pt-40 pb-24 min-h-screen">
      <div className="mx-auto max-w-md px-6">
        <div className="eyebrow">Salon Admin</div>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-3 text-sm text-foreground/60">
          {mode === "signin"
            ? "Access the booking dashboard."
            : "The first account created becomes the admin."}
        </p>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 focus:outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 focus:outline-none focus:border-foreground"
            />
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs uppercase tracking-[0.28em] text-foreground/60 hover:text-foreground"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
          <Link
            to="/"
            className="block text-center text-xs uppercase tracking-[0.28em] text-foreground/50 hover:text-foreground pt-4"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    </div>
  );
}
