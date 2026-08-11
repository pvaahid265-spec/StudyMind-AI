import { Link } from "react-router-dom";
import {
  Mail,
  GitBranch,
  ArrowUpRight,
  Sparkles,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">

        {/* Main footer */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">

            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Sparkles size={21} />
              </div>

              <div>
                <p className="text-xl font-black tracking-tight">
                  StudyMind AI
                </p>

                <p className="text-xs font-medium text-slate-400">
                  Intelligent Learning
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
              Your intelligent AI learning companion for smarter
              notes, personalized quizzes, instant explanations
              and meaningful learning progress.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AI systems operational
            </div>

          </div>

          {/* Platform */}
          <div>

            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Platform
            </h3>

            <div className="mt-5 space-y-3">

              <FooterLink to="/summary">
                AI Summary
              </FooterLink>

              <FooterLink to="/quiz">
                Quiz Generator
              </FooterLink>

              <FooterLink to="/chat">
                AI Tutor
              </FooterLink>

              <FooterLink to="/my-notes">
                My Notes
              </FooterLink>

              <FooterLink to="/analytics">
                Analytics
              </FooterLink>

            </div>

          </div>

          {/* Company */}
          <div>

            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Explore
            </h3>

            <div className="mt-5 space-y-3">

              <FooterLink to="/">
                Home
              </FooterLink>

              <a
                href="/#features"
                className="group inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
              >
                Features
                <ArrowUpRight
                  size={13}
                  className="opacity-0 transition group-hover:opacity-100"
                />
              </a>

              <FooterLink to="/profile">
                Profile
              </FooterLink>

              <FooterLink to="/settings">
                Settings
              </FooterLink>

              <FooterLink to="/register">
                Get Started
              </FooterLink>

            </div>

          </div>

          {/* Connect */}
          <div>

            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Connect
            </h3>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Have questions or feedback? We'd love to hear
              from you.
            </p>

            <div className="mt-5 flex gap-3">

              <motion.a
                whileHover={{ y: -3, scale: 1.05 }}
                href="mailto:contact@studymind.ai"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Email StudyMind AI"
              >
                <Mail size={19} />
              </motion.a>

              <motion.a
                whileHover={{ y: -3, scale: 1.05 }}
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="GitHub"
              >
                <GitBranch size={19} />
              </motion.a>

            </div>

          </div>

        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <p className="text-xs text-slate-500">
            © {currentYear} StudyMind AI. All rights reserved.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            Built with
            <Heart
              size={13}
              className="fill-rose-500 text-rose-500"
            />
            for smarter learning.
          </div>

        </div>

      </div>

    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
    >
      {children}

      <ArrowUpRight
        size={13}
        className="translate-y-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}

export default Footer;