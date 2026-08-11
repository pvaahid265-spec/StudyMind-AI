import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Flame,
  GraduationCap,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";

import API from "../axios";

// =====================================================
// ANIMATION
// =====================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [activities, setActivities] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  const [statsData, setStatsData] = useState({
    notes_uploaded: 0,
    quizzes_completed: 0,
    ai_conversations: 0,
    learning_streak: 0,
    favorites: 0,
    summaries_created: 0,
    study_hours: 0,
    overall_progress: null,
  });

  // ===================================================
  // SESSION
  // ===================================================

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

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("userUpdated")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    const token = getToken();
    const savedUser = getSavedUser();

    if (!token || !savedUser?.email) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    setUser(savedUser);

    const initializeDashboard = async () => {
      await Promise.all([
        loadDashboard(savedUser.email),
        loadFavorites(savedUser.email),
      ]);
    };

    initializeDashboard();
  }, [navigate]);

  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  const loadDashboard = async (email) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      const response = await API.get(
        `/dashboard/stats/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data || {};

      // -------------------------------
      // USER
      // -------------------------------

      if (data.user) {
        setUser(data.user);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        window.dispatchEvent(
          new Event("userUpdated")
        );
      }

      // -------------------------------
      // STATS
      // -------------------------------

      const stats = data.stats || {};

      setStatsData({
        notes_uploaded:
          Number(stats.notes_uploaded) || 0,

        quizzes_completed:
          Number(stats.quizzes_completed) || 0,

        ai_conversations:
          Number(stats.ai_conversations) || 0,

        learning_streak:
          Number.isFinite(Number(stats.learning_streak))
            ? Number(stats.learning_streak)
            : 0,

        favorites:
          Number(stats.favorites) || 0,

        summaries_created:
          Number(stats.summaries_created ?? stats.summaries ?? 0) || 0,

        study_hours:
          Number(stats.study_hours ?? stats.weekly_study_hours ?? 0) || 0,

        overall_progress:
          Number.isFinite(Number(stats.overall_progress))
            ? Math.min(100, Math.max(0, Number(stats.overall_progress)))
            : null,
      });

      // -------------------------------
      // ACTIVITY
      // -------------------------------

      setActivities(
        Array.isArray(data.activities)
          ? data.activities
          : []
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      const status =
        error?.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        logout();
        return;
      }

      setErrorMessage(
        "Unable to load some dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD FAVORITES
  // ===================================================

  const loadFavorites = async (email) => {
    try {
      const token = getToken();

      const response = await API.get(
        `/notes/favorites/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFavorites(
        Array.isArray(
          response.data?.favorites
        )
          ? response.data.favorites
          : []
      );
    } catch (error) {
      console.error(
        "Favorites loading error:",
        error
      );

      setFavorites([]);
    }
  };

  // ===================================================
  // SEARCH NOTES
  // ===================================================

  const searchNotes = async () => {
    const query = search.trim();

    if (!query) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setSearchLoading(true);

      const savedUser = getSavedUser();

      if (!savedUser?.email) {
        logout();
        return;
      }

      const token = getToken();

      const response = await API.get(
        `/notes/search/${encodeURIComponent(
          savedUser.email
        )}?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSearchResults(
        Array.isArray(
          response.data?.results
        )
          ? response.data.results
          : []
      );

      setHasSearched(true);
    } catch (error) {
      console.error(
        "Search error:",
        error
      );

      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ===================================================
  // CLEAR SEARCH
  // ===================================================

  const clearSearch = () => {
    setSearch("");
    setSearchResults([]);
    setHasSearched(false);
  };

  // ===================================================
  // ACTIVITY DATE
  // ===================================================

  const formatActivityDate = (
    activity
  ) => {
    const value =
      activity?.date ||
      activity?.time ||
      activity?.created_at;

    if (!value) {
      return "Recently";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Recently";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // ===================================================
  // OVERALL PROGRESS
  // ===================================================

  const overallProgress = useMemo(() => {
    if (statsData.overall_progress !== null) {
      return statsData.overall_progress;
    }

    const notes = statsData.notes_uploaded;
    const quizzes = statsData.quizzes_completed;
    const chats = statsData.ai_conversations;

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
  }, [statsData]);

  // ===================================================
  // USER DISPLAY
  // ===================================================

  const userName =
    user?.name?.trim() ||
    "Student";

  // ===================================================
  // DAILY GOAL
  // ===================================================

  const todayTaskCount = useMemo(() => {
    const today = new Date();

    return activities.filter((activity) => {
      const value =
        activity?.date ||
        activity?.time ||
        activity?.created_at;

      if (!value) return false;

      const date = new Date(value);

      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }).length;
  }, [activities]);

  const dailyGoalTarget = 2;

  const dailyGoalProgress = Math.min(
    100,
    Math.round(
      (Math.min(todayTaskCount, dailyGoalTarget) /
        dailyGoalTarget) *
        100
    )
  );

  // ===================================================
  // STATS
  // ===================================================

  const stats = [
    {
      label: "Notes uploaded",
      value:
        statsData.notes_uploaded,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accent:
        "from-blue-500 to-cyan-500",
    },
    {
      label: "Quizzes completed",
      value:
        statsData.quizzes_completed,
      icon: Brain,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accent:
        "from-violet-500 to-fuchsia-500",
    },
    {
      label: "AI conversations",
      value:
        statsData.ai_conversations,
      icon: MessageCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent:
        "from-emerald-500 to-teal-500",
    },
    {
      label: "Learning streak",
      value: `${statsData.learning_streak} days`,
      icon: Flame,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      accent:
        "from-orange-500 to-rose-500",
    },
    {
      label: "AI summaries",
      value: statsData.summaries_created,
      icon: Sparkles,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      accent:
        "from-cyan-500 to-blue-500",
    },
  ];

  // ===================================================
  // TOOLS
  // ===================================================

  const tools = [
    {
      title: "Upload Notes",
      description:
        "Turn PDFs into structured AI summaries.",
      icon: Upload,
      path: "/summary",
      gradient:
        "from-blue-600 to-cyan-500",
    },
    {
      title: "Generate Quiz",
      description:
        "Create smart questions from your study material.",
      icon: Brain,
      path: "/quiz",
      gradient:
        "from-violet-600 to-fuchsia-500",
    },
    {
      title: "AI Tutor",
      description:
        "Ask questions and clear difficult concepts.",
      icon: MessageCircle,
      path: "/chat",
      gradient:
        "from-emerald-600 to-teal-500",
    },
    {
      title: "My Notes",
      description:
        "Organize and revisit your saved summaries.",
      icon: BookOpen,
      path: "/my-notes",
      gradient:
        "from-orange-500 to-red-500",
    },
    {
      title: "Analytics",
      description:
        "Understand your learning performance.",
      icon: TrendingUp,
      path: "/analytics",
      gradient:
        "from-indigo-600 to-blue-600",
    },
    {
      title: "Profile",
      description:
        "Manage your student profile and details.",
      icon: UserCircle2,
      path: "/profile",
      gradient:
        "from-cyan-600 to-teal-600",
    },
    {
      title: "Lessons",
      description:
        "Follow a structured learning journey.",
      icon: GraduationCap,
      path: "/lesson",
      gradient:
        "from-violet-600 to-indigo-600",
    },
    {
      title: "Settings",
      description:
        "Control your preferences and security.",
      icon: Settings,
      path: "/settings",
      gradient:
        "from-slate-700 to-slate-900",
    },
  ];

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div
        className="
          flex min-h-screen
          items-center justify-center
          bg-slate-950
          px-5
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
            w-full max-w-sm
            rounded-[2rem]
            border border-white/10
            bg-white/[0.06]
            p-8
            text-center
            shadow-2xl
            backdrop-blur-2xl
          "
        >
          <div
            className="
              mx-auto flex h-16 w-16
              items-center justify-center
              rounded-2xl
              bg-indigo-500/15
            "
          >
            <LoaderCircle
              size={30}
              className="
                animate-spin
                text-indigo-400
              "
            />
          </div>

          <h2
            className="
              mt-5
              text-xl font-bold
              text-white
            "
          >
            Preparing your workspace
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-400
            "
          >
            Loading your learning data...
          </p>
        </motion.div>
      </div>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <main
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#f6f8fc]
        px-4
        pb-16
        pt-[96px]
        text-slate-900
        sm:px-6
        lg:px-8
        xl:px-10
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]
          space-y-8
        "
      >

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {errorMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              flex items-center
              justify-between gap-4
              rounded-2xl
              border border-amber-200
              bg-amber-50
              px-4 py-3
              text-sm
              text-amber-800
            "
          >
            <span>
              {errorMessage}
            </span>

            <button
              onClick={() =>
                setErrorMessage("")
              }
              className="
                rounded-lg
                p-1
                transition
                hover:bg-amber-100
              "
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* =================================================
            HERO
        ================================================= */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{
            duration: 0.55,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-slate-950
            text-white
            shadow-2xl
            sm:rounded-[2.25rem]
          "
        >
          {/* Glow */}

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
              gap-8
              p-6
              sm:p-9
              lg:grid-cols-[minmax(0,1fr)_320px]
              lg:p-12
            "
          >
            {/* LEFT */}

            <div
              className="
                flex
                min-w-0
                flex-col
                justify-center
              "
            >
              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border border-white/10
                  bg-white/10
                  px-3.5 py-2
                  text-[11px]
                  font-bold
                  tracking-wide
                  text-indigo-200
                  backdrop-blur-xl
                  sm:text-xs
                "
              >
                <Sparkles size={15} />

                AI-POWERED LEARNING
              </div>

              <h1
                className="
                  mt-5
                  max-w-4xl
                  text-3xl
                  font-black
                  leading-[1.08]
                  tracking-tight
                  sm:text-4xl
                  md:text-5xl
                  lg:text-6xl
                "
              >
                Welcome back,{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-cyan-300
                    via-indigo-300
                    to-fuchsia-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  {userName}
                </span>{" "}
                👋
              </h1>

              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-300
                  sm:text-base
                  lg:text-lg
                "
              >
                Continue your learning journey,
                organize your notes, practice
                with AI and improve your
                knowledge every day.
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                "
              >
                <button
                  onClick={() =>
                    navigate("/summary")
                  }
                  className="
                    group
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-white
                    px-6
                    text-sm
                    font-extrabold
                    text-slate-950
                    shadow-xl
                    transition
                    hover:-translate-y-1
                    hover:shadow-2xl
                  "
                >
                  <Upload size={18} />

                  Upload Notes

                  <ArrowRight
                    size={16}
                    className="
                      transition
                      group-hover:translate-x-1
                    "
                  />
                </button>

                <button
                  onClick={() =>
                    navigate("/chat")
                  }
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border border-white/15
                    bg-white/10
                    px-6
                    text-sm
                    font-bold
                    text-white
                    backdrop-blur-xl
                    transition
                    hover:-translate-y-1
                    hover:bg-white/15
                  "
                >
                  <MessageCircle
                    size={18}
                  />

                  Ask AI Tutor
                </button>
              </div>
            </div>

            {/* RIGHT */}

            <div
              className="
                flex
                flex-col
                gap-3
              "
            >
              <div
                className="
                  rounded-3xl
                  border border-white/10
                  bg-white/10
                  p-5
                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      flex h-12 w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-orange-400/15
                    "
                  >
                    <Flame
                      size={23}
                      className="
                        text-orange-300
                      "
                    />
                  </div>

                  <span
                    className={`
                      rounded-full
                      px-3 py-1
                      text-[11px]
                      font-extrabold
                      tracking-wide
                      ${
                        statsData.learning_streak > 0
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-white/10 text-slate-300"
                      }
                    `}
                  >
                    {statsData.learning_streak > 0
                      ? "ACTIVE"
                      : "START TODAY"}
                  </span>
                </div>

                <p
                  className="
                    mt-6
                    text-xs
                    font-semibold
                    uppercase
                    tracking-widest
                    text-slate-400
                  "
                >
                  Current streak
                </p>

                <p
                  className="
                    mt-1
                    text-4xl
                    font-black
                  "
                >
                  {statsData.learning_streak}

                  <span
                    className="
                      ml-2
                      text-base
                      font-bold
                      text-slate-400
                    "
                  >
                    days
                  </span>
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-400
                  "
                >
                  {statsData.learning_streak > 0
                    ? "Keep the momentum going."
                    : "Complete a learning task today to start your streak."}
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/settings")
                }
                className="
                  inline-flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                <Settings size={18} />
                Settings
              </button>

              <button
                onClick={logout}
                className="
                  inline-flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-white
                  px-5
                  text-sm
                  font-extrabold
                  text-rose-600
                  transition
                  hover:-translate-y-0.5
                  hover:bg-rose-50
                "
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{
            delay: 0.08,
            duration: 0.5,
          }}
          className="
            rounded-3xl
            border border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* SEARCH INFO */}

            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex h-11 w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-50
                  "
                >
                  <Search
                    size={20}
                    className="
                      text-indigo-600
                    "
                  />
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
                    Knowledge library
                  </p>

                  <h2
                    className="
                      mt-0.5
                      text-xl
                      font-black
                    "
                  >
                    Search your notes
                  </h2>
                </div>
              </div>

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                "
              >
                Find uploaded notes by
                filename or summary.
              </p>
            </div>

            {/* SEARCH INPUT */}

            <div
              className="
                flex
                w-full
                flex-col
                gap-2
                sm:flex-row
                lg:max-w-2xl
              "
            >
              <div
                className="
                  relative
                  min-w-0
                  flex-1
                "
              >
                <Search
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      searchNotes();
                    }
                  }}
                  placeholder="
                    Search by filename or summary...
                  "
                  className="
                    h-12
                    w-full
                    rounded-2xl
                    border border-slate-200
                    bg-slate-50
                    pl-11
                    pr-11
                    text-sm
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-lg
                      p-1.5
                      text-slate-400
                      transition
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={searchNotes}
                disabled={searchLoading}
                className="
                  inline-flex
                  h-12
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-indigo-600
                  px-5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-indigo-700
                  hover:shadow-lg
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {searchLoading ? (
                  <LoaderCircle
                    size={17}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <Search size={17} />
                )}

                {searchLoading
                  ? "Searching..."
                  : "Search"}
              </button>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            SEARCH RESULTS
        ================================================= */}

        {hasSearched && search.trim() && !searchLoading && searchResults.length === 0 && (
          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              rounded-3xl
              border border-slate-200
              bg-white
              p-6
              text-center
              shadow-sm
            "
          >
            <div
              className="
                mx-auto flex h-14 w-14
                items-center justify-center
                rounded-2xl
                bg-slate-100
                text-slate-400
              "
            >
              <Search size={24} />
            </div>

            <h3 className="mt-4 text-lg font-black text-slate-800">
              No matching notes
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We could not find a note matching "{search.trim()}". Try another
              filename or keyword.
            </p>
          </motion.section>
        )}

        {hasSearched && searchResults.length > 0 && (
          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              rounded-3xl
              border border-indigo-100
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                mb-5
                flex
                items-end
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
                  Results
                </p>

                <h2
                  className="
                    mt-1
                    text-2xl
                    font-black
                  "
                >
                  Matching notes
                </h2>
              </div>

              <span
                className="
                  rounded-full
                  bg-indigo-50
                  px-3 py-1.5
                  text-xs
                  font-bold
                  text-indigo-600
                "
              >
                {searchResults.length} found
              </span>
            </div>

            <div
              className="
                grid
                gap-3
                lg:grid-cols-2
              "
            >
              {searchResults.map(
                (note, index) => (
                  <div
                    key={
                      note._id ||
                      note.id ||
                      `${note.filename}-${index}`
                    }
                    className="
                      flex
                      min-w-0
                      flex-col
                      gap-4
                      rounded-2xl
                      border border-slate-200
                      bg-slate-50
                      p-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex h-11 w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-indigo-100
                        "
                      >
                        <FileText
                          size={20}
                          className="
                            text-indigo-600
                          "
                        />
                      </div>

                      <div
                        className="
                          min-w-0
                        "
                      >
                        <h3
                          className="
                            break-words
                            text-sm
                            font-bold
                          "
                        >
                          {note.filename ||
                            "Untitled Note"}
                        </h3>

                        <p
                          className="
                            mt-1
                            line-clamp-2
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >
                          {note.summary ||
                            "No summary available."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          "/my-notes"
                        )
                      }
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-indigo-600
                        px-4 py-2.5
                        text-sm
                        font-bold
                        text-white
                        transition
                        hover:bg-indigo-700
                      "
                    >
                      Open

                      <ArrowRight
                        size={16}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          </motion.section>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section>
          <SectionHeading
            eyebrow="Overview"
            title="Your learning at a glance"
            description="
              Live activity from your StudyMind workspace
            "
          />

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              xl:grid-cols-5
            "
          >
            {stats.map(
              (item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{
                      delay:
                        index * 0.06,
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    className="
                      group
                      overflow-hidden
                      rounded-3xl
                      border border-slate-200
                      bg-white
                      shadow-sm
                      transition
                      hover:shadow-xl
                    "
                  >
                    <div
                      className={`
                        h-1.5
                        bg-gradient-to-r
                        ${item.accent}
                      `}
                    />

                    <div
                      className="
                        flex
                        min-h-[168px]
                        flex-col
                        p-5
                        sm:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <div
                          className={`
                            flex h-12 w-12
                            items-center
                            justify-center
                            rounded-2xl
                            ${item.iconBg}
                            ${item.iconColor}
                          `}
                        >
                          <Icon size={21} />
                        </div>

                        <CheckCircle2
                          size={18}
                          className="
                            text-emerald-500
                          "
                        />
                      </div>

                      <div
                        className="
                          mt-auto
                          pt-5
                        "
                      >
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-500
                          "
                        >
                          {item.label}
                        </p>

                        <p
                          className="
                            mt-1
                            text-3xl
                            font-black
                            tracking-tight
                          "
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            FAVORITES
        ================================================= */}

        <section>
          <div
            className="
              rounded-3xl
              border border-slate-200
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                mb-5
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex h-12 w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-amber-50
                  "
                >
                  <Star
                    size={21}
                    className="
                      fill-amber-400
                      text-amber-500
                    "
                  />
                </div>

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
                    Saved knowledge
                  </p>

                  <h2
                    className="
                      mt-1
                      text-2xl
                      font-black
                    "
                  >
                    Favorite notes
                  </h2>
                </div>
              </div>

              <span
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  bg-amber-50
                  px-3 py-1.5
                  text-sm
                  font-bold
                  text-amber-700
                "
              >
                <Star size={14} />

                {favorites.length} saved
              </span>
            </div>

            {favorites.length === 0 ? (
              <EmptyState
                icon={
                  <Star size={28} />
                }
                title="
                  No favorite notes yet
                "
                description="
                  Save important notes to access them quickly.
                "
              />
            ) : (
              <div
                className="
                  grid
                  gap-4
                  lg:grid-cols-2
                "
              >
                {favorites
                  .slice(0, 4)
                  .map(
                    (
                      note,
                      index
                    ) => (
                      <motion.div
                        key={
                          note._id ||
                          note.id ||
                          `${note.filename}-${index}`
                        }
                        whileHover={{
                          y: -2,
                        }}
                        className="
                          flex
                          min-h-[82px]
                          items-center
                          justify-between
                          gap-4
                          rounded-2xl
                          border border-amber-100
                          bg-gradient-to-r
                          from-amber-50
                          to-white
                          p-4
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
                            className="
                              flex h-11 w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-amber-100
                            "
                          >
                            <FileText
                              size={19}
                              className="
                                text-amber-600
                              "
                            />
                          </div>

                          <div
                            className="
                              min-w-0
                            "
                          >
                            <h3
                              className="
                                truncate
                                text-sm
                                font-bold
                              "
                            >
                              {note.filename ||
                                "Untitled Note"}
                            </h3>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-500
                              "
                            >
                              Saved for quick access
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              "/my-notes"
                            )
                          }
                          className="
                            flex h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-amber-500
                            text-white
                            transition
                            hover:bg-amber-600
                          "
                          aria-label="
                            Open favorite notes
                          "
                        >
                          <ChevronRight
                            size={18}
                          />
                        </button>
                      </motion.div>
                    )
                  )}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            TOOLS
        ================================================= */}

        <section>
          <SectionHeading
            eyebrow="AI Learning Tools"
            title="Everything you need"
            description="
              Powerful tools designed around your study workflow
            "
          />

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {tools.map(
              (tool, index) => {
                const Icon = tool.icon;

                return (
                  <motion.button
                    key={tool.title}
                    onClick={() =>
                      navigate(
                        tool.path
                      )
                    }
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{
                      delay:
                        index * 0.04,
                    }}
                    whileHover={{
                      y: -6,
                    }}
                    className="
                      group
                      overflow-hidden
                      rounded-3xl
                      border border-slate-200
                      bg-white
                      text-left
                      shadow-sm
                      transition
                      hover:shadow-xl
                    "
                  >
                    <div
                      className={`
                        h-1.5
                        bg-gradient-to-r
                        ${tool.gradient}
                      `}
                    />

                    <div
                      className="
                        flex
                        min-h-[210px]
                        flex-col
                        p-5
                        sm:p-6
                      "
                    >
                      <div
                        className={`
                          flex h-12 w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-r
                          ${tool.gradient}
                          text-white
                          shadow-lg
                          transition
                          group-hover:scale-105
                        `}
                      >
                        <Icon size={22} />
                      </div>

                      <h3
                        className="
                          mt-5
                          text-lg
                          font-black
                        "
                      >
                        {tool.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          text-sm
                          leading-6
                          text-slate-500
                        "
                      >
                        {tool.description}
                      </p>

                      <div
                        className="
                          mt-auto
                          flex
                          items-center
                          justify-between
                          gap-3
                          pt-6
                        "
                      >
                        <span
                          className="
                            text-sm
                            font-bold
                            text-indigo-600
                          "
                        >
                          Open feature
                        </span>

                        <span
                          className="
                            flex h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-50
                            transition
                            group-hover:bg-indigo-600
                          "
                        >
                          <ArrowRight
                            size={17}
                            className="
                              text-indigo-600
                              transition
                              group-hover:text-white
                            "
                          />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            PERFORMANCE + ACTIVITY
        ================================================= */}

        <section
          className="
            grid
            gap-5
            xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]
          "
        >
          {/* PERFORMANCE */}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="
              rounded-3xl
              border border-slate-200
              bg-white
              p-6
              shadow-sm
              sm:p-8
            "
          >
            <div
              className="
                flex
                items-start
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
                  Performance
                </p>

                <h2
                  className="
                    mt-1
                    text-2xl
                    font-black
                    sm:text-3xl
                  "
                >
                  Learning progress
                </h2>

                <p
                  className="
                    mt-2
                    max-w-xl
                    text-sm
                    text-slate-500
                  "
                >
                  A quick view of your
                  overall learning activity.
                </p>
              </div>

              <div
                className="
                  flex h-11 w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                "
              >
                <TrendingUp
                  size={21}
                  className="
                    text-emerald-600
                  "
                />
              </div>
            </div>

            {/* PROGRESS */}

            <div className="mt-8">
              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Overall progress
                </span>

                <span
                  className="
                    text-sm
                    font-black
                    text-indigo-600
                  "
                >
                  {overallProgress}%
                </span>
              </div>

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
                    width: `${overallProgress}%`,
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
            </div>

            {/* METRICS */}

            <div
              className="
                mt-8
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <Metric
                icon={
                  <FileText size={19} />
                }
                value={
                  statsData.notes_uploaded
                }
                label="Notes"
                className="
                  border-blue-100
                  bg-blue-50
                  text-blue-600
                "
              />

              <Metric
                icon={
                  <Brain size={19} />
                }
                value={
                  statsData.quizzes_completed
                }
                label="Quizzes"
                className="
                  border-violet-100
                  bg-violet-50
                  text-violet-600
                "
              />

              <Metric
                icon={
                  <MessageCircle
                    size={19}
                  />
                }
                value={
                  statsData.ai_conversations
                }
                label="AI Chats"
                className="
                  border-emerald-100
                  bg-emerald-50
                  text-emerald-600
                "
              />

              <Metric
                icon={
                  <Sparkles size={19} />
                }
                value={
                  statsData.summaries_created
                }
                label="Summaries"
                className="
                  border-cyan-100
                  bg-cyan-50
                  text-cyan-600
                "
              />
            </div>
          </motion.div>

          {/* ACTIVITY */}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{
              delay: 0.08,
            }}
            className="
              rounded-3xl
              bg-slate-950
              p-6
              text-white
              shadow-xl
              sm:p-7
            "
          >
            <div
              className="
                mb-6
                flex
                items-center
                justify-between
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    text-indigo-300
                  "
                >
                  Activity
                </p>

                <h2
                  className="
                    mt-1
                    text-2xl
                    font-black
                  "
                >
                  Recent activity
                </h2>
              </div>

              <div
                className="
                  flex h-10 w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                "
              >
                <Clock3 size={18} />
              </div>
            </div>

            {activities.length === 0 ? (
              <div
                className="
                  flex
                  min-h-[260px]
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >
                <div
                  className="
                    flex h-14 w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/10
                  "
                >
                  <Clock3
                    size={24}
                    className="
                      text-white/50
                    "
                  />
                </div>

                <p
                  className="
                    mt-4
                    font-bold
                  "
                >
                  No activity yet
                </p>

                <p
                  className="
                    mt-2
                    max-w-xs
                    text-xs
                    leading-5
                    text-white/45
                  "
                >
                  Your recent learning
                  activity will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities
                  .slice(0, 6)
                  .map(
                    (
                      activity,
                      index
                    ) => (
                      <motion.div
                        key={
                          activity._id ||
                          activity.id ||
                          `activity-${index}`
                        }
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.05,
                        }}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-white/5
                          bg-white/[0.06]
                          p-3
                        "
                      >
                        <div
                          className="
                            flex h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-white/10
                          "
                        >
                          {activity.type ===
                          "quiz" ? (
                            <Brain size={17} />
                          ) : activity.type ===
                              "summary" ||
                            activity.type ===
                              "note" ? (
                            <FileText
                              size={17}
                            />
                          ) : (
                            <MessageCircle
                              size={17}
                            />
                          )}
                        </div>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <h3
                            className="
                              truncate
                              text-sm
                              font-semibold
                            "
                          >
                            {activity.title ||
                              "Learning Activity"}
                          </h3>

                          <p
                            className="
                              mt-1
                              text-[11px]
                              text-white/40
                            "
                          >
                            {formatActivityDate(
                              activity
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )
                  )}
              </div>
            )}
          </motion.div>
        </section>

        {/* =================================================
            INSIGHTS
        ================================================= */}

        <section
          className="
            grid
            gap-5
            md:grid-cols-3
          "
        >
          <Insight
            icon={
              <Target size={20} />
            }
            iconBg="
              bg-indigo-50
              text-indigo-600
            "
            title="Daily goal"
            description="
              Complete 2 AI tasks today.
            "
          >
            <div
              className="
                mt-5
                h-2
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
                  width: `${dailyGoalProgress}%`,
                }}
                transition={{
                  duration: 0.9,
                }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                "
              />
            </div>

            <div
              className="
                mt-2
                flex
                justify-between
                text-xs
              "
            >
              <span
                className="
                  text-slate-500
                "
              >
                Today
              </span>

              <span
                className="
                  font-bold
                  text-indigo-600
                "
              >
                {Math.min(todayTaskCount, dailyGoalTarget)} / {dailyGoalTarget} tasks
              </span>
            </div>
          </Insight>

          <Insight
            icon={
              <BookOpen size={20} />
            }
            iconBg="
              bg-violet-50
              text-violet-600
            "
            title="Study hours"
            description="
              Weekly learning time
            "
          >
            <div
              className="
                mt-5
                flex
                items-end
                gap-2
              "
            >
              <span
                className="
                  text-4xl
                  font-black
                  text-violet-600
                "
              >
                {statsData.study_hours}
              </span>

              <span
                className="
                  mb-1
                  text-sm
                  font-semibold
                  text-slate-500
                "
              >
                hours
              </span>
            </div>
          </Insight>

          <Insight
            icon={
              <Trophy size={20} />
            }
            iconBg="
              bg-amber-50
              text-amber-600
            "
            title="Achievement"
            description="
              Keep learning to unlock badges.
            "
          >
            <div
              className="
                mt-5
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  flex h-12 w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-amber-50
                  text-2xl
                "
              >
                🏆
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                  "
                >
                  Keep going!
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Your next badge is waiting.
                </p>
              </div>
            </div>
          </Insight>
        </section>

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
              className="
                text-indigo-500
              "
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
// SECTION HEADING
// =====================================================

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div
      className="
        mb-5
        flex
        flex-col
        gap-2
        sm:flex-row
        sm:items-end
        sm:justify-between
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
          {eyebrow}
        </p>

        <h2
          className="
            mt-1
            text-2xl
            font-black
            sm:text-3xl
          "
        >
          {title}
        </h2>
      </div>

      <p
        className="
          max-w-md
          text-sm
          text-slate-500
          sm:text-right
        "
      >
        {description}
      </p>
    </div>
  );
}

// =====================================================
// METRIC
// =====================================================

function Metric({
  icon,
  value,
  label,
  className,
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        ${className}
      `}
    >
      {icon}

      <p
        className="
          mt-3
          text-3xl
          font-black
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-semibold
          opacity-70
        "
      >
        {label}
      </p>
    </div>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-dashed
        border-slate-200
        bg-slate-50
        px-5
        py-10
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex h-14 w-14
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-slate-300
          shadow-sm
        "
      >
        {icon}
      </div>

      <h3
        className="
          mt-3
          font-bold
          text-slate-700
        "
      >
        {title}
      </h3>

      <p
        className="
          mx-auto
          mt-1
          max-w-md
          text-sm
          leading-6
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}

// =====================================================
// INSIGHT
// =====================================================

function Insight({
  icon,
  iconBg,
  title,
  description,
  children,
}) {
  return (
    <div
      className="
        min-h-[210px]
        rounded-3xl
        border border-slate-200
        bg-white
        p-6
        shadow-sm
        transition
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div
        className={`
          flex h-11 w-11
          items-center
          justify-center
          rounded-xl
          ${iconBg}
        `}
      >
        {icon}
      </div>

      <h3
        className="
          mt-5
          text-xl
          font-black
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-slate-500
        "
      >
        {description}
      </p>

      {children}
    </div>
  );
}

export default Dashboard;