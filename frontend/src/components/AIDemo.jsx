import {
  Sparkles,
  Upload,
  Brain,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function AIDemo() {
  const cards = [
    {
      icon: Upload,
      step: "01",
      title: "Upload Notes",
      desc: "Upload PDF files and let StudyMind AI understand your study material.",
      points: [
        "PDF document analysis",
        "Important concept extraction",
      ],
      color: "from-cyan-400 to-blue-600",
    },

    {
      icon: Brain,
      step: "02",
      title: "Generate Quiz",
      desc: "Turn your study material into intelligent questions and test your understanding.",
      points: [
        "AI-generated questions",
        "Instant performance review",
      ],
      color: "from-violet-500 to-pink-600",
    },

    {
      icon: MessageCircle,
      step: "03",
      title: "Ask AI Tutor",
      desc: "Ask questions from your notes and receive clear, context-aware explanations.",
      points: [
        "Context-aware answers",
        "Simple explanations",
      ],
      color: "from-emerald-400 to-green-600",
    },
  ];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-slate-950
        via-indigo-950
        to-purple-950
        py-24
        sm:py-28
        lg:py-32
      "
    >
      {/* =====================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-20
          h-80
          w-80
          rounded-full
          bg-indigo-500/20
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-1/3
          h-96
          w-96
          rounded-full
          bg-purple-500/20
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/3
          h-72
          w-72
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
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
          className="mx-auto max-w-3xl text-center text-white"
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
              border-white/10
              bg-white/10
              px-4
              py-2
              text-sm
              font-semibold
              text-white/90
              shadow-lg
              backdrop-blur-xl
            "
          >
            <Sparkles
              size={16}
              className="text-cyan-300"
            />

            AI Powered Learning
          </div>

          {/* Heading */}

          <h2
            className="
              mt-6
              text-4xl
              font-extrabold
              tracking-tight
              sm:text-5xl
              lg:text-6xl
            "
          >
            Your Personal

            <br />

            <span
              className="
                bg-gradient-to-r
                from-cyan-300
                via-indigo-300
                to-purple-300
                bg-clip-text
                text-transparent
              "
            >
              AI Study Assistant
            </span>

            <span className="ml-2">🤖</span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-white/60
              sm:text-lg
              sm:leading-8
            "
          >
            One intelligent platform to understand your notes,
            practice with AI-generated quizzes and get instant
            explanations whenever you need them.
          </p>
        </motion.div>

        {/* =====================================================
            AI FLOW
        ====================================================== */}

        <div
          className="
            mt-16
            grid
            grid-cols-1
            gap-5
            md:grid-cols-3
          "
        >
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.step}
                initial={{
                  opacity: 0,
                  y: 45,
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
                  duration: 0.55,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                }}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-white/[0.07]
                  p-7
                  shadow-2xl
                  backdrop-blur-xl
                  transition-shadow
                  duration-300
                  hover:border-white/20
                  hover:shadow-indigo-950/40
                  sm:p-8
                "
              >
                {/* Card glow */}

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
                    ${card.color}
                    opacity-0
                    blur-3xl
                    transition-opacity
                    duration-500
                    group-hover:opacity-20
                  `}
                />

                {/* Step */}

                <div className="relative flex items-center justify-between">

                  <span
                    className="
                      text-xs
                      font-bold
                      tracking-[0.2em]
                      text-white/30
                    "
                  >
                    STEP {card.step}
                  </span>

                  <ArrowRight
                    size={18}
                    className="
                      text-white/20
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                      group-hover:text-white/70
                    "
                  />

                </div>

                {/* Icon */}

                <div
                  className={`
                    relative
                    mt-7
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    ${card.color}
                    text-white
                    shadow-xl
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  `}
                >
                  <Icon size={29} />
                </div>

                {/* Content */}

                <div className="relative mt-6">

                  <h3
                    className="
                      text-2xl
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >
                    {card.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-white/55
                    "
                  >
                    {card.desc}
                  </p>

                </div>

                {/* Points */}

                <div
                  className="
                    relative
                    mt-7
                    space-y-3
                    border-t
                    border-white/10
                    pt-5
                  "
                >
                  {card.points.map((point) => (
                    <div
                      key={point}
                      className="
                        flex
                        items-center
                        gap-2.5
                      "
                    >
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-cyan-300"
                      />

                      <span
                        className="
                          text-xs
                          font-medium
                          text-white/65
                        "
                      >
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* =====================================================
            TRUST STRIP
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
          }}
          transition={{
            delay: 0.2,
            duration: 0.6,
          }}
          className="
            mx-auto
            mt-10
            flex
            max-w-4xl
            flex-col
            items-center
            justify-center
            gap-5
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            px-6
            py-5
            backdrop-blur-xl
            sm:flex-row
            sm:gap-10
          "
        >
          <div className="flex items-center gap-2.5">
            <Zap
              size={17}
              className="text-yellow-300"
            />

            <span className="text-xs font-semibold text-white/60">
              Instant AI Assistance
            </span>
          </div>

          <div className="hidden h-4 w-px bg-white/10 sm:block" />

          <div className="flex items-center gap-2.5">
            <ShieldCheck
              size={17}
              className="text-emerald-300"
            />

            <span className="text-xs font-semibold text-white/60">
              Secure Study Experience
            </span>
          </div>

          <div className="hidden h-4 w-px bg-white/10 sm:block" />

          <div className="flex items-center gap-2.5">
            <Brain
              size={17}
              className="text-indigo-300"
            />

            <span className="text-xs font-semibold text-white/60">
              Context-Aware Learning
            </span>
          </div>
        </motion.div>

        {/* =====================================================
            CTA
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.25,
            duration: 0.6,
          }}
          className="mt-12 text-center"
        >
          <Link
            to="/chat"
            className="
              group
              inline-flex
              min-h-[52px]
              items-center
              justify-center
              gap-2.5
              rounded-xl
              bg-white
              px-7
              py-3.5
              text-sm
              font-bold
              text-indigo-700
              shadow-2xl
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-white/20
            "
          >
            Try StudyMind AI

            <ArrowRight
              size={18}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </Link>

          <p className="mt-4 text-xs text-white/35">
            Learn smarter. Practice better. Improve faster.
          </p>
        </motion.div>

      </div>
    </section>
  );
}

export default AIDemo;