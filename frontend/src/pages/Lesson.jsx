import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Clock3,
  Trophy,
  Sparkles,
  Target,
  ChevronRight,
  X,
  GraduationCap,
  Brain,
  Lightbulb,
} from "lucide-react";

const DEFAULT_LESSONS = [
  {
    id: 1,
    title: "Introduction to AI",
    desc: "Learn the fundamentals of Artificial Intelligence, its history, applications, and how AI systems work.",
    duration: "20 min",
    level: "Beginner",
    progress: 100,
    topics: [
      "What is Artificial Intelligence?",
      "History of AI",
      "Types of AI",
      "AI applications",
      "Real-world examples",
    ],
  },

  {
    id: 2,
    title: "Machine Learning Basics",
    desc: "Understand machine learning concepts, common algorithms, training processes, and real-world examples.",
    duration: "35 min",
    level: "Beginner",
    progress: 45,
    topics: [
      "What is Machine Learning?",
      "Supervised Learning",
      "Unsupervised Learning",
      "Common ML algorithms",
      "Training and testing",
    ],
  },

  {
    id: 3,
    title: "Deep Learning",
    desc: "Explore neural networks, deep learning architectures, and how modern AI systems learn from large datasets.",
    duration: "45 min",
    level: "Intermediate",
    progress: 0,
    topics: [
      "Neural Networks",
      "Neurons and Layers",
      "Deep Learning",
      "CNN",
      "Training Neural Networks",
    ],
  },

  {
    id: 4,
    title: "AI Project Building",
    desc: "Learn how to convert AI concepts into practical projects using real-world development workflows.",
    duration: "60 min",
    level: "Intermediate",
    progress: 0,
    topics: [
      "Project Planning",
      "Problem Definition",
      "Dataset Preparation",
      "Model Development",
      "Testing and Deployment",
    ],
  },
];

function Lesson() {
  const navigate = useNavigate();

  const [lessons, setLessons] = useState(() => {
    try {
      const saved = localStorage.getItem("studymind_lessons");

      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Lesson storage error:", error);
    }

    return DEFAULT_LESSONS;
  });

  const [selectedLesson, setSelectedLesson] = useState(null);

  // =====================================================
  // SAVE LESSON PROGRESS
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "studymind_lessons",
      JSON.stringify(lessons)
    );
  }, [lessons]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    const completed = lessons.filter(
      (lesson) => lesson.progress === 100
    ).length;

    const totalProgress = lessons.reduce(
      (sum, lesson) => sum + lesson.progress,
      0
    );

    const progress =
      lessons.length > 0
        ? Math.round(totalProgress / lessons.length)
        : 0;

    return {
      completed,
      total: lessons.length,
      progress,
    };
  }, [lessons]);

  // =====================================================
  // LESSON STATUS
  // =====================================================

  const getStatus = (lesson) => {
    if (lesson.progress === 100) {
      return "Completed";
    }

    if (lesson.progress > 0) {
      return "Continue";
    }

    return "Start";
  };

  // =====================================================
  // OPEN LESSON
  // =====================================================

  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
  };

  // =====================================================
  // START LESSON
  // =====================================================

  const startLesson = (lessonId) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId && lesson.progress === 0
          ? {
              ...lesson,
              progress: 10,
            }
          : lesson
      )
    );

    setSelectedLesson((prev) =>
      prev
        ? {
            ...prev,
            progress: prev.progress === 0 ? 10 : prev.progress,
          }
        : null
    );
  };

  // =====================================================
  // COMPLETE LESSON
  // =====================================================

  const completeLesson = (lessonId) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              progress: 100,
            }
          : lesson
      )
    );

    setSelectedLesson(null);
  };

  // =====================================================
  // CONTINUE NEXT LESSON
  // =====================================================

  const continueNextLesson = () => {
    const nextLesson = lessons.find(
      (lesson) => lesson.progress < 100
    );

    if (nextLesson) {
      setSelectedLesson(nextLesson);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* =================================================
            BACK BUTTON
        ================================================== */}

        <motion.button
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
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
            font-bold
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
        </motion.button>

        {/* =================================================
            HERO
        ================================================== */}

        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            relative
            mt-7
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
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              -left-20
              h-80
              w-80
              rounded-full
              bg-purple-300/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* HERO TEXT */}

            <div className="max-w-3xl">

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/20
                  bg-white/10
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  backdrop-blur
                "
              >
                <Sparkles size={14} />
                AI Learning Path
              </div>

              <h1
                className="
                  text-3xl
                  font-extrabold
                  tracking-tight
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                AI Learning Lessons
              </h1>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-7
                  text-white/75
                  sm:text-base
                "
              >
                Build your AI knowledge step by step with
                structured lessons designed for practical
                learning.
              </p>

            </div>

            {/* PROGRESS */}

            <div
              className="
                w-full
                rounded-2xl
                border
                border-white/15
                bg-white/10
                p-5
                backdrop-blur-md
                lg:max-w-xs
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div className="flex items-center gap-2">
                  <Target size={18} />

                  <span className="text-sm font-semibold">
                    Learning Progress
                  </span>
                </div>

                <span className="text-lg font-extrabold">
                  {stats.progress}%
                </span>
              </div>

              <div
                className="
                  mt-4
                  h-2.5
                  overflow-hidden
                  rounded-full
                  bg-white/20
                "
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${stats.progress}%`,
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                  }}
                  className="
                    h-full
                    rounded-full
                    bg-white
                  "
                />
              </div>

              <p className="mt-3 text-xs text-white/60">
                {stats.completed} of {stats.total} lessons
                completed
              </p>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            QUICK STATS
        ================================================== */}

        <div
          className="
            mt-7
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-3
          "
        >
          <QuickStat
            icon={<BookOpen size={20} />}
            title="Total Lessons"
            value={stats.total}
          />

          <QuickStat
            icon={<CheckCircle2 size={20} />}
            title="Completed"
            value={stats.completed}
            iconStyle="green"
          />

          <QuickStat
            icon={<Trophy size={20} />}
            title="Overall Progress"
            value={`${stats.progress}%`}
            iconStyle="yellow"
          />
        </div>

        {/* =================================================
            LEARNING PATH HEADER
        ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="
            mt-10
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
                text-sm
                font-bold
                text-indigo-600
              "
            >
              YOUR LEARNING PATH
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-extrabold
                text-gray-900
                sm:text-3xl
              "
            >
              Continue Learning
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Choose a lesson and continue building your
              AI skills.
            </p>
          </div>

          <div
            className="
              text-sm
              font-semibold
              text-gray-400
            "
          >
            {lessons.length} lessons available
          </div>
        </motion.div>

        {/* =================================================
            LESSON CARDS
        ================================================== */}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {lessons.map((lesson, index) => {
            const status = getStatus(lesson);

            return (
              <motion.article
                key={lesson.id}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1 + index * 0.05,
                }}
                whileHover={{
                  y: -5,
                }}
                className="
                  group
                  flex
                  min-h-[390px]
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

                <div
                  className="
                    border-b
                    border-gray-100
                    bg-gradient-to-br
                    from-indigo-50
                    via-white
                    to-purple-50
                    p-5
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
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-indigo-600
                        text-white
                        shadow-sm
                      "
                    >
                      {status === "Completed" ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <PlayCircle size={24} />
                      )}
                    </div>

                    <span
                      className={`
                        rounded-lg
                        border
                        px-2.5
                        py-1.5
                        text-xs
                        font-bold
                        ${getStatusStyle(status)}
                      `}
                    >
                      {status}
                    </span>
                  </div>

                  <h3
                    className="
                      mt-5
                      text-xl
                      font-extrabold
                      text-gray-900
                    "
                  >
                    {lesson.title}
                  </h3>
                </div>

                {/* CARD BODY */}

                <div
                  className="
                    flex
                    flex-1
                    flex-col
                    p-5
                  "
                >
                  <p
                    className="
                      line-clamp-3
                      text-sm
                      leading-6
                      text-gray-600
                    "
                  >
                    {lesson.desc}
                  </p>

                  {/* META */}

                  <div
                    className="
                      mt-5
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        bg-gray-100
                        px-2.5
                        py-1.5
                        text-xs
                        font-semibold
                        text-gray-600
                      "
                    >
                      <Clock3 size={14} />
                      {lesson.duration}
                    </span>

                    <span
                      className="
                        rounded-lg
                        bg-purple-50
                        px-2.5
                        py-1.5
                        text-xs
                        font-semibold
                        text-purple-600
                      "
                    >
                      {lesson.level}
                    </span>
                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        text-xs
                        font-semibold
                      "
                    >
                      <span className="text-gray-400">
                        Progress
                      </span>

                      <span className="text-indigo-600">
                        {lesson.progress}%
                      </span>
                    </div>

                    <div
                      className="
                        mt-2
                        h-2
                        overflow-hidden
                        rounded-full
                        bg-gray-100
                      "
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${lesson.progress}%`,
                        }}
                        transition={{
                          duration: 0.8,
                        }}
                        className="
                          h-full
                          rounded-full
                          bg-gradient-to-r
                          from-indigo-600
                          to-purple-600
                        "
                      />
                    </div>
                  </div>

                  {/* ACTION */}

                  <button
                    type="button"
                    onClick={() => openLesson(lesson)}
                    className={`
                      mt-auto
                      inline-flex
                      min-h-[46px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-bold
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md

                      ${
                        status === "Completed"
                          ? "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      }
                    `}
                  >
                    {status === "Completed" ? (
                      <>
                        <CheckCircle2 size={17} />
                        Review Lesson
                      </>
                    ) : (
                      <>
                        <PlayCircle size={17} />

                        {status === "Continue"
                          ? "Continue Lesson"
                          : "Start Lesson"}
                      </>
                    )}

                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* =================================================
            MOTIVATION CARD
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
          transition={{
            delay: 0.3,
          }}
          className="
            mt-8
            overflow-hidden
            rounded-3xl
            border
            border-indigo-100
            bg-gradient-to-r
            from-indigo-50
            via-white
            to-purple-50
            p-6
            shadow-sm
            sm:p-8
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
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-yellow-400
                  to-orange-500
                  text-white
                  shadow-md
                "
              >
                <Trophy size={26} />
              </div>

              <div>
                <h2
                  className="
                    text-xl
                    font-extrabold
                    text-gray-900
                  "
                >
                  {stats.progress === 100
                    ? "Amazing Work! 🎉"
                    : "Keep Learning 🚀"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {stats.progress === 100
                    ? "You completed the entire AI learning path."
                    : "Complete every lesson and become an AI-ready learner."}
                </p>
              </div>
            </div>

            {stats.progress < 100 && (
              <button
                type="button"
                onClick={continueNextLesson}
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gray-900
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Continue
                <ChevronRight size={17} />
              </button>
            )}
          </div>
        </motion.section>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-indigo-100
            bg-indigo-50/70
            px-5
            py-4
            text-center
          "
        >
          <p
            className="
              text-sm
              font-bold
              text-indigo-700
            "
          >
            StudyMind AI
          </p>

          <p
            className="
              mt-1
              text-xs
              text-indigo-500
            "
          >
            Learn smarter. Practice better. Improve faster.
          </p>
        </div>
      </div>

      {/* ===================================================
          LESSON MODAL
      =================================================== */}

      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLesson(null)}
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/60
              p-4
              backdrop-blur-sm
              sm:p-6
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              onClick={(e) => e.stopPropagation()}
              className="
                max-h-[90vh]
                w-full
                max-w-2xl
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-2xl
              "
            >
              {/* MODAL HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  bg-gradient-to-r
                  from-indigo-600
                  to-purple-600
                  px-5
                  py-5
                  text-white
                  sm:px-7
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-white/60
                    "
                  >
                    AI Learning Lesson
                  </p>

                  <h2
                    className="
                      mt-1
                      truncate
                      text-xl
                      font-extrabold
                    "
                  >
                    {selectedLesson.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedLesson(null)
                  }
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    text-white/80
                    transition
                    hover:bg-white/15
                    hover:text-white
                  "
                >
                  <X size={20} />
                </button>
              </div>

              {/* MODAL BODY */}

              <div
                className="
                  max-h-[65vh]
                  overflow-y-auto
                  px-5
                  py-6
                  sm:px-7
                  sm:py-7
                "
              >
                {/* META */}

                <div className="flex flex-wrap gap-2">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-indigo-50
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-indigo-600
                    "
                  >
                    <Clock3 size={14} />
                    {selectedLesson.duration}
                  </span>

                  <span
                    className="
                      rounded-lg
                      bg-purple-50
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-purple-600
                    "
                  >
                    {selectedLesson.level}
                  </span>

                  <span
                    className="
                      rounded-lg
                      bg-emerald-50
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-emerald-600
                    "
                  >
                    {selectedLesson.progress}% Complete
                  </span>
                </div>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-6
                    text-sm
                    leading-7
                    text-gray-600
                    sm:text-base
                  "
                >
                  {selectedLesson.desc}
                </p>

                {/* WHAT YOU LEARN */}

                <div className="mt-7">
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-indigo-50
                        text-indigo-600
                      "
                    >
                      <GraduationCap size={18} />
                    </div>

                    <h3
                      className="
                        text-base
                        font-extrabold
                        text-gray-900
                      "
                    >
                      What you will learn
                    </h3>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedLesson.topics.map(
                      (topic, index) => (
                        <div
                          key={index}
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-gray-100
                            bg-gray-50
                            px-4
                            py-3
                          "
                        >
                          <div
                            className="
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-indigo-100
                              text-xs
                              font-bold
                              text-indigo-600
                            "
                          >
                            {index + 1}
                          </div>

                          <span
                            className="
                              text-sm
                              font-medium
                              text-gray-700
                            "
                          >
                            {topic}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* LEARNING TIP */}

                <div
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-indigo-100
                    bg-indigo-50
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb
                      size={20}
                      className="
                        mt-0.5
                        shrink-0
                        text-indigo-600
                      "
                    />

                    <div>
                      <p
                        className="
                          text-sm
                          font-bold
                          text-indigo-800
                        "
                      >
                        Learning Tip
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-indigo-600
                        "
                      >
                        Read each topic carefully and
                        practice the concepts with small
                        examples before moving to the next
                        lesson.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-gray-100
                  bg-gray-50
                  px-5
                  py-4
                  sm:flex-row
                  sm:justify-end
                  sm:px-7
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedLesson(null)
                  }
                  className="
                    inline-flex
                    min-h-[46px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-gray-700
                    transition
                    hover:bg-gray-100
                  "
                >
                  Close
                </button>

                {selectedLesson.progress < 100 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        startLesson(selectedLesson.id)
                      }
                      className="
                        inline-flex
                        min-h-[46px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-indigo-200
                        bg-white
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-indigo-600
                        transition
                        hover:bg-indigo-50
                      "
                    >
                      <PlayCircle size={17} />
                      Start Learning
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        completeLesson(
                          selectedLesson.id
                        )
                      }
                      className="
                        inline-flex
                        min-h-[46px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-gradient-to-r
                        from-indigo-600
                        to-purple-600
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:-translate-y-0.5
                        hover:shadow-md
                      "
                    >
                      <CheckCircle2 size={17} />
                      Mark as Complete
                    </button>
                  </>
                )}

                {selectedLesson.progress === 100 && (
                  <div
                    className="
                      inline-flex
                      min-h-[46px]
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-emerald-50
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-emerald-600
                    "
                  >
                    <CheckCircle2 size={17} />
                    Lesson Completed
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// =====================================================
// QUICK STAT
// =====================================================

function QuickStat({
  icon,
  title,
  value,
  iconStyle = "indigo",
}) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:shadow-md
      "
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${styles[iconStyle]}
          `}
        >
          {icon}
        </div>

        <div>
          <p
            className="
              text-xs
              font-semibold
              text-gray-500
            "
          >
            {title}
          </p>

          <p
            className="
              mt-0.5
              text-2xl
              font-extrabold
              text-gray-900
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
// STATUS STYLE
// =====================================================

function getStatusStyle(status) {
  if (status === "Completed") {
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  }

  if (status === "Continue") {
    return "bg-indigo-50 text-indigo-600 border-indigo-100";
  }

  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default Lesson;