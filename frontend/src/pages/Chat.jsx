import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bot,
  Brain,
  Check,
  Copy,
  FileText,
  MessageCircle,
  Paperclip,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import API from "../axios";


// =====================================================
// CHAT PAGE
// =====================================================

function Chat() {
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [copiedIndex, setCopiedIndex] = useState(null);

  const [showClearConfirm, setShowClearConfirm] =
    useState(false);

  // ===================================================
  // PDF
  // ===================================================

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [fileError, setFileError] =
    useState("");

  // ===================================================
  // LOAD USER
  // ===================================================

  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      const token =
        localStorage.getItem("token");

      if (!storedUser?.email || !token) {
        setError("Login required.");
        setLoading(false);
        return;
      }

      setUser(storedUser);

      loadChatHistory(
        storedUser.email,
        token
      );

    } catch (err) {
      console.error(
        "User Load Error:",
        err
      );

      setError(
        "Unable to load your account."
      );

      setLoading(false);
    }
  }, []);

  // ===================================================
  // LOAD CHAT HISTORY
  // ===================================================

  const loadChatHistory = async (
    email,
    token
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/ai/chat/history/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const history = Array.isArray(
        response.data?.chats
      )
        ? response.data.chats
        : [];

      const formattedMessages = [];

      // Backend returns newest first.
      // We reverse it for normal chat order.
      [...history]
        .reverse()
        .forEach((item) => {
          if (item?.question) {
            formattedMessages.push({
              role: "user",
              content: String(
                item.question
              ),
              created_at:
                item.created_at,
            });
          }

          if (item?.answer) {
            formattedMessages.push({
              role: "assistant",
              content: String(
                item.answer
              ),
              created_at:
                item.created_at,
            });
          }
        });

      setMessages(
        formattedMessages
      );

    } catch (err) {
      console.error(
        "Chat History Error:",
        err
      );

      setMessages([]);

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item?.msg ||
                "Invalid request"
            )
            .join(", ")
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to load chat history."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // SCROLL TO BOTTOM
  // ===================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    sending,
  ]);

  // ===================================================
  // PDF SELECT
  // ===================================================

  const handleFileSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileError("");
    setError("");

    // -------------------------------------------------
    // PDF NAME
    // -------------------------------------------------

    if (
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setSelectedFile(null);

      setFileError(
        "Only PDF files are allowed."
      );

      event.target.value = "";

      return;
    }

    // -------------------------------------------------
    // FILE SIZE
    // -------------------------------------------------

    const MAX_FILE_SIZE =
      10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);

      setFileError(
        "PDF file must be less than 10 MB."
      );

      event.target.value = "";

      return;
    }

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    setSelectedFile(file);
  };

  // ===================================================
  // REMOVE PDF
  // ===================================================

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ===================================================
  // SEND MESSAGE
  // ===================================================

  const sendMessage = async () => {
    const question =
      input.trim();

    if (!question || sending) {
      return;
    }

    if (!user?.email) {
      setError("Login required.");
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

    // -------------------------------------------------
    // PDF REQUIRED
    // -------------------------------------------------

    if (!selectedFile) {
      setFileError(
        "Please upload a PDF before asking a question."
      );

      return;
    }

    // -------------------------------------------------
    // USER MESSAGE
    // -------------------------------------------------

    const userMessage = {
      role: "user",
      content: question,
      created_at:
        new Date().toISOString(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");
    setError("");
    setFileError("");
    setSending(true);

    // -------------------------------------------------
    // FORM DATA
    // -------------------------------------------------

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "question",
        question
      );

      formData.append(
        "email",
        user.email
      );

      // -------------------------------------------------
      // API
      // -------------------------------------------------

      const response =
        await API.post(
          "/ai/chat",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // -------------------------------------------------
      // ANSWER
      // -------------------------------------------------

      const answer =
        response.data?.answer;

      if (
        answer === null ||
        answer === undefined ||
        String(answer).trim() === ""
      ) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      const assistantMessage = {
        role: "assistant",
        content: String(answer),
        created_at:
          response.data?.created_at ||
          new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

    } catch (err) {
      console.error(
        "Send Chat Error:",
        err
      );

      const detail =
        err.response?.data?.detail;

      let errorMessage =
        "Unable to get AI response.";

      if (Array.isArray(detail)) {
        errorMessage = detail
          .map(
            (item) =>
              item?.msg ||
              "Invalid request"
          )
          .join(", ");
      } else if (
        typeof detail === "string"
      ) {
        errorMessage = detail;
      } else if (
        err.message
      ) {
        errorMessage =
          err.message;
      }

      setError(
        errorMessage
      );

      // -------------------------------------------------
      // REMOVE TEMP USER MESSAGE IF API FAILED
      // -------------------------------------------------

      setMessages((prev) =>
        prev.filter(
          (_, index) =>
            index !==
            prev.length - 1
        )
      );

    } finally {
      setSending(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // ===================================================
  // ENTER KEY
  // ===================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  // ===================================================
  // CLEAR CHAT
  // ===================================================

  const clearChat = () => {
    setMessages([]);
    setError("");
    setShowClearConfirm(false);
  };

  // ===================================================
  // COPY MESSAGE
  // ===================================================

  const copyMessage = async (
    content,
    index
  ) => {
    try {
      await navigator.clipboard.writeText(
        String(content)
      );

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);

    } catch (err) {
      console.error(
        "Copy Error:",
        err
      );
    }
  };

  // ===================================================
  // QUICK PROMPTS
  // ===================================================

  const quickPrompts = [
    "Explain this concept in simple words.",
    "Give me a step-by-step explanation.",
    "Create a short revision summary.",
    "Give me important exam points.",
  ];

  // ===================================================
  // QUICK PROMPT
  // ===================================================

  const useQuickPrompt = (
    prompt
  ) => {
    setInput(prompt);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // ===================================================
  // LOGIN CHECK
  // ===================================================

  if (!loading && !user) {
    return (
      <main
        className="
          min-h-screen
          bg-gradient-to-br
          from-indigo-50
          via-white
          to-purple-50
          px-6
          pt-24
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[70vh]
            max-w-md
            items-center
            justify-center
          "
        >
          <div
            className="
              w-full
              rounded-3xl
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
                bg-indigo-100
                text-indigo-600
              "
            >
              <Bot size={32} />
            </div>

            <h2
              className="
                mt-5
                text-2xl
                font-black
                text-slate-900
              "
            >
              Login Required
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Please login to use
              StudyMind AI Tutor.
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

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50
        via-white
        to-indigo-50
        px-3
        pb-6
        pt-20
        sm:px-5
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-7xl
          flex-col
        "
      >
        {/* =================================================
            TOP BAR
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
            mb-4
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          "
        >
          <button
            type="button"
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
              transition
              hover:-translate-y-0.5
              hover:border-indigo-200
              hover:text-indigo-600
              hover:shadow-md
            "
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                setShowClearConfirm(true)
              }
              disabled={
                messages.length === 0
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
                text-slate-600
                shadow-sm
                transition
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Trash2 size={16} />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Clear Chat
              </span>
            </button>
          </div>
        </motion.div>

        {/* =================================================
            CHAT CONTAINER
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
            flex
            min-h-[calc(100vh-150px)]
            flex-col
            overflow-hidden
            rounded-[2rem]
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <header
            className="
              relative
              overflow-hidden
              bg-gradient-to-r
              from-indigo-700
              via-violet-700
              to-purple-700
              px-5
              py-5
              text-white
              sm:px-7
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-24
                h-56
                w-56
                rounded-full
                bg-white/10
                blur-3xl
              "
            />

            <div
              className="
                relative
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/20
                    bg-white/10
                    backdrop-blur-md
                  "
                >
                  <Brain size={28} />
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Sparkles
                      size={14}
                      className="text-indigo-200"
                    />

                    <span
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-white/60
                      "
                    >
                      StudyMind AI
                    </span>
                  </div>

                  <h1
                    className="
                      truncate
                      text-2xl
                      font-black
                      sm:text-3xl
                    "
                  >
                    AI Tutor
                  </h1>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-white/60
                      sm:text-sm
                    "
                  >
                    Your intelligent learning
                    companion
                  </p>
                </div>
              </div>

              <div
                className="
                  hidden
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-emerald-300/20
                  bg-emerald-400/10
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-emerald-200
                  sm:flex
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-emerald-300
                    shadow-[0_0_10px_rgba(110,231,183,0.8)]
                  "
                />

                AI Online
              </div>
            </div>
          </header>

          {/* =================================================
              ERROR
          ================================================= */}

          <AnimatePresence>
            {(error || fileError) && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="
                  border-b
                  border-red-100
                  bg-red-50
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-red-600
                  sm:px-7
                "
              >
                {fileError || error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div
            className="
              flex-1
              overflow-y-auto
              bg-gradient-to-b
              from-white
              to-slate-50/70
              px-3
              py-5
              sm:px-6
              sm:py-7
            "
          >
            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div
                className="
                  flex
                  min-h-[420px]
                  items-center
                  justify-center
                "
              >
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-indigo-100
                      text-indigo-600
                    "
                  >
                    <Bot
                      size={30}
                      className="animate-pulse"
                    />
                  </div>

                  <p
                    className="
                      mt-4
                      font-bold
                      text-slate-700
                    "
                  >
                    Loading your AI Tutor...
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Restoring your conversation
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
              messages.length === 0 && (
                <div
                  className="
                    flex
                    min-h-[420px]
                    flex-col
                    items-center
                    justify-center
                    px-4
                    text-center
                  "
                >
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-3xl
                      bg-gradient-to-br
                      from-indigo-100
                      to-purple-100
                      text-indigo-600
                    "
                  >
                    <Bot size={38} />
                  </motion.div>

                  <h2
                    className="
                      mt-6
                      text-2xl
                      font-black
                      text-slate-900
                      sm:text-3xl
                    "
                  >
                    What can I help you learn?
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Upload your study PDF and ask
                    questions about the content.
                  </p>

                  {/* PDF EMPTY UPLOAD */}

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      mt-7
                      flex
                      w-full
                      max-w-2xl
                      items-center
                      justify-center
                      gap-3
                      rounded-2xl
                      border-2
                      border-dashed
                      border-indigo-200
                      bg-indigo-50/60
                      px-5
                      py-5
                      text-sm
                      font-bold
                      text-indigo-700
                      transition
                      hover:border-indigo-400
                      hover:bg-indigo-50
                    "
                  >
                    <Upload size={20} />

                    Upload PDF to start chatting
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={
                      handleFileSelect
                    }
                    className="hidden"
                  />

                  {/* QUICK PROMPTS */}

                  <div
                    className="
                      mt-5
                      grid
                      w-full
                      max-w-2xl
                      grid-cols-1
                      gap-3
                      sm:grid-cols-2
                    "
                  >
                    {quickPrompts.map(
                      (prompt, index) => (
                        <motion.button
                          key={prompt}
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              index * 0.07,
                          }}
                          type="button"
                          onClick={() =>
                            useQuickPrompt(
                              prompt
                            )
                          }
                          className="
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-4
                            text-left
                            text-sm
                            font-semibold
                            text-slate-600
                            shadow-sm
                            transition
                            hover:-translate-y-0.5
                            hover:border-indigo-200
                            hover:bg-indigo-50
                            hover:text-indigo-700
                          "
                        >
                          <MessageCircle
                            size={17}
                            className="
                              mb-2
                              text-indigo-500
                            "
                          />

                          {prompt}
                        </motion.button>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* =================================================
                MESSAGE LIST
            ================================================= */}

            {!loading &&
              messages.length > 0 && (
                <div
                  className="
                    mx-auto
                    flex
                    w-full
                    max-w-4xl
                    flex-col
                    gap-5
                  "
                >
                  {messages.map(
                    (message, index) => (
                      <MessageBubble
                        key={`${index}-${message.created_at || ""}`}
                        message={message}
                        index={index}
                        onCopy={
                          copyMessage
                        }
                        copied={
                          copiedIndex ===
                          index
                        }
                      />
                    )
                  )}

                  {/* AI THINKING */}

                  {sending && (
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
                        flex
                        items-end
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-indigo-100
                          text-indigo-600
                        "
                      >
                        <Bot size={19} />
                      </div>

                      <div
                        className="
                          rounded-2xl
                          rounded-bl-md
                          border
                          border-slate-200
                          bg-white
                          px-5
                          py-4
                          shadow-sm
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >
                          <span
                            className="
                              h-2
                              w-2
                              animate-bounce
                              rounded-full
                              bg-indigo-500
                            "
                          />

                          <span
                            className="
                              h-2
                              w-2
                              animate-bounce
                              rounded-full
                              bg-indigo-500
                            "
                            style={{
                              animationDelay:
                                "120ms",
                            }}
                          />

                          <span
                            className="
                              h-2
                              w-2
                              animate-bounce
                              rounded-full
                              bg-indigo-500
                            "
                            style={{
                              animationDelay:
                                "240ms",
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div
                    ref={messagesEndRef}
                  />
                </div>
              )}
          </div>

          {/* =================================================
              QUICK PROMPTS
          ================================================= */}

          {!loading &&
            messages.length > 0 && (
              <div
                className="
                  border-t
                  border-slate-100
                  bg-white
                  px-4
                  py-3
                  sm:px-6
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    max-w-4xl
                    items-center
                    gap-2
                    overflow-x-auto
                    pb-1
                  "
                >
                  <Sparkles
                    size={15}
                    className="
                      shrink-0
                      text-indigo-500
                    "
                  />

                  {quickPrompts.map(
                    (prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() =>
                          useQuickPrompt(
                            prompt
                          )
                        }
                        className="
                          shrink-0
                          rounded-full
                          border
                          border-slate-200
                          bg-slate-50
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-slate-600
                          transition
                          hover:border-indigo-200
                          hover:bg-indigo-50
                          hover:text-indigo-600
                        "
                      >
                        {prompt}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* =================================================
              INPUT
          ================================================= */}

          <div
            className="
              border-t
              border-slate-200
              bg-white
              p-3
              sm:p-5
            "
          >
            <div
              className="
                mx-auto
                max-w-4xl
              "
            >
              {/* =================================================
                  SELECTED PDF
              ================================================= */}

              {selectedFile && (
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
                    mb-3
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-2xl
                    border
                    border-indigo-100
                    bg-indigo-50
                    px-4
                    py-3
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
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-indigo-600
                        shadow-sm
                      "
                    >
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-slate-800
                        "
                      >
                        {selectedFile.name}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          text-slate-500
                        "
                      >
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB • PDF ready
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeSelectedFile
                    }
                    disabled={sending}
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-slate-400
                      transition
                      hover:bg-red-100
                      hover:text-red-600
                      disabled:opacity-40
                    "
                    aria-label="Remove PDF"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              )}

              {/* =================================================
                  UPLOAD BUTTON + INPUT
              ================================================= */}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={
                  handleFileSelect
                }
                className="hidden"
              />

              <div
                className="
                  flex
                  items-end
                  gap-2
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-2
                  shadow-inner
                  transition
                  focus-within:border-indigo-300
                  focus-within:bg-white
                  focus-within:ring-4
                  focus-within:ring-indigo-50
                "
              >
                {/* PDF BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={sending}
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-indigo-600
                    shadow-sm
                    transition
                    hover:border-indigo-200
                    hover:bg-indigo-50
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="Upload PDF"
                  title="Upload PDF"
                >
                  <Paperclip size={19} />
                </button>

                {/* TEXT */}

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) =>
                    setInput(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={sending}
                  rows={1}
                  placeholder={
                    selectedFile
                      ? "Ask something about your PDF..."
                      : "Upload a PDF first..."
                  }
                  className="
                    max-h-32
                    min-h-[46px]
                    flex-1
                    resize-none
                    bg-transparent
                    px-3
                    py-3
                    text-sm
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                    disabled:cursor-not-allowed
                  "
                />

                {/* SEND */}

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={
                    !input.trim() ||
                    !selectedFile ||
                    sending
                  }
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-purple-600
                    text-white
                    shadow-md
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-lg
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="Send message"
                >
                  {sending ? (
                    <RotateCcw
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={19} />
                  )}
                </button>
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-3
                  px-2
                "
              >
                <p
                  className="
                    text-[10px]
                    text-slate-400
                    sm:text-xs
                  "
                >
                  Enter to send • Shift + Enter
                  for a new line
                </p>

                <p
                  className="
                    hidden
                    text-[10px]
                    text-slate-400
                    sm:block
                  "
                >
                  StudyMind AI Tutor
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* =====================================================
          CLEAR CONFIRMATION
      ===================================================== */}

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/50
              p-5
              backdrop-blur-sm
            "
            onClick={() =>
              setShowClearConfirm(false)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                w-full
                max-w-md
                rounded-3xl
                bg-white
                p-7
                shadow-2xl
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-red-500
                "
              >
                <Trash2 size={25} />
              </div>

              <h2
                className="
                  mt-5
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                Clear this conversation?
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                This will clear the messages from
                the current screen. Your saved
                chat history in the database will
                remain available.
              </p>

              <div
                className="
                  mt-6
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowClearConfirm(false)
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={clearChat}
                  className="
                    rounded-xl
                    bg-red-500
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-md
                  "
                >
                  Clear Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}


// =====================================================
// MESSAGE BUBBLE
// =====================================================

function MessageBubble({
  message,
  index,
  onCopy,
  copied,
}) {
  const isUser =
    message.role === "user";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`
        flex
        items-end
        gap-3
        ${
          isUser
            ? "justify-end"
            : "justify-start"
        }
      `}
    >
      {!isUser && (
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-indigo-100
            to-purple-100
            text-indigo-600
          "
        >
          <Bot size={19} />
        </div>
      )}

      <div
        className={`
          group
          max-w-[88%]
          sm:max-w-[75%]
          ${
            isUser
              ? "order-1"
              : ""
          }
        `}
      >
        <div
          className={`
            rounded-2xl
            px-4
            py-3.5
            text-sm
            leading-7
            ${
              isUser
                ? "rounded-br-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : message.error
                  ? "rounded-bl-md border border-red-100 bg-red-50 text-red-600"
                  : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
            }
          `}
        >
          <MessageContent
            content={
              message.content
            }
            isUser={isUser}
          />
        </div>

        {!isUser &&
          !message.error && (
            <div
              className="
                mt-1.5
                flex
                items-center
                gap-2
                px-1
                opacity-0
                transition
                group-hover:opacity-100
              "
            >
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    message.content,
                    index
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-lg
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-indigo-600
                "
              >
                {copied ? (
                  <Check size={12} />
                ) : (
                  <Copy size={12} />
                )}

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>
          )}
      </div>

      {isUser && (
        <div
          className="
            order-2
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-indigo-100
            text-indigo-600
          "
        >
          <User size={18} />
        </div>
      )}
    </motion.div>
  );
}


// =====================================================
// MESSAGE CONTENT
// =====================================================

function MessageContent({
  content,
}) {
  if (
    content === null ||
    content === undefined
  ) {
    return null;
  }

  // Prevent React object rendering error
  const safeContent =
    typeof content === "string"
      ? content
      : typeof content === "number"
        ? String(content)
        : Array.isArray(content)
          ? content
              .map((item) =>
                typeof item === "string"
                  ? item
                  : JSON.stringify(item)
              )
              .join("\n")
          : typeof content === "object"
            ? JSON.stringify(
                content,
                null,
                2
              )
            : String(content);

  const lines =
    safeContent.split("\n");

  return (
    <div
      className="
        whitespace-pre-wrap
        break-words
      "
    >
      {lines.map(
        (line, index) => (
          <span
            key={index}
            className={
              line.trim()
                ? "block"
                : "block h-3"
            }
          >
            {line}
          </span>
        )
      )}
    </div>
  );
}


export default Chat;