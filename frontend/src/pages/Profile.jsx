import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../axios";

import {
  User,
  Mail,
  Save,
  BookOpen,
  Brain,
  MessageCircle,
  FileText,
  Trophy,
  Calendar,
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState({
    name: "",
    email: "",
    joinedDate: "",
    progress: 0,

    stats: {
      notes: 0,
      quizzes: 0,
      chats: 0,
      summaries: 0,
      streak: 0,
    },
  });

  // =====================================================
  // SESSION
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getSavedUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  };

  // =====================================================
  // CALCULATE PROGRESS
  // =====================================================

  const calculateProgress = (stats) => {
    const notes = Number(stats.notes) || 0;
    const quizzes = Number(stats.quizzes) || 0;
    const chats = Number(stats.chats) || 0;

    if (!notes && !quizzes && !chats) {
      return 0;
    }

    const noteScore = Math.min(100, notes * 2);
    const quizScore = Math.min(100, quizzes * 5);
    const chatScore = Math.min(100, chats * 3);

    return Math.min(
      100,
      Math.round(
        noteScore * 0.4 +
          quizScore * 0.3 +
          chatScore * 0.3
      )
    );
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    const savedUser = getSavedUser();

    if (!savedUser?.email || !getToken()) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    loadProfile(savedUser.email);
  }, [navigate]);

  // =====================================================
  // GET PROFILE
  // =====================================================

  const loadProfile = async (email) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await API.get(
        `/profile/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profile =
        response.data?.profile ||
        response.data?.user ||
        response.data ||
        {};

      const notes = Number(
        profile.notes_uploaded ??
          profile.notes ??
          0
      );

      const quizzes = Number(
        profile.quizzes_completed ??
          profile.quizzes ??
          0
      );

      const chats = Number(
        profile.ai_conversations ??
          profile.ai_chats ??
          profile.chats ??
          0
      );

      const summaries = Number(
        profile.summaries_created ??
          profile.summaries ??
          0
      );

      const streak = Number(
        profile.learning_streak ??
          profile.streak ??
          0
      );

      const stats = {
        notes,
        quizzes,
        chats,
        summaries,
        streak,
      };

      const backendProgress = Number(
        profile.learning_progress ??
          profile.overall_progress
      );

      const progress = Number.isFinite(
        backendProgress
      )
        ? Math.min(
            100,
            Math.max(
              0,
              backendProgress
            )
          )
        : calculateProgress(stats);

      const loadedUser = {
        name: profile.name || "",
        email: profile.email || email,

        joinedDate:
          profile.created_at ||
          profile.joinedDate ||
          profile.createdAt ||
          "",

        progress,

        stats,
      };

      setUser(loadedUser);

      // Keep local user information synchronized.
      const savedUser = getSavedUser();

      if (savedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...savedUser,
            name:
              loadedUser.name ||
              savedUser.name,
            email:
              loadedUser.email ||
              savedUser.email,
          })
        );
      }
    } catch (error) {
      console.error(
        "Profile Load Error:",
        error
      );

      const status =
        error?.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        error?.response?.data?.detail ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const updateProfile = async () => {
    const trimmedName =
      user.name.trim();

    if (!trimmedName) {
      setError(
        "Please enter your full name."
      );

      setSuccess("");

      return;
    }

    if (trimmedName.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );

      setSuccess("");

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await API.put(
        `/profile/${encodeURIComponent(
          user.email
        )}`,
        {
          name: trimmedName,
        },
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`,
          },
        }
      );

      const updatedProfile =
        response.data?.profile ||
        response.data?.user ||
        response.data ||
        {};

      const updatedName =
        updatedProfile.name ||
        trimmedName;

      setUser((prev) => {
        const updatedStats = {
          notes: Number(
            updatedProfile.notes_uploaded ??
              updatedProfile.notes ??
              prev.stats.notes
          ),

          quizzes: Number(
            updatedProfile.quizzes_completed ??
              updatedProfile.quizzes ??
              prev.stats.quizzes
          ),

          chats: Number(
            updatedProfile.ai_conversations ??
              updatedProfile.ai_chats ??
              updatedProfile.chats ??
              prev.stats.chats
          ),

          summaries: Number(
            updatedProfile.summaries_created ??
              updatedProfile.summaries ??
              prev.stats.summaries
          ),

          streak: Number(
            updatedProfile.learning_streak ??
              updatedProfile.streak ??
              prev.stats.streak
          ),
        };

        const backendProgress = Number(
          updatedProfile.learning_progress ??
            updatedProfile.overall_progress
        );

        const progress =
          Number.isFinite(
            backendProgress
          )
            ? Math.min(
                100,
                Math.max(
                  0,
                  backendProgress
                )
              )
            : calculateProgress(
                updatedStats
              );

        return {
          ...prev,

          name: updatedName,

          email:
            updatedProfile.email ||
            prev.email,

          joinedDate:
            updatedProfile.created_at ||
            prev.joinedDate,

          progress,

          stats: updatedStats,
        };
      });

      // =================================================
      // LOCAL STORAGE SYNC
      // =================================================

      const savedUser = getSavedUser();

      if (savedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...savedUser,
            name: updatedName,
          })
        );
      }

      window.dispatchEvent(
        new Event("userUpdated")
      );

      setSuccess(
        "Profile updated successfully."
      );

      // Automatically hide success message.
      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );

      const status =
        error?.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        error?.response?.data?.detail ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PROFILE INITIAL
  // =====================================================

  const profileInitial = useMemo(() => {
    const name =
      user.name?.trim();

    return name
      ? name
          .charAt(0)
          .toUpperCase()
      : "U";
  }, [user.name]);

  // =====================================================
  // PROGRESS LABEL
  // =====================================================

  const progressLabel = useMemo(() => {
    if (user.progress >= 80) {
      return "Advanced Learner";
    }

    if (user.progress >= 50) {
      return "Active Learner";
    }

    if (user.progress >= 25) {
      return "Growing Learner";
    }

    return "Getting Started";
  }, [user.progress]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main
        className="
          min-h-screen
          bg-[#f6f8fc]
          px-4
          pb-16
          pt-[92px]
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[600px]
            w-full
            max-w-7xl
            items-center
            justify-center
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              w-full
              max-w-sm
              rounded-[2rem]
              border
              border-slate-200
              bg-white
              p-8
              text-center
              shadow-xl
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-indigo-50
              "
            >
              <User
                size={30}
                className="
                  animate-pulse
                  text-indigo-600
                "
              />
            </div>

            <h2
              className="
                mt-5
                text-lg
                font-black
                text-slate-900
              "
            >
              Loading your profile
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Preparing your learning
              information...
            </p>

            <div
              className="
                mx-auto
                mt-5
                h-1.5
                w-32
                overflow-hidden
                rounded-full
                bg-slate-100
              "
            >
              <div
                className="
                  h-full
                  w-1/2
                  animate-pulse
                  rounded-full
                  bg-indigo-600
                "
              />
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error && !user.email) {
    return (
      <main
        className="
          min-h-screen
          bg-[#f6f8fc]
          px-4
          pb-16
          pt-[92px]
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[600px]
            w-full
            max-w-3xl
            items-center
            justify-center
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              w-full
              rounded-[2rem]
              border
              border-red-100
              bg-white
              p-8
              text-center
              shadow-xl
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-500
              "
            >
              <AlertCircle size={30} />
            </div>

            <h2
              className="
                mt-5
                text-xl
                font-black
                text-slate-900
              "
            >
              Profile Unavailable
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="
                mt-6
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-indigo-700
              "
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </motion.div>
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
        min-h-screen
        overflow-x-hidden
        bg-[#f6f8fc]
        px-3
        pb-16
        pt-[92px]
        sm:px-5
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          space-y-7
        "
      >
        {/* =================================================
            TOP NAVIGATION + HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3.5
                py-2
                text-sm
                font-bold
                text-slate-600
                shadow-sm
                transition
                hover:-translate-x-0.5
                hover:border-indigo-200
                hover:bg-indigo-50
                hover:text-indigo-600
              "
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-100
                  text-indigo-600
                "
              >
                <User size={22} />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-widest
                    text-indigo-600
                  "
                >
                  Account
                </p>

                <h1
                  className="
                    mt-0.5
                    text-2xl
                    font-black
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  My Profile
                </h1>
              </div>
            </div>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-slate-500
                sm:text-base
              "
            >
              Manage your personal information
              and track your learning progress
              in StudyMind AI.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadProfile(user.email)
            }
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-slate-600
              shadow-sm
              transition
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:text-indigo-600
            "
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </motion.div>

        {/* =================================================
            ALERTS
        ================================================= */}

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
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-100
              bg-red-50
              px-4
              py-3
              text-sm
              font-medium
              text-red-700
            "
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </motion.div>
        )}

        {success && (
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
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50
              px-4
              py-3
              text-sm
              font-bold
              text-emerald-700
            "
          >
            <CheckCircle2
              size={18}
              className="shrink-0"
            />

            {success}
          </motion.div>
        )}

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-slate-950
            p-6
            text-white
            shadow-2xl
            sm:p-8
            lg:p-10
          "
        >
          {/* Decorative glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-32
              h-96
              w-96
              rounded-full
              bg-indigo-500/30
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-40
              left-1/4
              h-96
              w-96
              rounded-full
              bg-fuchsia-500/20
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              right-1/3
              top-1/2
              h-56
              w-56
              rounded-full
              bg-cyan-400/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              grid
              gap-7
              lg:grid-cols-[minmax(0,1fr)_280px]
              lg:items-center
            "
          >
            {/* IDENTITY */}

            <div
              className="
                flex
                min-w-0
                flex-col
                gap-5
                sm:flex-row
                sm:items-center
              "
            >
              <div
                className="
                  flex
                  h-20
                  w-20
                  shrink-0
                  items-center
                  justify-center
                  rounded-[1.6rem]
                  border
                  border-white/10
                  bg-white/10
                  text-3xl
                  font-black
                  shadow-xl
                  backdrop-blur-xl
                  sm:h-24
                  sm:w-24
                  sm:text-4xl
                "
              >
                {profileInitial}
              </div>

              <div className="min-w-0">
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-white/10
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-indigo-200
                  "
                >
                  <Sparkles size={13} />
                  StudyMind AI Student
                </div>

                <h2
                  className="
                    mt-4
                    break-words
                    text-2xl
                    font-black
                    tracking-tight
                    sm:text-3xl
                  "
                >
                  {user.name ||
                    "Student"}
                </h2>

                <div
                  className="
                    mt-2
                    flex
                    min-w-0
                    items-center
                    gap-2
                    text-sm
                    text-slate-400
                  "
                >
                  <Mail
                    size={15}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {user.email ||
                      "No email available"}
                  </span>
                </div>
              </div>
            </div>

            {/* MEMBER + PROGRESS */}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.06]
                  p-4
                  backdrop-blur-xl
                "
              >
                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-widest
                    text-slate-500
                  "
                >
                  Member since
                </p>

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Calendar
                    size={16}
                    className="text-indigo-300"
                  />

                  <p className="text-sm font-bold">
                    {formatDate(
                      user.joinedDate
                    )}
                  </p>
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.06]
                  p-4
                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-widest
                        text-slate-500
                      "
                    >
                      Learning level
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {progressLabel}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black text-cyan-300">
                      {user.progress}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            PERSONAL + LEARNING
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-7
            xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]
          "
        >
          {/* PERSONAL INFORMATION */}

          <motion.section
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    text-indigo-600
                  "
                >
                  Profile
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-slate-900
                  "
                >
                  Personal Information
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Update your profile details.
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <Edit3 size={18} />
              </div>
            </div>

            <div className="mt-7 space-y-5">
              {/* NAME */}

              <div>
                <label
                  htmlFor="profile-name"
                  className="
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Full Name
                </label>

                <div className="relative mt-2">
                  <User
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="profile-name"
                    type="text"
                    value={user.name}
                    onChange={(e) => {
                      setUser((prev) => ({
                        ...prev,
                        name:
                          e.target.value,
                      }));

                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-11
                      pr-4
                      text-sm
                      font-medium
                      text-slate-800
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-indigo-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-indigo-100
                    "
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="profile-email"
                  className="
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Email Address
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="profile-email"
                    type="email"
                    value={user.email}
                    disabled
                    className="
                      h-12
                      w-full
                      cursor-not-allowed
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-100
                      pl-11
                      pr-4
                      text-sm
                      font-medium
                      text-slate-500
                      outline-none
                    "
                  />
                </div>

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    text-slate-400
                  "
                >
                  <ShieldCheck size={13} />
                  Email cannot be changed here.
                </div>
              </div>

              {/* SAVE */}

              <button
                type="button"
                onClick={updateProfile}
                disabled={saving}
                className="
                  mt-2
                  inline-flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-indigo-200
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {saving ? (
                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </motion.section>

          {/* LEARNING OVERVIEW */}

          <motion.section
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    text-violet-600
                  "
                >
                  Activity
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-slate-900
                  "
                >
                  Learning Overview
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Your StudyMind AI activity.
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                "
              >
                <TrendingUp size={20} />
              </div>
            </div>

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
              "
            >
              <StatCard
                icon={<BookOpen size={20} />}
                title="Notes"
                value={user.stats.notes}
                iconStyle="indigo"
              />

              <StatCard
                icon={<Trophy size={20} />}
                title="Quizzes"
                value={user.stats.quizzes}
                iconStyle="yellow"
              />

              <StatCard
                icon={<MessageCircle size={20} />}
                title="AI Chats"
                value={user.stats.chats}
                iconStyle="purple"
              />

              <StatCard
                icon={<FileText size={20} />}
                title="Summaries"
                value={user.stats.summaries}
                iconStyle="green"
              />

              <StatCard
                icon={<Flame size={20} />}
                title="Streak"
                value={`${user.stats.streak}d`}
                iconStyle="orange"
              />

              <StatCard
                icon={<Award size={20} />}
                title="Progress"
                value={`${user.progress}%`}
                iconStyle="blue"
              />
            </div>
          </motion.section>
        </div>

        {/* =================================================
            LEARNING PROGRESS
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-7
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
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
                    bg-indigo-50
                    text-indigo-600
                  "
                >
                  <Brain size={19} />
                </div>

                <div>
                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                      text-indigo-600
                    "
                  >
                    Performance
                  </p>

                  <h2
                    className="
                      mt-0.5
                      text-xl
                      font-black
                      text-slate-900
                    "
                  >
                    Overall Learning Progress
                  </h2>
                </div>
              </div>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Keep learning consistently
                to improve your progress.
              </p>
            </div>

            <div className="sm:text-right">
              <p
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  text-indigo-600
                "
              >
                {user.progress}%
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  font-semibold
                  text-slate-400
                "
              >
                {progressLabel}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <div
              className="
                h-3
                overflow-hidden
                rounded-full
                bg-slate-100
              "
            >
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(
                    Math.max(
                      Number(
                        user.progress
                      ) || 0,
                      0
                    ),
                    100
                  )}%`,
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-indigo-600
                  via-violet-600
                  to-fuchsia-500
                "
              />
            </div>

            <div
              className="
                mt-3
                flex
                justify-between
                text-[11px]
                font-bold
                text-slate-400
                sm:text-xs
              "
            >
              <span>Getting Started</span>

              <span>
                {progressLabel}
              </span>

              <span>Advanced Learner</span>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            ACHIEVEMENTS
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-7
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                  text-amber-600
                "
              >
                Milestones
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                Achievements
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Milestones from your learning journey.
              </p>
            </div>

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-amber-50
                text-amber-500
              "
            >
              <Trophy size={20} />
            </div>
          </div>

          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            "
          >
            <Achievement
              title="First Upload"
              desc="Upload your first study note"
              unlocked={
                user.stats.notes > 0
              }
              icon={
                <FileText size={20} />
              }
            />

            <Achievement
              title="Quiz Master"
              desc="Complete your first AI quiz"
              unlocked={
                user.stats.quizzes > 0
              }
              icon={
                <Trophy size={20} />
              }
            />

            <Achievement
              title="AI Learner"
              desc="Start learning with AI Tutor"
              unlocked={
                user.stats.chats > 0
              }
              icon={
                <Brain size={20} />
              }
            />
          </div>
        </motion.section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            border-t
            border-slate-200
            pt-7
            text-center
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              text-slate-500
            "
          >
            <Sparkles
              size={16}
              className="text-indigo-500"
            />

            StudyMind AI
          </div>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Learn smarter. Practice better.
            Improve faster.
          </p>
        </footer>
      </div>
    </main>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
  iconStyle = "indigo",
}) {
  const styles = {
    indigo:
      "bg-indigo-50 text-indigo-600",

    yellow:
      "bg-amber-50 text-amber-600",

    purple:
      "bg-violet-50 text-violet-600",

    green:
      "bg-emerald-50 text-emerald-600",

    orange:
      "bg-orange-50 text-orange-600",

    blue:
      "bg-blue-50 text-blue-600",
  };

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="
        min-w-0
        rounded-2xl
        border
        border-slate-100
        bg-slate-50/70
        p-4
        transition
        hover:bg-white
        hover:shadow-md
        sm:p-5
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${styles[iconStyle]}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className="
              truncate
              text-xs
              font-semibold
              text-slate-500
            "
          >
            {title}
          </p>

          <p
            className="
              mt-0.5
              text-xl
              font-black
              text-slate-900
            "
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// ACHIEVEMENT
// =====================================================

function Achievement({
  title,
  desc,
  icon,
  unlocked,
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className={`
        flex
        min-w-0
        items-center
        gap-4
        rounded-2xl
        border
        p-5
        transition
        ${
          unlocked
            ? "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white hover:shadow-md"
            : "border-slate-100 bg-slate-50/70"
        }
      `}
    >
      <div
        className={`
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${
            unlocked
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-200 text-slate-400"
          }
        `}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className="
              truncate
              text-sm
              font-black
              text-slate-900
            "
          >
            {title}
          </h3>

          {unlocked && (
            <CheckCircle2
              size={15}
              className="
                shrink-0
                text-emerald-500
              "
            />
          )}
        </div>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-500
          "
        >
          {desc}
        </p>

        <p
          className={`
            mt-1
            text-[11px]
            font-black
            ${
              unlocked
                ? "text-emerald-600"
                : "text-slate-400"
            }
          `}
        >
          {unlocked
            ? "Unlocked"
            : "Locked"}
        </p>
      </div>
    </motion.div>
  );
}

// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(date) {
  if (!date) {
    return "Not available";
  }

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "Not available";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default Profile;
