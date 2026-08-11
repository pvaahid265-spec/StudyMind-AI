import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import API from "../axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name: cleanName,
        email: cleanEmail,
        password,
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);

      setError(
        error.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        relative min-h-screen overflow-hidden
        bg-slate-950
      "
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none absolute
          -left-40 -top-40
          h-[30rem] w-[30rem]
          rounded-full
          bg-blue-600/25
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          -right-40 bottom-0
          h-[32rem] w-[32rem]
          rounded-full
          bg-purple-600/25
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          h-80 w-80
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-indigo-500/10
          blur-3xl
        "
      />

      {/* =====================================================
          BACK HOME
      ===================================================== */}

      <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-8">

        <Link
          to="/"
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4 py-2.5
            text-sm
            font-semibold
            text-white/80
            backdrop-blur-xl
            transition
            hover:border-white/20
            hover:bg-white/10
            hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative z-10
          mx-auto
          flex min-h-screen
          w-full max-w-7xl
          items-center
          justify-center
          px-4
          py-24
          sm:px-6
          lg:px-8
        "
      >

        <div
          className="
            grid
            w-full
            max-w-6xl
            items-center
            gap-12
            lg:grid-cols-2
            lg:gap-20
          "
        >

          {/* =================================================
              REGISTER CARD
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
            }}
            className="
              order-2
              w-full
              max-w-md
              justify-self-center
              lg:order-1
              lg:justify-self-start
            "
          >

            {/* Mobile Logo */}

            <div className="mb-6 flex justify-center lg:hidden">

              <div
                className="
                  flex items-center gap-3
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-4 py-3
                  backdrop-blur-xl
                "
              >

                <div
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-indigo-500
                    to-purple-600
                  "
                >
                  <Sparkles size={20} />
                </div>

                <div>

                  <p className="font-extrabold text-white">
                    StudyMind
                    <span className="text-indigo-400">
                      AI
                    </span>
                  </p>

                  <p className="text-[10px] text-white/40">
                    Intelligent Learning
                  </p>

                </div>

              </div>

            </div>

            <div
              className="
                overflow-hidden
                rounded-[2rem]
                border border-white/10
                bg-white/[0.07]
                p-6
                shadow-2xl
                backdrop-blur-2xl
                sm:p-8
              "
            >

              {/* Header */}

              <div className="mb-8">

                <div
                  className="
                    mb-5
                    flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-indigo-500
                    to-purple-600
                    text-white
                    shadow-lg
                    shadow-indigo-900/30
                  "
                >
                  <User size={21} />
                </div>

                <h1
                  className="
                    text-3xl
                    font-extrabold
                    tracking-tight
                    text-white
                  "
                >
                  Create account
                </h1>

                <p className="mt-2 text-sm text-white/45">
                  Start your personalized AI learning journey.
                </p>

              </div>

              {/* Error */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    mb-5
                    rounded-xl
                    border border-red-400/20
                    bg-red-500/10
                    px-4 py-3
                    text-sm
                    font-medium
                    text-red-300
                  "
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}

              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >

                {/* Name */}

                <div>

                  <label
                    className="
                      mb-2 block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white/50
                    "
                  >
                    Full name
                  </label>

                  <div
                    className="
                      flex items-center gap-3
                      rounded-xl
                      border border-white/10
                      bg-black/10
                      px-4
                      transition
                      focus-within:border-indigo-400/60
                      focus-within:bg-white/[0.07]
                      focus-within:ring-4
                      focus-within:ring-indigo-500/10
                    "
                  >

                    <User
                      size={18}
                      className="shrink-0 text-white/35"
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      placeholder="Your full name"
                      autoComplete="name"
                      className="
                        h-12 w-full
                        bg-transparent
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/25
                      "
                      required
                    />

                  </div>

                </div>

                {/* Email */}

                <div>

                  <label
                    className="
                      mb-2 block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white/50
                    "
                  >
                    Email address
                  </label>

                  <div
                    className="
                      flex items-center gap-3
                      rounded-xl
                      border border-white/10
                      bg-black/10
                      px-4
                      transition
                      focus-within:border-indigo-400/60
                      focus-within:bg-white/[0.07]
                      focus-within:ring-4
                      focus-within:ring-indigo-500/10
                    "
                  >

                    <Mail
                      size={18}
                      className="shrink-0 text-white/35"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="
                        h-12 w-full
                        bg-transparent
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/25
                      "
                      required
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <label
                    className="
                      mb-2 block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white/50
                    "
                  >
                    Password
                  </label>

                  <div
                    className="
                      flex items-center gap-3
                      rounded-xl
                      border border-white/10
                      bg-black/10
                      px-4
                      transition
                      focus-within:border-indigo-400/60
                      focus-within:bg-white/[0.07]
                      focus-within:ring-4
                      focus-within:ring-indigo-500/10
                    "
                  >

                    <Lock
                      size={18}
                      className="shrink-0 text-white/35"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      className="
                        h-12 w-full
                        bg-transparent
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/25
                      "
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        shrink-0
                        text-white/35
                        transition
                        hover:text-white
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  <p
                    className="
                      mt-2
                      text-[11px]
                      text-white/30
                    "
                  >
                    Use at least 6 characters for your password.
                  </p>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    flex
                    min-h-[50px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    via-violet-600
                    to-purple-600
                    text-sm
                    font-extrabold
                    text-white
                    shadow-lg
                    shadow-indigo-900/30
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-xl
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account

                      <Sparkles
                        size={17}
                        className="
                          transition
                          group-hover:rotate-12
                        "
                      />
                    </>
                  )}

                </button>

              </form>

              {/* Benefits */}

              <div className="mt-6 space-y-2">

                <Benefit text="AI-powered study tools" />

                <Benefit text="Personalized learning experience" />

                <Benefit text="Learning analytics and progress" />

              </div>

              {/* Login */}

              <div
                className="
                  mt-7
                  border-t border-white/10
                  pt-6
                  text-center
                "
              >

                <p className="text-sm text-white/40">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="
                    mt-2
                    inline-flex
                    font-bold
                    text-indigo-300
                    transition
                    hover:text-indigo-200
                  "
                >
                  Sign in to StudyMind AI
                </Link>

              </div>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[11px]
                  text-white/30
                "
              >
                <ShieldCheck size={14} />
                Secure account creation
              </div>

            </div>

          </motion.section>

          {/* =================================================
              RIGHT BRAND PANEL
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="
              order-1
              hidden
              lg:block
              lg:order-2
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-2xl
                border border-white/10
                bg-white/5
                px-4 py-3
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-indigo-500
                  to-purple-600
                  text-white
                "
              >
                <Sparkles size={20} />
              </div>

              <div>

                <p className="font-extrabold text-white">
                  StudyMind
                  <span className="text-indigo-400">
                    AI
                  </span>
                </p>

                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-white/40
                  "
                >
                  Intelligent Learning
                </p>

              </div>

            </div>

            <h2
              className="
                mt-8
                text-5xl
                font-extrabold
                leading-[1.08]
                tracking-tight
                text-white
                xl:text-6xl
              "
            >
              Build better
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-blue-400
                  via-indigo-400
                  to-purple-400
                  bg-clip-text
                  text-transparent
                "
              >
                learning habits.
              </span>
            </h2>

            <p
              className="
                mt-6
                max-w-xl
                text-base
                leading-7
                text-white/50
              "
            >
              One intelligent platform to organize your
              notes, understand complex concepts, practice
              with quizzes and track your learning progress.
            </p>

            {/* Visual Feature Cards */}

            <div className="mt-9 grid grid-cols-2 gap-4">

              <MiniCard
                icon={<Brain size={20} />}
                title="AI Tutor"
                text="Instant explanations"
              />

              <MiniCard
                icon={<CheckCircle2 size={20} />}
                title="Smart Quizzes"
                text="Test your knowledge"
              />

              <MiniCard
                icon={<Sparkles size={20} />}
                title="AI Summary"
                text="Understand notes faster"
              />

              <MiniCard
                icon={<ShieldCheck size={20} />}
                title="Secure"
                text="Protected experience"
              />

            </div>

          </motion.section>

        </div>

      </div>
    </main>
  );
}

// =====================================================
// BENEFIT
// =====================================================

function Benefit({ text }) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        text-xs
        text-white/40
      "
    >
      <CheckCircle2
        size={14}
        className="text-green-400"
      />

      {text}
    </div>
  );
}

// =====================================================
// MINI CARD
// =====================================================

function MiniCard({
  icon,
  title,
  text,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-white/[0.05]
        p-4
        backdrop-blur-xl
        transition
        hover:bg-white/[0.08]
      "
    >

      <div
        className="
          flex h-9 w-9
          items-center justify-center
          rounded-xl
          bg-indigo-500/10
          text-indigo-300
        "
      >
        {icon}
      </div>

      <p className="mt-3 text-sm font-bold text-white/80">
        {title}
      </p>

      <p className="mt-1 text-xs text-white/35">
        {text}
      </p>

    </div>
  );
}

export default Register;