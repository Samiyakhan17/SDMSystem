'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF3D8] px-4 py-6 sm:px-6">

      {/* ================= DECORATIVE BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Large soft circle */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F3D789]/50 blur-sm" />

        {/* Gold circle */}
        <div className="absolute right-[-90px] top-16 h-64 w-64 rounded-full bg-[#E8B84A]/35" />

        {/* Bottom shape */}
        <div className="absolute bottom-[-140px] left-[12%] h-72 w-72 rounded-full bg-[#CC961F]/15" />

        {/* Small decorative circles */}
        <div className="absolute left-[8%] top-[28%] h-4 w-4 rounded-full bg-[#CC961F]" />
        <div className="absolute right-[12%] bottom-[20%] h-5 w-5 rounded-full bg-[#A67917]/60" />

        {/* Curved line */}
        <div className="absolute right-[5%] top-[35%] h-36 w-36 rounded-full border-[18px] border-[#E8B84A]/20" />
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#E8B84A]/35 bg-white shadow-[0_25px_70px_rgba(90,74,13,0.12)] md:grid-cols-[0.9fr_1.1fr]">

          {/* ================= LEFT BRANDING ================= */}

          <section className="relative hidden min-h-[560px] overflow-hidden bg-[#5A4A0D] p-9 md:flex md:flex-col md:justify-between">

            {/* Decorative shapes inside panel */}

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-[#E8B84A]/20" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#7A5E12]/70" />

            <div className="pointer-events-none absolute right-12 top-32 h-5 w-5 rounded-full bg-[#F3D789]" />

            <div className="relative z-10">

              {/* Logo */}

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3D789] text-[#5A4A0D] shadow-sm">
                  <FileText size={21} strokeWidth={2.2} />
                </div>

                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    SDMS
                  </h1>

                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#F3D789]">
                    Document Management
                  </p>
                </div>

              </div>

              {/* Main message */}

              <div className="mt-28 max-w-sm">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F3D789]/20 bg-white/5 px-3 py-1.5">
                  <ShieldCheck size={13} className="text-[#F3D789]" />

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F3D789]">
                    Secure workspace
                  </span>
                </div>

                <h2 className="text-4xl font-bold leading-[1.08] tracking-tight text-white">
                  Your documents.
                  <br />
                  <span className="text-[#E8B84A]">
                    One simple place.
                  </span>
                </h2>

                <p className="mt-5 max-w-xs text-sm leading-6 text-[#FFF3D8]/70">
                  Store, organize and manage your important documents
                  from one secure and organized workspace.
                </p>

              </div>

              {/* Small feature */}

              <div className="mt-10 flex items-center gap-3 rounded-2xl border border-[#F3D789]/15 bg-white/5 px-4 py-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3D789]/10 text-[#F3D789]">
                  <FolderOpen size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Everything organized
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#FFF3D8]/55">
                    Files, folders and shared documents
                  </p>
                </div>

              </div>

            </div>

            {/* Footer */}

            <p className="relative z-10 text-[10px] text-[#F3D789]/50">
              Secure Document Management System
            </p>

          </section>

          {/* ================= LOGIN FORM ================= */}

          <section className="relative bg-white p-7 sm:p-10 lg:p-12">

            {/* Mobile logo */}

            <div className="mb-9 flex items-center gap-3 md:hidden">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5A4A0D] text-[#F3D789]">
                <FileText size={19} />
              </div>

              <div>
                <h1 className="text-lg font-bold text-[#5A4A0D]">
                  SDMS
                </h1>

                <p className="text-[9px] font-medium uppercase tracking-wider text-[#A67917]">
                  Document Management
                </p>
              </div>

            </div>

            {/* Heading */}

            <div className="mb-7">

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#CC961F]">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#5A4A0D]">
                Sign in
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-5 text-[#7A5E12]/60">
                Access your documents and continue managing your workspace.
              </p>

            </div>

            {/* ================= ERROR ================= */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">

                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-500">
                  !
                </div>

                <div>
                  <p className="text-xs font-semibold text-red-700">
                    Login failed
                  </p>

                  <p className="mt-0.5 text-xs leading-4 text-red-600">
                    {error}
                  </p>
                </div>

              </div>
            )}

            {/* ================= FORM ================= */}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}

              <div>

                <label className="mb-2 block text-xs font-bold text-[#5A4A0D]">
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={16}
                    strokeWidth={2}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A67917]"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-[#E8B84A]/40 bg-[#FFF8E8] pl-10 pr-4 text-sm text-[#5A4A0D] outline-none transition-all placeholder:text-[#A67917]/40 hover:border-[#E8B84A]/70 focus:border-[#CC961F] focus:bg-white focus:ring-4 focus:ring-[#E8B84A]/15"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="block text-xs font-bold text-[#5A4A0D]">
                    Password
                  </label>

                </div>

                <div className="relative">

                  <Lock
                    size={16}
                    strokeWidth={2}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A67917]"
                  />

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-[#E8B84A]/40 bg-[#FFF8E8] pl-10 pr-4 text-sm text-[#5A4A0D] outline-none transition-all placeholder:text-[#A67917]/40 hover:border-[#E8B84A]/70 focus:border-[#CC961F] focus:bg-white focus:ring-4 focus:ring-[#E8B84A]/15"
                  />

                </div>

              </div>

              {/* Button */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A67917] text-sm font-bold text-white shadow-md shadow-[#A67917]/15 transition-all duration-200 hover:bg-[#7A5E12] hover:shadow-lg hover:shadow-[#A67917]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </>
                )}

              </button>

            </form>

            {/* Register */}

            <div className="mt-8 border-t border-[#E8B84A]/20 pt-6">

              <p className="text-center text-xs text-[#7A5E12]/60">

                Don't have an account?{' '}

                <Link
                  href="/register"
                  className="font-bold text-[#A67917] transition-colors hover:text-[#5A4A0D] hover:underline"
                >
                  Create an account
                </Link>

              </p>

            </div>

            {/* Bottom decorative detail */}

            <div className="pointer-events-none absolute bottom-5 right-6 hidden h-10 w-10 rounded-full border-4 border-[#F3D789]/40 sm:block" />

          </section>

        </div>

      </div>

    </main>
  );
}