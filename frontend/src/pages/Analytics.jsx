import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  Heart,
  Loader2,
  MessageCircle,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  Activity,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import API from "../axios";


function Analytics() {

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  const [data, setData] = useState({

    total_notes: 0,

    total_quizzes: 0,

    total_chats: 0,

    favorite_notes: 0,

    learning_streak: 0,

    learning_progress: 0,

    quiz_accuracy: 0,

    average_quiz_score: 0,

    best_quiz_score: 0,

    recent_quizzes: [],

    last_activity: null,

    achievements: [],

    unlocked_achievements: 0,

    total_achievements: 0,

    last_updated: "",

  });


  const [weeklyData, setWeeklyData] = useState([]);


  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    const token = localStorage.getItem(
      "token"
    );


    if (!user?.email || !token) {

      setError(
        "Login required"
      );

      setLoading(false);

      return;
    }


    const loadAnalytics = async () => {

      try {

        setLoading(true);

        setError("");


        const headers = {

          Authorization:
            `Bearer ${token}`,

        };


        const [
          analyticsResponse,
          weeklyResponse,
        ] = await Promise.all([

          API.get(
            `/analytics/${encodeURIComponent(
              user.email
            )}`,
            {
              headers,
            }
          ),

          API.get(
            `/analytics/weekly/${encodeURIComponent(
              user.email
            )}`,
            {
              headers,
            }
          ),

        ]);


        // =================================================
        // MAIN ANALYTICS
        // =================================================

        const analytics =
          analyticsResponse.data?.analytics;


        if (analytics) {

          setData(
            analytics
          );

        } else {

          setData(
            {
              total_notes: 0,
              total_quizzes: 0,
              total_chats: 0,
              favorite_notes: 0,
              learning_streak: 0,
              learning_progress: 0,
              quiz_accuracy: 0,
              average_quiz_score: 0,
              best_quiz_score: 0,
              recent_quizzes: [],
              last_activity: null,
              achievements: [],
              unlocked_achievements: 0,
              total_achievements: 0,
              last_updated: "",
            }
          );

        }


        // =================================================
        // WEEKLY
        // =================================================

        setWeeklyData(

          weeklyResponse.data?.weekly
          || analyticsResponse.data?.weekly
          || []

        );

      }

      catch (err) {

        console.error(
          "Analytics Error:",
          err
        );


        const message =
          err.response?.data?.detail
          || "Unable to load analytics.";


        setError(
          message
        );

      }

      finally {

        setLoading(false);

      }

    };


    loadAnalytics();

  }, []);


  // =====================================================
  // WEEKLY TOTAL
  // =====================================================

  const weeklyTotal = useMemo(() => {

    return weeklyData.reduce(

      (sum, item) =>
        sum +
        Number(
          item.study || 0
        ),

      0

    );

  }, [weeklyData]);


  // =====================================================
  // WEEKLY AVERAGE
  // =====================================================

  const weeklyAverage = useMemo(() => {

    if (!weeklyData.length) {

      return 0;

    }


    return Math.round(

      weeklyTotal
      /
      weeklyData.length

    );

  }, [
    weeklyData,
    weeklyTotal,
  ]);


  // =====================================================
  // LAST ACTIVITY
  // =====================================================

  const formattedLastActivity =
    useMemo(() => {

      if (
        !data.last_activity?.timestamp
      ) {

        return "No activity yet";

      }


      try {

        return new Date(
          data.last_activity.timestamp
        ).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

      }

      catch {

        return "Recently";

      }

    }, [
      data.last_activity,
    ]);


  // =====================================================
  // STATS
  // =====================================================

  const stats = [

    {
      title: "Notes",
      value: data.total_notes,
      subtitle: "Study materials",
      icon: FileText,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },

    {
      title: "Quizzes",
      value: data.total_quizzes,
      subtitle: "Completed assessments",
      icon: Brain,
      bg: "bg-violet-50",
      text: "text-violet-600",
    },

    {
      title: "AI Chats",
      value: data.total_chats,
      subtitle: "AI interactions",
      icon: MessageCircle,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },

    {
      title: "Favorites",
      value: data.favorite_notes,
      subtitle: "Saved knowledge",
      icon: Heart,
      bg: "bg-rose-50",
      text: "text-rose-600",
    },

  ];


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">

        <div className="flex min-h-screen items-center justify-center px-6">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="text-center"
          >

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl">

              <Loader2
                size={34}
                className="animate-spin"
              />

            </div>


            <h2 className="mt-6 text-2xl font-extrabold text-slate-900">

              Loading your analytics

            </h2>


            <p className="mt-2 text-sm text-slate-500">

              Analysing your learning activity...

            </p>

          </motion.div>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">

        <div className="flex min-h-screen items-center justify-center px-6">

          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">

              <Activity size={28} />

            </div>


            <h2 className="mt-5 text-2xl font-extrabold text-slate-900">

              Analytics unavailable

            </h2>


            <p className="mt-2 text-sm text-slate-500">

              {error}

            </p>


            <div className="mt-6 flex flex-col gap-3">

              <button
                onClick={() =>
                  window.location.reload()
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700"
              >

                Try Again

              </button>


              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
              >

                <ArrowLeft size={17} />

                Back to Dashboard

              </button>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">


        {/* =================================================
            BACK
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-7"
        >

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md"
          >

            <ArrowLeft size={17} />

            Back to Dashboard

          </button>

        </motion.div>


        {/* =================================================
            HERO
        ================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: -25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 p-6 text-white shadow-2xl sm:p-9 lg:p-10"
        >

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-20 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl" />


          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md">

                <BarChart3 size={15} />

                AI-POWERED LEARNING ANALYTICS

              </div>


              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">

                Your Learning

                <span className="block text-indigo-200">

                  Performance Hub

                </span>

              </h1>


              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">

                Understand your study habits, track your progress,
                measure quiz performance and build stronger learning
                consistency.

              </p>

            </div>


            {/* STREAK */}

            <motion.div
              whileHover={{
                scale: 1.03,
              }}
              className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">

                    Current Streak

                  </p>


                  <p className="mt-2 text-4xl font-black">

                    {data.learning_streak}

                  </p>


                  <p className="mt-1 text-sm text-white/60">

                    consecutive days

                  </p>

                </div>


                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-400/20">

                  <Flame
                    size={34}
                    className="text-orange-300"
                  />

                </div>

              </div>


              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${Math.min(
                      data.learning_streak * 10,
                      100
                    )}%`,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-300 to-yellow-200"
                />

              </div>

            </motion.div>

          </div>

        </motion.section>


        {/* =================================================
            STAT CARDS
        ================================================== */}

        <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map(
            (item, index) => {

              const Icon =
                item.icon;

              return (

                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.08,
                  }}
                  whileHover={{
                    y: -6,
                  }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl"
                >

                  <div className="flex items-start justify-between">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.text}`}
                    >

                      <Icon size={23} />

                    </div>


                    <TrendingUp
                      size={18}
                      className="text-emerald-500"
                    />

                  </div>


                  <p className="mt-5 text-sm font-semibold text-slate-500">

                    {item.title}

                  </p>


                  <h2 className="mt-1 text-3xl font-black text-slate-900">

                    {item.value}

                  </h2>


                  <p className="mt-1 text-xs text-slate-400">

                    {item.subtitle}

                  </p>

                </motion.div>

              );

            }
          )}

        </section>


        {/* =================================================
            PROGRESS + QUIZ
        ================================================== */}

        <section className="mt-7 grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">


          {/* PROGRESS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >

            <div className="flex flex-wrap items-start justify-between gap-5">

              <div>

                <div className="flex items-center gap-2">

                  <Target
                    size={21}
                    className="text-indigo-600"
                  />

                  <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">

                    Overall Progress

                  </p>

                </div>


                <h2 className="mt-2 text-2xl font-black text-slate-900">

                  Keep building your learning momentum

                </h2>


                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">

                  Your progress combines notes, quizzes, AI conversations,
                  learning consistency and quiz accuracy.

                </p>

              </div>


              <div className="text-right">

                <p className="text-4xl font-black text-indigo-600">

                  {data.learning_progress}%

                </p>

                <p className="text-xs font-semibold text-slate-400">

                  learning score

                </p>

              </div>

            </div>


            <div className="mt-8 h-4 overflow-hidden rounded-full bg-slate-100">

              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(
                    Number(
                      data.learning_progress
                    ) || 0,
                    100
                  )}%`,
                }}
                transition={{
                  duration: 1.1,
                }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600"
              />

            </div>


            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-xs text-slate-400">
                  Notes
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {data.total_notes}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-xs text-slate-400">
                  Quizzes
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {data.total_quizzes}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-xs text-slate-400">
                  AI Chats
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {data.total_chats}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-xs text-slate-400">
                  Streak
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {data.learning_streak}d
                </p>

              </div>

            </div>

          </motion.div>


          {/* QUIZ PERFORMANCE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                <Brain size={22} />

              </div>


              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">

                  Quiz Intelligence

                </p>

                <h2 className="text-xl font-black text-slate-900">

                  Performance

                </h2>

              </div>

            </div>


            <div className="mt-7 grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-violet-50 p-5">

                <p className="text-xs font-semibold text-violet-500">
                  Accuracy
                </p>

                <p className="mt-2 text-3xl font-black text-violet-700">
                  {data.quiz_accuracy}%
                </p>

              </div>


              <div className="rounded-2xl bg-emerald-50 p-5">

                <p className="text-xs font-semibold text-emerald-500">
                  Average
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-700">
                  {data.average_quiz_score}%
                </p>

              </div>


              <div className="rounded-2xl bg-amber-50 p-5">

                <p className="text-xs font-semibold text-amber-500">
                  Best Score
                </p>

                <p className="mt-2 text-3xl font-black text-amber-700">
                  {data.best_quiz_score}%
                </p>

              </div>


              <div className="rounded-2xl bg-blue-50 p-5">

                <p className="text-xs font-semibold text-blue-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-black text-blue-700">
                  {data.total_quizzes}
                </p>

              </div>

            </div>

          </motion.div>

        </section>


        {/* =================================================
            WEEKLY ACTIVITY
        ================================================== */}

        <section className="mt-7 grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">


          {/* CHART */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">

                  Weekly Activity

                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">

                  Your last 7 days

                </h2>

              </div>


              <div className="rounded-xl bg-indigo-50 px-4 py-2 text-right">

                <p className="text-xs text-indigo-500">
                  Total activity
                </p>

                <p className="font-black text-indigo-700">
                  {weeklyTotal}
                </p>

              </div>

            </div>


            <div className="mt-7 h-[320px]">

              {weeklyData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={weeklyData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="notes"
                      stackId="activity"
                      fill="#6366f1"
                    />

                    <Bar
                      dataKey="quizzes"
                      stackId="activity"
                      fill="#8b5cf6"
                    />

                    <Bar
                      dataKey="chats"
                      stackId="activity"
                      fill="#10b981"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">

                  No weekly activity yet.

                </div>

              )}

            </div>


            <div className="mt-5 flex flex-wrap gap-5 text-xs font-semibold text-slate-500">

              <span className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />

                Notes

              </span>


              <span className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />

                Quizzes

              </span>


              <span className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                AI Chats

              </span>

            </div>

          </motion.div>


          {/* WEEKLY SUMMARY */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8"
          >

            <div className="flex h-full flex-col">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">

                <Activity size={23} />

              </div>


              <p className="mt-7 text-xs font-bold uppercase tracking-wider text-white/40">

                Weekly Summary

              </p>


              <h2 className="mt-2 text-3xl font-black">

                {weeklyAverage}

              </h2>


              <p className="mt-1 text-sm text-white/50">

                average activities / day

              </p>


              <div className="mt-8 space-y-4">

                <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">

                  <span className="text-sm text-white/60">
                    Weekly activity
                  </span>

                  <span className="font-black">
                    {weeklyTotal}
                  </span>

                </div>


                <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">

                  <span className="text-sm text-white/60">
                    Current streak
                  </span>

                  <span className="font-black">
                    {data.learning_streak} days
                  </span>

                </div>


                <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">

                  <span className="text-sm text-white/60">
                    Progress
                  </span>

                  <span className="font-black">
                    {data.learning_progress}%
                  </span>

                </div>

              </div>


              <div className="mt-auto pt-8">

                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">

                  <Zap size={17} />

                  Keep your momentum alive

                </div>

              </div>

            </div>

          </motion.div>

        </section>


        {/* =================================================
            LEARNING TREND
        ================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-purple-600">

                Learning Trend

              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">

                Activity growth

              </h2>

            </div>


            <TrendingUp
              size={25}
              className="text-emerald-500"
            />

          </div>


          <div className="mt-7 h-[320px]">

            {weeklyData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={weeklyData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="study"
                    stroke="#7c3aed"
                    strokeWidth={4}
                    dot={{
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-full items-center justify-center text-sm text-slate-400">

                No learning trend available.

              </div>

            )}

          </div>

        </motion.section>


        {/* =================================================
            RECENT QUIZZES
        ================================================== */}

        <section className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">


          {/* QUIZ HISTORY */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">

                  Assessment History

                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">

                  Recent quizzes

                </h2>

              </div>


              <Brain
                size={25}
                className="text-indigo-600"
              />

            </div>


            <div className="mt-6 space-y-3">

              {data.recent_quizzes?.length > 0 ? (

                data.recent_quizzes.map(
                  (quiz, index) => (

                    <motion.div
                      key={`${
                        quiz.title || "quiz"
                      }-${index}`}
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">

                        <CheckCircle2
                          size={19}
                        />

                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-bold text-slate-800">

                          {quiz.title ||
                            "AI Quiz"}

                        </p>


                        <p className="mt-1 text-xs text-slate-400">

                          {quiz.score || 0}
                          /
                          {quiz.total ||
                            quiz.total_questions ||
                            0}
                          {" "}correct

                        </p>

                      </div>


                      <div className="text-right">

                        <p className="font-black text-indigo-600">

                          {quiz.percentage || 0}%

                        </p>


                        <p className="text-[10px] text-slate-400">

                          Score

                        </p>

                      </div>

                    </motion.div>

                  )
                )

              ) : (

                <div className="rounded-2xl bg-slate-50 p-8 text-center">

                  <Brain
                    size={28}
                    className="mx-auto text-slate-300"
                  />


                  <p className="mt-3 text-sm font-semibold text-slate-500">

                    No completed quizzes yet.

                  </p>


                  <button
                    onClick={() =>
                      navigate("/quiz")
                    }
                    className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
                  >

                    Take Your First Quiz

                  </button>

                </div>

              )}

            </div>

          </motion.div>


          {/* LAST ACTIVITY */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <Clock3 size={22} />

              </div>


              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">

                  Activity

                </p>

                <h2 className="text-xl font-black text-slate-900">

                  Last Learning Activity

                </h2>

              </div>

            </div>


            <div className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">

                Latest action

              </p>


              <h3 className="mt-3 text-2xl font-black capitalize text-slate-900">

                {data.last_activity?.type ||
                  "No activity"}

              </h3>


              <p className="mt-2 text-sm text-slate-500">

                {formattedLastActivity}

              </p>

            </div>


            <div className="mt-5 grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-slate-100 p-4">

                <p className="text-xs text-slate-400">
                  Saved notes
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">

                  {data.favorite_notes}

                </p>

              </div>


              <div className="rounded-2xl border border-slate-100 p-4">

                <p className="text-xs text-slate-400">
                  AI interactions
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">

                  {data.total_chats}

                </p>

              </div>

            </div>

          </motion.div>

        </section>


        {/* =================================================
            ACHIEVEMENTS
        ================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

                <Trophy size={22} />

              </div>


              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">

                  Milestones

                </p>

                <h2 className="text-2xl font-black text-slate-900">

                  Achievements

                </h2>

              </div>

            </div>


            <div className="rounded-xl bg-amber-50 px-4 py-2">

              <span className="text-sm font-black text-amber-700">

                {data.unlocked_achievements || 0}

                {" / "}

                {data.total_achievements || 0}

                {" unlocked"}

              </span>

            </div>

          </div>


          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {data.achievements?.map(
              (achievement, index) => (

                <motion.div
                  key={
                    achievement.id ||
                    index
                  }
                  whileHover={{
                    y: -4,
                  }}
                  className={`rounded-2xl border p-5 ${
                    achievement.unlocked
                      ? "border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="text-3xl">

                      {achievement.icon}

                    </div>


                    {achievement.unlocked ? (

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

                        <CheckCircle2
                          size={17}
                        />

                      </div>

                    ) : (

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-400">

                        <Award
                          size={17}
                        />

                      </div>

                    )}

                  </div>


                  <h3 className="mt-5 font-black text-slate-900">

                    {achievement.title}

                  </h3>


                  <p className="mt-1 text-xs leading-5 text-slate-500">

                    {achievement.description}

                  </p>


                  <div className="mt-4">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                        achievement.unlocked
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >

                      {achievement.unlocked
                        ? "UNLOCKED"
                        : "LOCKED"}

                    </span>

                  </div>

                </motion.div>

              )
            )}

          </div>

        </motion.section>


        {/* =================================================
            FOOTER
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="mt-7 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

              <Clock3 size={21} />

            </div>


            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">

                Analytics updated

              </p>


              <p className="mt-1 text-sm font-bold text-slate-800">

                {data.last_updated ||
                  "Just now"}

              </p>

            </div>

          </div>


          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">

            <Flame size={18} />

            Keep learning. Keep growing.

          </div>

        </motion.div>

      </main>

    </div>

  );

}


export default Analytics;