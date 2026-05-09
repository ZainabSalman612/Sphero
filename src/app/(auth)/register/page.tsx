"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, setLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock register
      await new Promise(resolve => setTimeout(resolve, 1000));
      login(
        { id: "new-user-1", name, email }, 
        "mock-jwt-token"
      );
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-8 border border-white/10 glow-cyan shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-sphero-text-secondary)] mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-white/30" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-sphero-cyan)] focus:border-transparent transition-all"
              placeholder="Jane Doe"
              required
            />
          </div>
        </div>

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
              className="block w-full pl-10 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-sphero-cyan)] focus:border-transparent transition-all"
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
              className="block w-full pl-10 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-sphero-cyan)] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !name || !email || !password}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-[var(--color-sphero-cyan)] to-[var(--color-sphero-accent)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
        </button>

        <div className="text-center text-sm text-[var(--color-sphero-text-secondary)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-sphero-cyan)] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
