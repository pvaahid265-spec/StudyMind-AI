import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Award,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader,
  RotateCcw,
  Sparkles,
  Trophy,
  Upload,
  XCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import API from "../axios";


function Quiz() {

  const navigate = useNavigate();


  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);


  // =====================================================
  // FILE
  // =====================================================

  const [file, setFile] = useState(null);


  // =====================================================
  // QUIZ
  // =====================================================

  const [quiz, setQuiz] = useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [answers, setAnswers] = useState({});


  // =====================================================
  // STATUS
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [percentage, setPercentage] =
    useState(0);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {

    try {

      const storedUser =
        JSON.parse(
          localStorage.getItem("user")
        );

      const token =
        localStorage.getItem("token");

      if (
        storedUser?.email &&
        token
      ) {

        setUser(storedUser);

      }

    } catch (err) {

      console.error(
        "Quiz User Load Error:",
        err
      );

    }

  }, []);


  // =====================================================
  // FILE SELECT
  // =====================================================

  const handleFileChange = (event) => {

    const selectedFile =
      event.target.files?.[0];

    setError("");

    setQuiz([]);

    setAnswers({});

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setSubmitted(false);

    setScore(0);

    setPercentage(0);


    if (!selectedFile) {

      setFile(null);

      return;

    }


    // -------------------------------------------------
    // PDF CHECK
    // -------------------------------------------------

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      setError(
        "Only PDF files are allowed."
      );

      setFile(null);

      return;

    }


    // -------------------------------------------------
    // SIZE CHECK
    // -------------------------------------------------

    const maxSize =
      10 * 1024 * 1024;


    if (
      selectedFile.size >
      maxSize
    ) {

      setError(
        "PDF file size must be less than 10 MB."
      );

      setFile(null);

      return;

    }


    setFile(
      selectedFile
    );

  };


  // =====================================================
  // GENERATE QUIZ
  // =====================================================

  const generateQuiz = async () => {

    setError("");

    setSubmitted(false);

    setQuiz([]);

    setAnswers({});

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setScore(0);

    setPercentage(0);


    if (!file) {

      setError(
        "Please upload a PDF file first."
      );

      return;

    }


    if (!user?.email) {

      setError(
        "Please login to generate a quiz."
      );

      return;

    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      setError(
        "Session expired. Please login again."
      );

      return;

    }


    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );

    formData.append(
      "email",
      user.email
    );


    try {

      setLoading(true);


      const response =
        await API.post(
          "/ai/quiz",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const generatedQuiz =
        response.data?.quiz;


      if (
        !Array.isArray(
          generatedQuiz
        )
      ) {

        throw new Error(
          "Invalid quiz response from server."
        );

      }


      if (
        generatedQuiz.length !== 5
      ) {

        throw new Error(
          "AI did not generate exactly 5 questions."
        );

      }


      setQuiz(
        generatedQuiz
      );


      setCurrentQuestion(0);

      setSelectedAnswer("");

      setAnswers({});


    } catch (err) {

      console.error(
        "Generate Quiz Error:",
        err
      );


      const detail =
        err.response?.data?.detail;


      setError(
        typeof detail === "string"
          ? detail
          : err.message ||
            "Unable to generate quiz."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // SELECT ANSWER
  // =====================================================

  const selectAnswer = (
    answer
  ) => {

    if (submitted) {
      return;
    }


    setSelectedAnswer(
      answer
    );


    setAnswers(
      (previous) => ({
        ...previous,

        [currentQuestion]:
          answer,

      })
    );

  };


  // =====================================================
  // NEXT
  // =====================================================

  const nextQuestion = () => {

    if (!selectedAnswer) {

      setError(
        "Please select an answer."
      );

      return;

    }


    setError("");


    if (
      currentQuestion <
      quiz.length - 1
    ) {

      const nextIndex =
        currentQuestion + 1;


      setCurrentQuestion(
        nextIndex
      );


      setSelectedAnswer(
        answers[nextIndex] || ""
      );

    } else {

      finishQuiz();

    }

  };


  // =====================================================
  // PREVIOUS
  // =====================================================

  const previousQuestion = () => {

    if (
      currentQuestion <= 0
    ) {

      return;

    }


    const previousIndex =
      currentQuestion - 1;


    setCurrentQuestion(
      previousIndex
    );


    setSelectedAnswer(
      answers[previousIndex] || ""
    );


    setError("");

  };


  // =====================================================
  // FINISH QUIZ
  // =====================================================

  const finishQuiz = async () => {

    if (!selectedAnswer) {

      setError(
        "Please select an answer."
      );

      return;

    }


    const finalAnswers = {
      ...answers,
      [currentQuestion]:
        selectedAnswer,
    };


    let calculatedScore = 0;


    quiz.forEach(
      (question, index) => {

        if (
          finalAnswers[index] ===
          question.answer
        ) {

          calculatedScore += 1;

        }

      }
    );


    const total =
      quiz.length;


    const calculatedPercentage =
      Math.round(
        (calculatedScore / total) *
        100
      );


    setAnswers(
      finalAnswers
    );

    setScore(
      calculatedScore
    );

    setPercentage(
      calculatedPercentage
    );

    setSubmitted(
      true
    );

    setError("");


    // =================================================
    // SAVE RESULT
    // =================================================

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      if (user?.email) {

        const formData =
          new FormData();


        formData.append(
          "email",
          user.email
        );

        formData.append(
          "score",
          String(
            calculatedScore
          )
        );

        formData.append(
          "total_questions",
          String(total)
        );


        await API.post(
          "/ai/quiz/result",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      }

    } catch (err) {

      console.error(
        "Quiz Result Save Error:",
        err
      );

      // Don't block result screen
    }

  };


  // =====================================================
  // RETRY
  // =====================================================

  const retryQuiz = () => {

    setQuiz([]);

    setAnswers({});

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setSubmitted(false);

    setScore(0);

    setPercentage(0);

    setError("");

  };


  // =====================================================
  // CHANGE PDF
  // =====================================================

  const changeFile = () => {

    setFile(null);

    setQuiz([]);

    setAnswers({});

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setSubmitted(false);

    setScore(0);

    setPercentage(0);

    setError("");

  };


  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {

    return (

      <main className="
        min-h-screen
        bg-gradient-to-br
        from-indigo-50
        via-white
        to-purple-50
        px-5
        pt-24
      ">

        <div className="
          mx-auto
          flex
          min-h-[70vh]
          max-w-md
          items-center
          justify-center
        ">

          <div className="
            w-full
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-xl
          ">

            <div className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-indigo-100
              text-indigo-600
            ">

              <Brain size={32} />

            </div>


            <h2 className="
              mt-5
              text-2xl
              font-black
              text-slate-900
            ">

              Login Required

            </h2>


            <p className="
              mt-2
              text-sm
              text-slate-500
            ">

              Please login to generate
              AI quizzes.

            </p>


            <button
              onClick={() =>
                navigate("/login")
              }
              className="
                mt-6
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                px-6
                py-3
                text-sm
                font-bold
                text-white
                shadow-lg
              "
            >

              Login

            </button>

          </div>

        </div>

      </main>

    );

  }


  // =====================================================
  // RESULT SCREEN
  // =====================================================

  if (submitted) {

    return (

      <main className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50
        via-white
        to-indigo-50
        px-4
        pb-10
        pt-20
        sm:px-6
      ">

        <div className="
          mx-auto
          max-w-5xl
        ">

          <button
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
              px-4
              py-2.5
              text-sm
              font-bold
              text-slate-700
              shadow-sm
            "
          >

            <ArrowLeft size={17} />

            Dashboard

          </button>


          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              overflow-hidden
              rounded-[2rem]
              border
              border-slate-200
              bg-white
              shadow-2xl
            "
          >

            <div className="
              bg-gradient-to-r
              from-indigo-700
              via-violet-700
              to-purple-700
              px-6
              py-10
              text-center
              text-white
              sm:px-10
            ">

              <div className="
                mx-auto
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-white/10
                backdrop-blur-md
              ">

                {percentage >= 80 ? (
                  <Trophy size={42} />
                ) : (
                  <Award size={42} />
                )}

              </div>


              <h1 className="
                mt-5
                text-3xl
                font-black
                sm:text-4xl
              ">

                Quiz Completed!

              </h1>


              <p className="
                mt-2
                text-sm
                text-white/70
              ">

                Great job! Here is your result.

              </p>

            </div>


            <div className="
              grid
              gap-4
              p-5
              sm:grid-cols-3
              sm:p-8
            ">

              <ResultCard
                icon={<Trophy size={22} />}
                title="Score"
                value={`${score}/${quiz.length}`}
              />

              <ResultCard
                icon={<Award size={22} />}
                title="Percentage"
                value={`${percentage}%`}
              />

              <ResultCard
                icon={<CheckCircle size={22} />}
                title="Correct"
                value={score}
              />

            </div>


            <div className="
              border-t
              border-slate-100
              p-5
              sm:p-8
            ">

              <h2 className="
                text-xl
                font-black
                text-slate-900
              ">

                Answer Review

              </h2>


              <div className="
                mt-5
                space-y-4
              ">

                {quiz.map(
                  (question, index) => {

                    const userAnswer =
                      answers[index];

                    const correct =
                      userAnswer ===
                      question.answer;


                    return (

                      <div
                        key={index}
                        className={`
                          rounded-2xl
                          border
                          p-5
                          ${
                            correct
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-red-200 bg-red-50"
                          }
                        `}
                      >

                        <div className="
                          flex
                          items-start
                          gap-3
                        ">

                          {correct ? (

                            <CheckCircle
                              size={20}
                              className="
                                mt-0.5
                                shrink-0
                                text-emerald-600
                              "
                            />

                          ) : (

                            <XCircle
                              size={20}
                              className="
                                mt-0.5
                                shrink-0
                                text-red-600
                              "
                            />

                          )}


                          <div>

                            <p className="
                              text-sm
                              font-bold
                              leading-6
                              text-slate-800
                            ">

                              {index + 1}.{" "}
                              {question.question}

                            </p>


                            <p className="
                              mt-2
                              text-xs
                              text-slate-600
                            ">

                              Your answer:{" "}

                              <span className="font-bold">

                                {userAnswer ||
                                  "Not answered"}

                              </span>

                            </p>


                            {!correct && (

                              <p className="
                                mt-1
                                text-xs
                                text-emerald-700
                              ">

                                Correct answer:{" "}

                                <span className="font-bold">

                                  {question.answer}

                                </span>

                              </p>

                            )}

                          </div>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>


              <div className="
                mt-7
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:justify-center
              ">

                <button
                  onClick={retryQuiz}
                  className="
                    inline-flex
                    items-center
                    justify-center
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
                    shadow-lg
                  "
                >

                  <RotateCcw size={17} />

                  Generate Another Quiz

                </button>


                <button
                  onClick={() =>
                    navigate("/dashboard")
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >

                  Back to Dashboard

                </button>

              </div>

            </div>

          </motion.div>

        </div>

      </main>

    );

  }


  // =====================================================
  // QUIZ SCREEN
  // =====================================================

  if (quiz.length > 0) {

    const question =
      quiz[currentQuestion];


    const progress =
      ((currentQuestion + 1) /
        quiz.length) *
      100;


    return (

      <main className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50
        via-white
        to-indigo-50
        px-4
        pb-10
        pt-20
        sm:px-6
      ">

        <div className="
          mx-auto
          max-w-5xl
        ">

          <div className="
            mb-5
            flex
            items-center
            justify-between
            gap-3
          ">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-slate-700
                shadow-sm
              "
            >

              <ArrowLeft size={17} />

              Dashboard

            </button>


            <button
              onClick={retryQuiz}
              className="
                inline-flex
                items-center
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
              "
            >

              <RotateCcw size={16} />

              <span className="hidden sm:inline">
                Restart
              </span>

            </button>

          </div>


          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              overflow-hidden
              rounded-[2rem]
              border
              border-slate-200
              bg-white
              shadow-2xl
            "
          >

            <div className="
              bg-gradient-to-r
              from-indigo-700
              via-violet-700
              to-purple-700
              px-5
              py-6
              text-white
              sm:px-8
            ">

              <div className="
                flex
                items-center
                justify-between
                gap-3
              ">

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/10
                  ">

                    <Brain size={23} />

                  </div>


                  <div>

                    <p className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white/60
                    ">

                      AI Quiz

                    </p>

                    <h1 className="
                      text-xl
                      font-black
                    ">

                      Test Your Knowledge

                    </h1>

                  </div>

                </div>


                <div className="
                  rounded-full
                  bg-white/10
                  px-3
                  py-2
                  text-xs
                  font-bold
                ">

                  {currentQuestion + 1}
                  {" / "}
                  {quiz.length}

                </div>

              </div>


              <div className="
                mt-6
                h-2
                overflow-hidden
                rounded-full
                bg-white/20
              ">

                <motion.div
                  className="
                    h-full
                    rounded-full
                    bg-white
                  "
                  animate={{
                    width:
                      `${progress}%`,
                  }}
                />

              </div>

            </div>


            <div className="
              p-5
              sm:p-8
            ">

              <AnimatePresence mode="wait">

                <motion.div
                  key={currentQuestion}
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >

                  <div className="
                    flex
                    items-start
                    gap-3
                  ">

                    <span className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-100
                      text-sm
                      font-black
                      text-indigo-700
                    ">

                      {currentQuestion + 1}

                    </span>


                    <h2 className="
                      text-lg
                      font-black
                      leading-7
                      text-slate-900
                      sm:text-xl
                    ">

                      {question.question}

                    </h2>

                  </div>


                  <div className="
                    mt-7
                    grid
                    gap-3
                  ">

                    {question.options.map(
                      (option, index) => {

                        const isSelected =
                          selectedAnswer ===
                          option;


                        return (

                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              selectAnswer(
                                option
                              )
                            }
                            className={`
                              flex
                              items-center
                              gap-3
                              rounded-2xl
                              border
                              p-4
                              text-left
                              transition
                              ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                                  : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50"
                              }
                            `}
                          >

                            <span
                              className={`
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                text-sm
                                font-black
                                ${
                                  isSelected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }
                              `}
                            >

                              {String.fromCharCode(
                                65 + index
                              )}

                            </span>


                            <span className="
                              flex-1
                              text-sm
                              font-semibold
                              leading-6
                              text-slate-700
                            ">

                              {option}

                            </span>


                            {isSelected && (

                              <CheckCircle
                                size={20}
                                className="
                                  shrink-0
                                  text-indigo-600
                                "
                              />

                            )}

                          </button>

                        );

                      }
                    )}

                  </div>

                </motion.div>

              </AnimatePresence>


              {error && (

                <div className="
                  mt-5
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-red-600
                ">

                  {error}

                </div>

              )}


              <div className="
                mt-7
                flex
                items-center
                justify-between
                gap-3
              ">

                <button
                  type="button"
                  onClick={
                    previousQuestion
                  }
                  disabled={
                    currentQuestion === 0
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-slate-600
                    shadow-sm
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >

                  <ChevronLeft size={18} />

                  Previous

                </button>


                <button
                  type="button"
                  onClick={
                    nextQuestion
                  }
                  className="
                    inline-flex
                    items-center
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
                    shadow-lg
                  "
                >

                  {currentQuestion ===
                  quiz.length - 1
                    ? "Finish Quiz"
                    : "Next Question"}

                  {currentQuestion ===
                  quiz.length - 1 ? (
                    <Trophy size={17} />
                  ) : (
                    <ChevronRight size={18} />
                  )}

                </button>

              </div>

            </div>

          </motion.section>

        </div>

      </main>

    );

  }


  // =====================================================
  // UPLOAD SCREEN
  // =====================================================

  return (

    <main className="
      min-h-screen
      bg-gradient-to-br
      from-slate-50
      via-white
      to-indigo-50
      px-4
      pb-10
      pt-20
      sm:px-6
    ">

      <div className="
        mx-auto
        max-w-5xl
      ">

        <div className="
          mb-5
          flex
          items-center
          justify-between
        ">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-slate-700
              shadow-sm
            "
          >

            <ArrowLeft size={17} />

            Dashboard

          </button>

        </div>


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
            overflow-hidden
            rounded-[2rem]
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
        >

          <div className="
            bg-gradient-to-r
            from-indigo-700
            via-violet-700
            to-purple-700
            px-6
            py-10
            text-center
            text-white
            sm:px-10
          ">

            <div className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              bg-white/10
              backdrop-blur-md
            ">

              <Brain size={40} />

            </div>


            <div className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
            ">

              <Sparkles size={15} />

              <span className="
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-white/70
              ">

                StudyMind AI

              </span>

            </div>


            <h1 className="
              mt-2
              text-3xl
              font-black
              sm:text-4xl
            ">

              AI Quiz Generator

            </h1>


            <p className="
              mx-auto
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-white/70
            ">

              Upload your study material and let
              AI create a 5-question quiz to test
              your knowledge.

            </p>

          </div>


          <div className="
            p-5
            sm:p-8
          ">

            <label
              htmlFor="quiz-pdf"
              className="
                block
                cursor-pointer
              "
            >

              <div className="
                rounded-3xl
                border-2
                border-dashed
                border-slate-200
                bg-slate-50
                p-8
                text-center
                transition
                hover:border-indigo-300
                hover:bg-indigo-50/40
                sm:p-12
              ">

                <input
                  id="quiz-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />


                <div className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-100
                  text-indigo-600
                ">

                  <Upload size={30} />

                </div>


                <h2 className="
                  mt-5
                  text-xl
                  font-black
                  text-slate-900
                ">

                  Upload your PDF

                </h2>


                <p className="
                  mt-2
                  text-sm
                  text-slate-500
                ">

                  Click here to choose your study
                  material.

                </p>


                <p className="
                  mt-2
                  text-xs
                  text-slate-400
                ">

                  PDF only • Maximum 10 MB

                </p>

              </div>

            </label>


            {file && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-2xl
                  border
                  border-indigo-100
                  bg-indigo-50
                  p-4
                "
              >

                <div className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                ">

                  <div className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-indigo-600
                    shadow-sm
                  ">

                    <FileText size={21} />

                  </div>


                  <div className="min-w-0">

                    <p className="
                      truncate
                      text-sm
                      font-bold
                      text-slate-800
                    ">

                      {file.name}

                    </p>


                    <p className="
                      mt-0.5
                      text-xs
                      text-slate-500
                    ">

                      {(
                        file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB

                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={
                    changeFile
                  }
                  className="
                    rounded-xl
                    p-2
                    text-slate-400
                    transition
                    hover:bg-white
                    hover:text-red-500
                  "
                  aria-label="Remove file"
                >

                  <XCircle size={20} />

                </button>

              </motion.div>

            )}


            {error && (

              <div className="
                mt-5
                rounded-xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                text-red-600
              ">

                {error}

              </div>

            )}


            <button
              type="button"
              onClick={
                generateQuiz
              }
              disabled={
                !file ||
                loading
              }
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                px-6
                py-4
                text-sm
                font-black
                text-white
                shadow-lg
                transition
                hover:-translate-y-0.5
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {loading ? (

                <>
                  <Loader
                    size={19}
                    className="animate-spin"
                  />

                  Generating Quiz...

                </>

              ) : (

                <>
                  <Sparkles size={19} />

                  Generate AI Quiz

                </>

              )}

            </button>


            <div className="
              mt-6
              grid
              gap-3
              sm:grid-cols-3
            ">

              <Feature
                icon={<Brain size={18} />}
                text="AI Generated"
              />

              <Feature
                icon={<FileText size={18} />}
                text="From Your Notes"
              />

              <Feature
                icon={<Trophy size={18} />}
                text="Instant Score"
              />

            </div>

          </div>

        </motion.section>

      </div>

    </main>

  );
}


// =====================================================
// RESULT CARD
// =====================================================

function ResultCard({
  icon,
  title,
  value,
}) {

  return (

    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-slate-50
      p-5
      text-center
    ">

      <div className="
        mx-auto
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        bg-indigo-100
        text-indigo-600
      ">

        {icon}

      </div>


      <p className="
        mt-3
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-slate-400
      ">

        {title}

      </p>


      <p className="
        mt-1
        text-2xl
        font-black
        text-slate-900
      ">

        {value}

      </p>

    </div>

  );
}


// =====================================================
// FEATURE
// =====================================================

function Feature({
  icon,
  text,
}) {

  return (

    <div className="
      flex
      items-center
      justify-center
      gap-2
      rounded-xl
      border
      border-slate-100
      bg-slate-50
      px-3
      py-3
      text-xs
      font-bold
      text-slate-500
    ">

      <span className="text-indigo-500">

        {icon}

      </span>

      {text}

    </div>

  );

}


export default Quiz;