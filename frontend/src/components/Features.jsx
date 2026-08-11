import {
  FileText,
  Brain,
  MessageCircle,
  BarChart3,
  Sparkles,
  Trophy,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";

function Features() {
  const features = [
    {
      icon: FileText,
      number: "01",
      title: "Smart Notes Analysis",
      desc: "Upload your study material and let AI extract the most important concepts, insights and key takeaways.",
      points: ["AI-powered summaries", "Key concept extraction"],
      gradient: "from-blue-500 to-cyan-400",
      soft: "bg-blue-50",
      text: "text-blue-600",
    },

    {
      icon: Brain,
      number: "02",
      title: "AI Quiz Generator",
      desc: "Turn your study material into intelligent quizzes that help you test and strengthen your understanding.",
      points: ["Adaptive questions", "Instant performance review"],
      gradient: "from-violet-500 to-fuchsia-500",
      soft: "bg-violet-50",
      text: "text-violet-600",
    },

    {
      icon: MessageCircle,
      number: "03",
      title: "AI Doubt Solver",
      desc: "Ask questions directly from your study material and receive clear, context-aware explanations instantly.",
      points: ["Context-aware answers", "Simple explanations"],
      gradient: "from-emerald-400 to-green-600",
      soft: "bg-emerald-50",
      text: "text-emerald-600",
    },

    {
      icon: BarChart3,
      number: "04",
      title: "Progress Tracking",
      desc: "Understand your learning journey with meaningful analytics, activity insights and progress tracking.",
      points: ["Learning analytics", "Performance insights"],
      gradient: "from-orange-400 to-red-500",
      soft: "bg-orange-50",
      text: "text-orange-600",
    },

    {
      icon: Sparkles,
      number: "05",
      title: "Personal AI Tutor",
      desc: "Your intelligent study companion is available whenever you need help understanding difficult topics.",
      points: ["24/7 AI assistance", "Personalized learning"],
      gradient: "from-indigo-500 to-purple-600",
      soft: "bg-indigo-50",
      text: "text-indigo-600",
    },

    {
      icon: Trophy,
      number: "06",
      title: "Learning Rewards",
      desc: "Stay motivated by building consistency, completing challenges and unlocking meaningful achievements.",
      points: ["Achievement system", "Learning streaks"],
      gradient: "from-yellow-400 to-orange-500",
      soft: "bg-yellow-50",
      text: "text-yellow-600",
    },
  ];

  return (
    <section
      id="features"
      className="
        relative
        overflow-hidden
        bg-white
        py-24
        sm:py-28
        lg:py-32
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-24
          h-72
          w-72
          rounded-full
          bg-indigo-100/50
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-20
          h-80
          w-80
          rounded-full
          bg-purple-100/50
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            SECTION HEADER
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}

          <div
            className="
              mx-auto
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-indigo-100
              bg-indigo-50
              px-4
              py-2
              text-sm
              font-semibold
              text-indigo-700
            "
          >
            <Sparkles size={16} />

            AI-Powered Learning
          </div>

          {/* Heading */}

          <h2
            className="
              mt-6
              text-4xl
              font-extrabold
              tracking-tight
              text-gray-950
              sm:text-5xl
              lg:text-6xl
            "
          >
            Everything you need
            <br />

            <span
              className="
                bg-gradient-to-r
                from-indigo-600
                via-violet-600
                to-purple-600
                bg-clip-text
                text-transparent
              "
            >
              to learn smarter.
            </span>
          </h2>

          {/* Description */}

          <p
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-gray-500
              sm:text-lg
              sm:leading-8
            "
          >
            StudyMind AI combines intelligent note analysis,
            personalized quizzes, AI tutoring and learning
            analytics into one powerful study platform.
          </p>
        </motion.div>

        {/* =====================================================
            FEATURE GRID
        ====================================================== */}

        <div
          className="
            mt-16
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            lg:grid-cols-3
            lg:gap-6
          "
        >
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.number}
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -8,
                }}
                className="
                  group
                  relative
                  flex
                  min-h-[390px]
                  flex-col
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-gray-200
                  bg-white
                  p-7
                  shadow-sm
                  transition-shadow
                  duration-300
                  hover:shadow-2xl
                  sm:p-8
                "
              >
                {/* Top glow */}

                <div
                  className={`
                    pointer-events-none
                    absolute
                    -right-16
                    -top-16
                    h-40
                    w-40
                    rounded-full
                    bg-gradient-to-br
                    ${item.gradient}
                    opacity-0
                    blur-3xl
                    transition-opacity
                    duration-500
                    group-hover:opacity-20
                  `}
                />

                {/* Number */}

                <div className="relative flex items-center justify-between">

                  <span
                    className="
                      text-xs
                      font-bold
                      tracking-[0.2em]
                      text-gray-300
                    "
                  >
                    {item.number}
                  </span>

                  <ArrowUpRight
                    size={20}
                    className="
                      text-gray-300
                      transition-all
                      duration-300
                      group-hover:-translate-y-1
                      group-hover:translate-x-1
                      group-hover:text-indigo-600
                    "
                  />
                </div>

                {/* Icon */}

                <div
                  className={`
                    relative
                    mt-7
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    ${item.gradient}
                    text-white
                    shadow-lg
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  `}
                >
                  <Icon size={26} />
                </div>

                {/* Content */}

                <div className="relative mt-6">

                  <h3
                    className="
                      text-xl
                      font-bold
                      tracking-tight
                      text-gray-900
                      sm:text-2xl
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-gray-500
                    "
                  >
                    {item.desc}
                  </p>

                </div>

                {/* Points */}

                <div className="relative mt-auto pt-7">

                  <div className="h-px w-full bg-gray-100" />

                  <div className="mt-5 space-y-3">

                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-center gap-2.5"
                      >
                        <CheckCircle2
                          size={16}
                          className={item.text}
                        />

                        <span
                          className="
                            text-xs
                            font-semibold
                            text-gray-600
                          "
                        >
                          {point}
                        </span>
                      </div>
                    ))}

                  </div>

                </div>

              </motion.article>
            );
          })}
        </div>

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            mt-12
            overflow-hidden
            rounded-[2rem]
            bg-gradient-to-r
            from-indigo-600
            via-violet-600
            to-purple-600
            p-7
            text-white
            shadow-xl
            sm:p-9
          "
        >
          <div
            className="
              flex
              flex-col
              gap-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-white/70
                "
              >
                Ready to transform the way you study?
              </p>

              <h3
                className="
                  mt-1
                  text-2xl
                  font-extrabold
                  tracking-tight
                  sm:text-3xl
                "
              >
                Your smarter learning journey starts here.
              </h3>

            </div>

            <a
              href="/register"
              className="
                inline-flex
                min-h-[48px]
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-6
                py-3
                text-sm
                font-bold
                text-indigo-700
                shadow-lg
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              Start Learning

              <ArrowUpRight size={17} />
            </a>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default Features;