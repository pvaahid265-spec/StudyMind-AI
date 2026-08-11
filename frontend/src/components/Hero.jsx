import { Link } from "react-router-dom";
import {
  Sparkles,
  Brain,
  FileText,
  MessageCircle,
  BarChart3,
  ArrowRight,
  Play,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

function Hero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 24,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-slate-50 pt-28 sm:pt-32 lg:pt-36">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-100/30 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

      </div>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">

        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">

          {/* =================================================
              LEFT CONTENT
          ================================================== */}

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >

            {/* Badge */}

            <motion.div variants={item}>
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-indigo-200/80
                  bg-white/80
                  px-4 py-2
                  text-xs font-bold
                  text-indigo-700
                  shadow-sm
                  backdrop-blur-md
                  sm:text-sm
                "
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600" />
                </span>

                <Sparkles size={16} />

                AI-Powered Learning Platform

                <span className="hidden h-4 w-px bg-indigo-200 sm:block" />

                <span className="hidden text-indigo-500 sm:block">
                  Built for smarter learning
                </span>
              </div>
            </motion.div>

            {/* Heading */}

            <motion.div variants={item}>
              <h1
                className="
                  mt-7
                  text-4xl
                  font-black
                  leading-[1.05]
                  tracking-[-0.04em]
                  text-slate-950
                  sm:text-5xl
                  md:text-6xl
                  lg:text-[4.35rem]
                  xl:text-[4.7rem]
                "
              >
                Learn smarter.

                <br />

                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Grow faster.
                </span>
              </h1>
            </motion.div>

            {/* Description */}

            <motion.p
              variants={item}
              className="
                mt-6
                max-w-xl
                text-base
                leading-7
                text-slate-600
                sm:text-lg
                sm:leading-8
              "
            >
              Transform your study material into intelligent summaries,
              personalized quizzes and instant AI explanations — all in one
              powerful learning platform.
            </motion.p>

            {/* CTA */}

            <motion.div
              variants={item}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >

              <Link
                to="/register"
                className="
                  group
                  inline-flex
                  min-h-[52px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-indigo-500/20
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:shadow-indigo-500/30
                  sm:px-7
                "
              >
                Start Learning

                <ArrowRight
                  size={18}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <Link
                to="/chat"
                className="
                  group
                  inline-flex
                  min-h-[52px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white/80
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-indigo-200
                  hover:text-indigo-600
                  hover:shadow-md
                  sm:px-7
                "
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Play size={13} fill="currentColor" />
                </span>

                Try AI Tutor
              </Link>

            </motion.div>

            {/* Trust Points */}

            <motion.div
              variants={item}
              className="
                mt-7
                flex
                flex-wrap
                gap-x-5
                gap-y-2
                text-xs
                font-medium
                text-slate-500
                sm:text-sm
              "
            >

              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                AI-powered
              </span>

              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-500" />
                Secure
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Zap size={15} className="text-amber-500" />
                Instant answers
              </span>

            </motion.div>

            {/* Stats */}

            <motion.div
              variants={item}
              className="
                mt-10
                grid
                max-w-xl
                grid-cols-3
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white/80
                shadow-sm
                backdrop-blur
              "
            >

              <Stat
                value="10K+"
                label="Students"
              />

              <Stat
                value="50K+"
                label="Quizzes"
                border
              />

              <Stat
                value="24/7"
                label="AI Support"
              />

            </motion.div>

          </motion.div>

          {/* =================================================
              RIGHT PRODUCT PREVIEW
          ================================================== */}

          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: "easeOut",
            }}
            className="relative mx-auto w-full max-w-xl lg:ml-auto"
          >

            {/* Glow */}

            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-cyan-300/20 blur-2xl" />

            {/* Floating AI badge */}

            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -right-3
                -top-5
                z-20
                hidden
                items-center
                gap-2
                rounded-2xl
                border
                border-indigo-100
                bg-white
                px-4
                py-3
                shadow-xl
                sm:flex
              "
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles size={16} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  AI Status
                </p>

                <p className="text-xs font-bold text-slate-800">
                  Ready to learn
                </p>
              </div>
            </motion.div>

            {/* Main Dashboard */}

            <div
              className="
                relative
                overflow-hidden
                rounded-[2rem]
                border
                border-white
                bg-white
                p-4
                shadow-2xl
                shadow-indigo-900/10
                sm:p-6
              "
            >

              {/* Top bar */}

              <div className="flex items-center justify-between border-b border-slate-100 pb-5">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-indigo-600
                      to-purple-600
                      text-white
                      shadow-md
                    "
                  >
                    <Sparkles size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      StudyMind AI
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Intelligent Learning
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-[11px] font-bold text-emerald-600">
                    AI Online
                  </span>
                </div>

              </div>

              {/* Dashboard title */}

              <div className="mt-6 flex items-end justify-between">

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    YOUR LEARNING
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                    Learning Overview
                  </h2>
                </div>

                <TrendingUp
                  size={22}
                  className="text-indigo-500"
                />

              </div>

              {/* Feature cards */}

              <div className="mt-5 space-y-3">

                <DashboardItem
                  icon={<FileText size={19} />}
                  iconClass="bg-indigo-50 text-indigo-600"
                  title="Notes Analysis"
                  description="AI summarized your PDF"
                  status="Completed"
                  statusClass="text-emerald-600 bg-emerald-50"
                />

                <DashboardItem
                  icon={<Brain size={19} />}
                  iconClass="bg-violet-50 text-violet-600"
                  title="Smart Quiz"
                  description="20 questions generated"
                  status="Ready"
                  statusClass="text-violet-600 bg-violet-50"
                />

                <DashboardItem
                  icon={<MessageCircle size={19} />}
                  iconClass="bg-cyan-50 text-cyan-600"
                  title="AI Doubt Solver"
                  description="Ask anything from your notes"
                  status="Online"
                  statusClass="text-cyan-600 bg-cyan-50"
                />

              </div>

              {/* Progress */}

              <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <BarChart3 size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Learning Progress
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Keep your learning streak alive
                      </p>
                    </div>

                  </div>

                  <span className="text-lg font-extrabold text-indigo-300">
                    78%
                  </span>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{
                      duration: 1.2,
                      delay: 0.8,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400"
                  />

                </div>

              </div>

            </div>

            {/* Floating bottom card */}

            <motion.div
              animate={{
                y: [0, 7, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -bottom-5
                -left-4
                z-20
                hidden
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-100
                bg-white
                px-4
                py-3
                shadow-xl
                sm:flex
              "
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-400">
                  TODAY'S GOAL
                </p>

                <p className="text-xs font-bold text-slate-800">
                  2 AI tasks completed
                </p>
              </div>

            </motion.div>

          </motion.div>

        </div>

      </div>

      {/* Bottom fade */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />

    </section>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({ value, label, border = false }) {
  return (
    <div
      className={`
        px-4 py-4 text-center sm:px-6
        ${border ? "border-x border-slate-100" : ""}
      `}
    >
      <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-medium text-slate-400 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   DASHBOARD ITEM
========================================================= */

function DashboardItem({
  icon,
  iconClass,
  title,
  description,
  status,
  statusClass,
}) {
  return (
    <motion.div
      whileHover={{
        x: 4,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        group
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-100
        bg-slate-50/70
        p-3
        transition-colors
        duration-200
        hover:bg-white
        hover:shadow-sm
      "
    >

      <div
        className={`
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>

      </div>

      <span
        className={`
          hidden shrink-0
          rounded-lg
          px-2 py-1
          text-[10px]
          font-bold
          sm:inline-flex
          ${statusClass}
        `}
      >
        {status}
      </span>

    </motion.div>
  );
}

export default Hero;