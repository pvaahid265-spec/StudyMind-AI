import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Brain,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import API from "../axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CHECK EXISTING LOGIN SESSION
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);

        if (user?.email) {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }
      } catch (err) {
        console.error(
          "Saved user parse error:",
          err
        );

        localStorage.removeItem("user");
      }
    }

    setCheckingSession(false);
  }, [navigate]);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!cleanPassword) {
      setError("Please enter your password.");
      return;
    }

    // Basic email validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      // ---------------------------------------------------
      // API REQUEST
      // ---------------------------------------------------

      const response = await API.post(
        "/auth/login",
        {
          email: cleanEmail,
          password: cleanPassword,
        }
      );

      // ---------------------------------------------------
      // RESPONSE VALIDATION
      // ---------------------------------------------------

      const token = response.data?.token;
      const loggedUser = response.data?.user;

      if (!token) {
        throw new Error(
          "Authentication token was not received."
        );
      }

      if (!loggedUser?.email) {
        throw new Error(
          "User information was not received."
        );
      }

      // ---------------------------------------------------
      // SAVE AUTH DATA
      // ---------------------------------------------------

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: loggedUser.name || "Student",
          email: loggedUser.email
            .trim()
            .toLowerCase(),
        })
      );

      // ---------------------------------------------------
      // CLEAR FORM
      // ---------------------------------------------------

      setPassword("");

      // ---------------------------------------------------
      // REDIRECT
      // ---------------------------------------------------

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      // ---------------------------------------------------
      // CLEAR INVALID AUTH DATA
      // ---------------------------------------------------

      if (
        error.response?.status === 401 ||
        error.response?.status === 404
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      // ---------------------------------------------------
      // ERROR MESSAGE
      // ---------------------------------------------------

      const backendMessage =
        error.response?.data?.detail;

      if (backendMessage) {
        setError(backendMessage);
      } else if (
        error.message ===
        "Authentication token was not received."
      ) {
        setError(
          "Login succeeded, but authentication data was not received. Please try again."
        );
      } else if (
        error.message ===
        "User information was not received."
      ) {
        setError(
          "Login succeeded, but user information was not received. Please try again."
        );
      } else if (
        error.code === "ERR_NETWORK"
      ) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        setError(
          "Invalid email or password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING SESSION CHECK
  // =====================================================

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              bg-gradient-to-br
              from-indigo-500
              to-purple-600
              text-white
              shadow-lg
            "
          >
            <Sparkles
              size={24}
              className="animate-pulse"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-white/70">
            Checking your session...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main
      className="
        relative min-h-screen
        overflow-hidden
        bg-slate-950
      "
    >
      {/* =================================================
          BACKGROUND EFFECTS
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-32
          h-96
          w-96
          rounded-full
          bg-indigo-600/30
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-32
          h-[30rem]
          w-[30rem]
          rounded-full
          bg-purple-600/25
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-72
          w-72
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-blue-500/10
          blur-3xl
        "
      />

      {/* =================================================
          BACK HOME
      ================================================== */}

      <div
        className="
          absolute
          left-5
          top-5
          z-20
          sm:left-8
          sm:top-8
        "
      >
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
            px-4
            py-2.5
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

      {/* =================================================
          CONTENT
      ================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-7xl
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
              LEFT BRAND PANEL
          ================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              x: -35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="hidden lg:block"
          >
            {/* BRAND */}

            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-white/5
                px-4
                py-3
                backdrop-blur-xl
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
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

            {/* HEADING */}

            <h1
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
              Welcome back.
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-indigo-400
                  via-violet-400
                  to-purple-400
                  bg-clip-text
                  text-transparent
                "
              >
                Keep learning.
              </span>
            </h1>

            <p
              className="
                mt-6
                max-w-xl
                text-base
                leading-7
                text-white/50
              "
            >
              Continue your personalized learning
              journey with AI-powered summaries,
              intelligent quizzes and your personal
              AI tutor.
            </p>

            {/* FEATURES */}

            <div className="mt-9 space-y-4">
              <FeatureRow
                icon={<Brain size={18} />}
                title="AI-powered learning"
                text="Understand your study material faster."
              />

              <FeatureRow
                icon={<BookOpen size={18} />}
                title="Smart study tools"
                text="Summaries, quizzes and AI tutoring in one place."
              />

              <FeatureRow
                icon={<ShieldCheck size={18} />}
                title="Secure experience"
                text="Your learning experience stays protected."
              />
            </div>
          </motion.section>

          {/* =================================================
              LOGIN CARD
          ================================================== */}

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
              delay: 0.1,
            }}
            className="
              w-full
              max-w-md
              justify-self-center
              lg:justify-self-end
            "
          >
            {/* MOBILE BRAND */}

            <div
              className="
                mb-6
                flex
                justify-center
                lg:hidden
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
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

                  <p className="text-[10px] text-white/40">
                    Intelligent Learning
                  </p>
                </div>
              </div>
            </div>

            {/* CARD */}

            <div
              className="
                overflow-hidden
                rounded-[2rem]
                border
                border-white/10
                bg-white/[0.07]
                p-6
                shadow-2xl
                backdrop-blur-2xl
                sm:p-8
              "
            >
              {/* HEADER */}

              <div className="mb-8">
                <div
                  className="
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-indigo-500
                    to-purple-600
                    text-white
                    shadow-lg
                    shadow-indigo-900/30
                  "
                >
                  <Lock size={21} />
                </div>

                <h2
                  className="
                    text-3xl
                    font-extrabold
                    tracking-tight
                    text-white
                  "
                >
                  Sign in
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Welcome back. Enter your details
                  to continue.
                </p>
              </div>

              {/* ERROR */}

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
                  role="alert"
                  className="
                    mb-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-red-400/20
                    bg-red-500/10
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-red-300
                  "
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </motion.div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleLogin}
                noValidate
                className="space-y-5"
              >
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="login-email"
                    className="
                      mb-2
                      block
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
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/10
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
                      className="
                        shrink-0
                        text-white/35
                      "
                    />

                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        );
                        setError("");
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      className="
                        h-12
                        w-full
                        bg-transparent
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/25
                      "
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="login-password"
                    className="
                      mb-2
                      block
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
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/10
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
                      className="
                        shrink-0
                        text-white/35
                      "
                    />

                    <input
                      id="login-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );
                        setError("");
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="
                        h-12
                        w-full
                        bg-transparent
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/25
                      "
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
                        focus:outline-none
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
                </div>

                {/* SUBMIT */}

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
                    focus:outline-none
                    focus:ring-4
                    focus:ring-indigo-500/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0
                  "
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

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

              {/* DIVIDER */}

              <div
                className="
                  my-7
                  flex
                  items-center
                  gap-3
                "
              >
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-white/30">
                  New to StudyMind AI?
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* REGISTER */}

              <Link
                to="/register"
                className="
                  flex
                  min-h-[48px]
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  text-sm
                  font-bold
                  text-white/75
                  transition
                  hover:border-indigo-400/30
                  hover:bg-white/[0.08]
                  hover:text-white
                "
              >
                Create a new account
              </Link>

              {/* SECURITY */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[11px]
                  text-white/30
                "
              >
                <ShieldCheck size={14} />

                Secure authentication
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

// =====================================================
// FEATURE ROW
// =====================================================

function FeatureRow({
  icon,
  title,
  text,
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-white/5
          text-indigo-300
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-white/80">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-white/35">
          {text}
        </p>
      </div>
    </div>
  );
}

export default Login;