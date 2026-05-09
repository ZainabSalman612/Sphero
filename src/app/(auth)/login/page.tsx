"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading, setLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Mock login for frontend MVP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === "demo@sphero.ai" && password === "demo123") {
        login(
          { id: "1", name: "Demo User", email: "demo@sphero.ai" }, 
          "mock-jwt-token"
        );
        router.push("/dashboard");
      } else {
        setError("Invalid email or password. Use demo@sphero.ai / demo123");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-8 border border-white/10 glow-accent shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-sphero-text-secondary)] mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/30" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-sphero-accent)] focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-sphero-text-secondary)] mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/30" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-sphero-accent)] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-[var(--color-sphero-accent)] to-[var(--color-sphero-cyan)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
        </button>

        <div className="text-center text-sm text-[var(--color-sphero-text-secondary)]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[var(--color-sphero-accent-light)] hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
