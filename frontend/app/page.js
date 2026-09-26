'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  // Keep logged-in users on the dashboard
  useEffect(() => {
    // We intentionally don't redirect here.
    // Logged-in users can still access the landing page.
  }, [user, loading]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF3D8] flex items-center justify-center">
        <div className="text-[#5A4A0D] text-sm font-medium">
          Loading SDMS...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF3D8] text-[#5A4A0D]">
      {/* Navbar */}
      <header className="h-16 border-b border-[#E8B84A]/30 bg-[#FFF3D8]/95">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5A4A0D] text-[#FFF3D8]">
              S
            </span>

            <span className="text-lg">SDMS</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#features"
              className="transition hover:text-[#A67917]"
            >
              Features
            </a>

            <a
              href="#about"
              className="transition hover:text-[#A67917]"
            >
              About
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold transition hover:bg-[#F3D789] sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#7A5E12] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5A4A0D]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center px-6 py-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Hero content */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8B84A] bg-[#F3D789]/40 px-3 py-1.5 text-xs font-semibold text-[#7A5E12]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CC961F]" />
              Smart Document Management
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Manage your documents.
              <span className="block text-[#A67917]">
                Simply and securely.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#7A5E12]/80">
              Store, organize, search and manage your documents from one
              simple workspace designed to keep everything within reach.
            </p>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-[#7A5E12] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#5A4A0D] hover:shadow-lg"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-[#A67917]/40 bg-white px-6 py-3 text-sm font-semibold text-[#5A4A0D] transition hover:bg-[#F3D789]/40"
              >
                Sign In
              </Link>
            </div>

            {/* Small trust points */}
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[#7A5E12]/70">
              <span>✓ Easy organization</span>
              <span>✓ Quick search</span>
              <span>✓ Secure access</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-[#E8B84A]/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-[#E8B84A]/50 bg-white shadow-xl">
              {/* Preview top bar */}
              <div className="flex h-11 items-center justify-between border-b border-[#F3D789] px-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#CC961F]" />
                  <span className="text-xs font-semibold text-[#5A4A0D]">
                    SDMS Workspace
                  </span>
                </div>

                <div className="h-6 w-20 rounded-md bg-[#FFF3D8]" />
              </div>

              <div className="flex min-h-[350px]">
                {/* Mini sidebar */}
                <div className="w-36 border-r border-[#F3D789] bg-[#FFF3D8] p-3">
                  <div className="mb-5 h-7 w-20 rounded-md bg-[#5A4A0D]" />

                  <div className="space-y-2">
                    <div className="rounded-lg bg-[#F3D789] px-3 py-2 text-[10px] font-semibold text-[#5A4A0D]">
                      Dashboard
                    </div>

                    <div className="px-3 py-2 text-[10px] text-[#7A5E12]">
                      Documents
                    </div>

                    <div className="px-3 py-2 text-[10px] text-[#7A5E12]">
                      Folders
                    </div>

                    <div className="px-3 py-2 text-[10px] text-[#7A5E12]">
                      Shared
                    </div>
                  </div>
                </div>

                {/* Mini dashboard */}
                <div className="flex-1 p-5">
                  <div className="mb-5">
                    <p className="text-[10px] text-[#A67917]">
                      Welcome back
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#5A4A0D]">
                      Good morning 👋
                    </h2>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-[#F3D789] p-3">
                      <p className="text-[9px] text-gray-500">
                        Documents
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#5A4A0D]">
                        128
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#F3D789] p-3">
                      <p className="text-[9px] text-gray-500">
                        Folders
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#5A4A0D]">
                        24
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#F3D789] p-3">
                      <p className="text-[9px] text-gray-500">
                        Shared
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#5A4A0D]">
                        12
                      </p>
                    </div>
                  </div>

                  {/* Recent documents */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#5A4A0D]">
                        Recent Documents
                      </p>

                      <span className="text-[9px] text-[#A67917]">
                        View all
                      </span>
                    </div>

                    <div className="divide-y divide-[#F3D789] rounded-xl border border-[#F3D789]">
                      {[
                        'Project Report.pdf',
                        'Resume.pdf',
                        'Assignment.docx',
                      ].map((file) => (
                        <div
                          key={file}
                          className="flex items-center justify-between px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3D789]/60 text-xs">
                              📄
                            </span>

                            <span className="text-[10px] font-medium text-[#5A4A0D]">
                              {file}
                            </span>
                          </div>

                          <span className="text-[#A67917]">⋮</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-[#E8B84A]/30 bg-white px-6 py-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#A67917]">
              Everything in one place
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#5A4A0D]">
              A simpler way to manage your files.
            </h2>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Organize',
                text: 'Keep documents and folders neatly organized.',
              },
              {
                title: 'Find quickly',
                text: 'Search your documents without digging through folders.',
              },
              {
                title: 'Share',
                text: 'Manage access and share documents when needed.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-[#F3D789] bg-[#FFF3D8]/40 p-5"
              >
                <h3 className="font-bold text-[#5A4A0D]">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#7A5E12]/75">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t border-[#E8B84A]/30 bg-[#FFF3D8] px-6 py-10"
      >
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-bold text-[#5A4A0D]">
            Your documents, organized.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#7A5E12]/75">
            SDMS brings your document workflow into one focused workspace,
            making it easier to store, organize, search and manage your files.
          </p>

          <Link
            href="/register"
            className="mt-5 inline-flex rounded-xl bg-[#7A5E12] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5A4A0D]"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8B84A]/30 bg-[#5A4A0D] px-6 py-5 text-[#FFF3D8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs">
          <span>© 2026 SDMS</span>
          <span>Smart Document Management System</span>
        </div>
      </footer>
    </main>
  );
}