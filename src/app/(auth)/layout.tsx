import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-sphero-bg)]">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[var(--color-sphero-accent)]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[var(--color-sphero-cyan)]/20 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="w-full max-w-md p-4 relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-sphero-accent)] to-[var(--color-sphero-cyan)] flex items-center justify-center glow-cyan">
              <div className="absolute inset-[3px] bg-[var(--color-sphero-bg)] rounded-full z-0" />
              <div className="w-4 h-4 rounded-full bg-[var(--color-sphero-text)] z-10" />
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Welcome to Sphero
          </h1>
          <p className="mt-2 text-sm text-[var(--color-sphero-text-secondary)]">
            Log in to save searches, set alerts, and track trends.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
