import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  FileText,
  Flame,
  Loader,
  Search,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../axios";

function QuizHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // =====================================================
  // LOAD QUIZ HISTORY
  // =====================================================

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!savedUser?.email) {
      setLoading(false);
      return;
    }

    loadHistory(savedUser.email);
  }, []);

  const loadHistory = async (email) => {
    try {
      setLoading(true);

      const response = await API.get(
        `/quiz/history/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setHistory(
        Array.isArray(response.data?.history)
          ? response.data.history
          : []
      );
    } catch (error) {
      console.error("Quiz History Error:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER HISTORY
  // =====================================================

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return history.filter((quiz) => {
      const title = String(
        quiz.title || "AI Generated Quiz"
      ).toLowerCase();

      const searchMatch =
        !query || title.includes(query);

      if (!searchMatch) {
        return false;
      }

      const percentage = Number(
        quiz.percentage || 0
      );

      if (filter === "excellent") {
        return percentage >= 80;
      }

      if (filter === "good") {
        return percentage >= 60 && percentage < 80;
      }

      if (filter === "needs-practice") {
        return percentage < 60;
      }

      return true;
    });
  }, [history, search, filter]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    if (!history.length) {
      return {
        total: 0,
        average: 0,
        best: 0,
        passed: 0,
      };
    }

    const percentages = history.map(
      (quiz) => Number(quiz.percentage || 0)
    );

    const average =
      percentages.reduce(
        (sum, value) => sum + value,
        0
      ) / percentages.length;

    const best = Math.max(...percentages);

    const passed = percentages.filter(
      (value) => value >= 60
    ).length;

    return {
      total: history.length,
      average: Math.round(average),
      best: Math.round(best),
      passed,
    };
  }, [history]);

  // =====================================================
  // EMPTY / LOADING
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* =================================================
            BACK BUTTON
        ================================================== */}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-7"
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:border-indigo-200
              hover:text-indigo-600
              hover:shadow-md
            "
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </motion.div>

        {/* =================================================
            HERO
        ================================================== */}

        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-gradient-to-r
            from-indigo-600
            via-violet-600
            to-purple-700
            p-6
            text-white
            shadow-xl
            sm:p-8
            lg:p-10
          "
        >
          <div className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-64
            w-64
            rounded-full
            bg-white/10
            blur-3xl
          " />

          <div className="
            pointer-events-none
            absolute
            -bottom-28
            -left-20
            h-72
            w-72
            rounded-full
            bg-purple-300/10
            blur-3xl
          " />

          <div className="
            relative
            flex
            flex-col
            gap-6
            md:flex-row
            md:items-center
            md:justify-between
          ">
            <div className="flex items-center gap-5">
              <div className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-white/20
                bg-white/10
                backdrop-blur-md
                sm:h-20
                sm:w-20
              ">
                <Brain
                  size={34}
                  className="sm:h-10 sm:w-10"
                />
              </div>

              <div>
                <div className="
                  mb-1
                  flex
                  items-center
                  gap-2
                ">
                  <span className="text-sm font-medium text-white/70">
                    StudyMind AI
                  </span>

                  <span className="
                    h-1
                    w-1
                    rounded-full
                    bg-white/40
                  " />

                  <span className="text-sm text-white/60">
                    Learning Analytics
                  </span>
                </div>

                <h1 className="
                  text-3xl
                  font-extrabold
                  tracking-tight
                  sm:text-4xl
                  lg:text-5xl
                ">
                  Quiz History
                </h1>

                <p className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-white/75
                  sm:text-base
                ">
                  Track your quiz performance, scores,
                  and learning progress in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/quiz")}
              className="
                inline-flex
                min-h-[48px]
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/20
                bg-white/10
                px-5
                py-3
                text-sm
                font-bold
                text-white
                backdrop-blur
                transition
                hover:bg-white/20
              "
            >
              <Brain size={18} />
              Take New Quiz
            </button>
          </div>
        </motion.section>

        {/* =================================================
            STATS
        ================================================== */}

        <div className="
          mt-7
          grid
          grid-cols-2
          gap-4
          lg:grid-cols-4
        ">
          <StatsCard
            icon={<FileText size={21} />}
            title="Total Quizzes"
            value={stats.total}
            iconStyle="indigo"
          />

          <StatsCard
            icon={<BarChart3 size={21} />}
            title="Average Score"
            value={`${stats.average}%`}
            iconStyle="blue"
          />

          <StatsCard
            icon={<Trophy size={21} />}
            title="Best Score"
            value={`${stats.best}%`}
            iconStyle="yellow"
          />

          <StatsCard
            icon={<CheckCircle2 size={21} />}
            title="Passed"
            value={stats.passed}
            iconStyle="green"
          />
        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            mt-7
            rounded-3xl
            border
            border-gray-200
            bg-white
            p-4
            shadow-sm
            sm:p-5
          "
        >
          <div className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          ">
            <div className="relative w-full lg:max-w-xl">
              <Search
                size={20}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search quiz history..."
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  pl-11
                  pr-4
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-indigo-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />
            </div>

            <div className="
              flex
              w-full
              gap-2
              overflow-x-auto
              pb-1
              lg:w-auto
              lg:pb-0
            ">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </FilterButton>

              <FilterButton
                active={filter === "excellent"}
                onClick={() => setFilter("excellent")}
                activeClass="green"
              >
                80%+
              </FilterButton>

              <FilterButton
                active={filter === "good"}
                onClick={() => setFilter("good")}
                activeClass="blue"
              >
                60–79%
              </FilterButton>

              <FilterButton
                active={filter === "needs-practice"}
                onClick={() =>
                  setFilter("needs-practice")
                }
                activeClass="red"
              >
                Below 60%
              </FilterButton>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            SECTION TITLE
        ================================================== */}

        {!loading && (
          <div className="
            mt-7
            flex
            flex-col
            gap-1
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">
            <div>
              <h2 className="
                text-xl
                font-extrabold
                text-gray-900
              ">
                Completed Quizzes
              </h2>

              <p className="
                mt-1
                text-sm
                text-gray-500
              ">
                {filteredHistory.length}{" "}
                {filteredHistory.length === 1
                  ? "quiz"
                  : "quizzes"}{" "}
                found
              </p>
            </div>

            {search && (
              <p className="text-sm text-gray-500">
                Searching for{" "}
                <span className="font-semibold text-indigo-600">
                  "{search}"
                </span>
              </p>
            )}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="
            mt-8
            flex
            min-h-[320px]
            flex-col
            items-center
            justify-center
            rounded-3xl
            border
            border-gray-200
            bg-white
            shadow-sm
          ">
            <Loader
              size={34}
              className="animate-spin text-indigo-600"
            />

            <p className="
              mt-4
              font-semibold
              text-gray-700
            ">
              Loading quiz history...
            </p>

            <p className="
              mt-1
              text-sm
              text-gray-400
            ">
              Please wait a moment
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {!loading &&
          filteredHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                mt-8
                flex
                min-h-[380px]
                flex-col
                items-center
                justify-center
                rounded-3xl
                border
                border-dashed
                border-indigo-200
                bg-gradient-to-br
                from-indigo-50
                via-white
                to-purple-50
                px-6
                text-center
              "
            >
              <div className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-indigo-100
                text-indigo-600
              ">
                <Brain size={36} />
              </div>

              <h3 className="
                mt-6
                text-2xl
                font-bold
                text-gray-900
              ">
                {history.length
                  ? "No Quizzes Found"
                  : "No Quiz History Yet"}
              </h3>

              <p className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-gray-500
              ">
                {history.length
                  ? "Try changing your search or performance filter."
                  : "Complete your first AI quiz and your results will appear here."}
              </p>

              {!history.length && (
                <button
                  type="button"
                  onClick={() => navigate("/quiz")}
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-purple-600
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-md
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-lg
                  "
                >
                  <Brain size={18} />
                  Start Your First Quiz
                </button>
              )}
            </motion.div>
          )}

        {/* =================================================
            QUIZ GRID
        ================================================== */}

        {!loading &&
          filteredHistory.length > 0 && (
            <div className="
              mt-6
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            ">
              <AnimatePresence mode="popLayout">
                {filteredHistory.map(
                  (quiz, index) => (
                    <QuizCard
                      key={
                        quiz.completed_at ||
                        `${quiz.title}-${index}`
                      }
                      quiz={quiz}
                    />
                  )
                )}
              </AnimatePresence>
            </div>
          )}

        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="
          mt-10
          rounded-2xl
          border
          border-indigo-100
          bg-indigo-50/60
          px-5
          py-4
          text-center
        ">
          <p className="
            text-sm
            font-bold
            text-indigo-700
          ">
            StudyMind AI
          </p>

          <p className="
            mt-1
            text-xs
            text-indigo-500
          ">
            Practice smarter. Track progress. Learn better.
          </p>
        </div>
      </div>
    </main>
  );
}


// =====================================================
// STATS CARD
// =====================================================

function StatsCard({
  icon,
  title,
  value,
  iconStyle = "indigo",
}) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:shadow-md
        sm:p-5
      "
    >
      <div className="flex items-center gap-3">
        <div className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${styles[iconStyle]}
        `}>
          {icon}
        </div>

        <div className="min-w-0">
          <p className="
            text-xs
            font-semibold
            text-gray-500
          ">
            {title}
          </p>

          <p className="
            mt-0.5
            text-xl
            font-extrabold
            text-gray-900
            sm:text-2xl
          ">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}


// =====================================================
// QUIZ CARD
// =====================================================

function QuizCard({ quiz }) {
  const percentage = Number(
    quiz.percentage || 0
  );

  const score = Number(
    quiz.score || 0
  );

  const total = Number(
    quiz.total || 10
  );

  const isExcellent = percentage >= 80;
  const isPassed = percentage >= 60;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="
        flex
        min-h-[300px]
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition
        hover:shadow-xl
      "
    >
      {/* CARD HEADER */}

      <div className="
        border-b
        border-gray-100
        bg-gradient-to-br
        from-indigo-50
        via-white
        to-purple-50
        p-5
      ">
        <div className="
          flex
          items-start
          justify-between
          gap-3
        ">
          <div className="
            flex
            min-w-0
            items-center
            gap-3
          ">
            <div className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-indigo-600
              text-white
              shadow-sm
            ">
              <Brain size={23} />
            </div>

            <div className="min-w-0">
              <h3
                className="
                  truncate
                  text-sm
                  font-bold
                  text-gray-900
                "
                title={
                  quiz.title ||
                  "AI Generated Quiz"
                }
              >
                {quiz.title ||
                  "AI Generated Quiz"}
              </h3>

              <div className="
                mt-1
                flex
                items-center
                gap-1.5
                text-xs
                text-gray-500
              ">
                <Calendar size={13} />

                {formatDate(
                  quiz.completed_at
                )}
              </div>
            </div>
          </div>

          <div className={`
            shrink-0
            rounded-xl
            px-3
            py-1.5
            text-xs
            font-bold

            ${
              isExcellent
                ? "bg-emerald-100 text-emerald-700"
                : isPassed
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-600"
            }
          `}>
            {isExcellent
              ? "Excellent"
              : isPassed
              ? "Passed"
              : "Practice"}
          </div>
        </div>
      </div>

      {/* CARD BODY */}

      <div className="
        flex
        flex-1
        flex-col
        p-5
      ">
        <div className="
          flex
          items-center
          justify-between
        ">
          <div>
            <p className="
              text-xs
              font-semibold
              text-gray-500
            ">
              Your Score
            </p>

            <p className="
              mt-1
              text-3xl
              font-extrabold
              text-gray-900
            ">
              {score}
              <span className="
                text-lg
                font-bold
                text-gray-400
              ">
                /{total}
              </span>
            </p>
          </div>

          <div className={`
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            border-4
            text-lg
            font-extrabold

            ${
              isExcellent
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : isPassed
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-red-200 bg-red-50 text-red-500"
            }
          `}>
            {percentage}%
          </div>
        </div>

        {/* SCORE BAR */}

        <div className="mt-6">
          <div className="
            flex
            justify-between
            text-xs
            font-semibold
            text-gray-400
          ">
            <span>Performance</span>
            <span>{percentage}%</span>
          </div>

          <div className="
            mt-2
            h-2.5
            overflow-hidden
            rounded-full
            bg-gray-100
          ">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  Math.max(percentage, 0),
                  100
                )}%`,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className={`
                h-full
                rounded-full

                ${
                  isExcellent
                    ? "bg-emerald-500"
                    : isPassed
                    ? "bg-blue-500"
                    : "bg-red-500"
                }
              `}
            />
          </div>
        </div>

        {/* RESULT */}

        <div className="
          mt-auto
          pt-6
        ">
          <div className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-gray-50
            px-4
            py-3
          ">
            {isPassed ? (
              <CheckCircle2
                size={18}
                className="text-emerald-500"
              />
            ) : (
              <XCircle
                size={18}
                className="text-red-500"
              />
            )}

            <span className="
              text-xs
              font-semibold
              text-gray-600
            ">
              {isPassed
                ? "Good work! Keep practicing."
                : "Keep practicing to improve your score."}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}


// =====================================================
// FILTER BUTTON
// =====================================================

function FilterButton({
  active,
  onClick,
  children,
  activeClass = "indigo",
}) {
  const styles = {
    indigo:
      "bg-indigo-600 text-white shadow-sm",
    green:
      "bg-emerald-500 text-white shadow-sm",
    blue:
      "bg-blue-500 text-white shadow-sm",
    red:
      "bg-red-500 text-white shadow-sm",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        min-h-[42px]
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        py-2
        text-sm
        font-semibold
        transition

        ${
          active
            ? styles[activeClass]
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
      `}
    >
      {children}
    </button>
  );
}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(date) {
  if (!date) {
    return "Unknown date";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default QuizHistory;
