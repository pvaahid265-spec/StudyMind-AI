import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import {
  Upload,
  Brain,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Home,
  RotateCcw,
  Sparkles,
  FileText,
  X,
  AlertCircle,
  ShieldCheck,
  FileCheck2,
  BookOpen,
  Zap,
  Lock,
  Clipboard,
  Download,
  ChevronRight,
  Check,
  MousePointer2,
} from "lucide-react";

import API from "../axios";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function Summary() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // =========================================================
  // FILE VALIDATION
  // =========================================================

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return "Please select a PDF file.";
    }

    const isPDF =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      return "Only PDF files are supported.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size must be less than 10 MB.";
    }

    return "";
  };

  // =========================================================
  // SELECT FILE
  // =========================================================

  const selectFile = (selectedFile) => {
    setError("");
    setSaveMessage("");

    const validationError = validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setSummary("");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    selectFile(selectedFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // DRAG & DROP
  // =========================================================

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!loading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (loading) return;

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      selectFile(droppedFile);
    }
  };

  // =========================================================
  // REMOVE FILE
  // =========================================================

  const removeFile = () => {
    if (loading) return;

    setFile(null);
    setSummary("");
    setError("");
    setSaveMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // GENERATE SUMMARY
  // =========================================================

  const handleUpload = async () => {
    setError("");
    setSaveMessage("");

    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    let user = null;

    try {
      user = JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      user = null;
    }

    if (!user?.email) {
      setError(
        "Your session has expired. Please login again."
      );

      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );

      navigate("/login");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("email", user.email);

    try {
      setLoading(true);
      setSummary("");

      // =====================================================
      // GENERATE AI SUMMARY
      // =====================================================

      const response = await API.post(
        "/ai/summarize",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const generatedSummary =
        response.data?.summary;

      if (!generatedSummary) {
        throw new Error(
          "AI did not return a summary."
        );
      }

      setSummary(generatedSummary);

      // =====================================================
      // NOTE SAVE
      // =====================================================
      //
      // IMPORTANT:
      // Backend /ai/summarize already saves the generated
      // summary into MongoDB and returns note_id.
      //
      // Therefore we DO NOT call:
      //
      // POST /notes/save
      //
      // That endpoint does not exist.
      // Calling it was causing HTTP 405.
      // =====================================================

      if (response.data?.note_id) {
        setSaveMessage(
          "Summary generated and saved to My Notes successfully."
        );
      } else {
        setSaveMessage(
          "Summary generated successfully."
        );
      }
    } catch (error) {
      console.error(
        "Summary Error:",
        error
      );

      const message =
        error.response?.data?.detail ||
        error.message ||
        "Failed to generate summary. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GENERATE ANOTHER
  // =========================================================

  const generateAnother = () => {
    setFile(null);
    setSummary("");
    setError("");
    setSaveMessage("");
    setCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // FILE SIZE
  // =========================================================

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  // =========================================================
  // COPY SUMMARY
  // =========================================================

  const copySummary = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(
        summary
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (copyError) {
      console.error(
        "Copy Error:",
        copyError
      );

      setError(
        "Unable to copy summary."
      );
    }
  };

  // =========================================================
  // DOWNLOAD SUMMARY
  // =========================================================

  const downloadSummary = () => {
    if (!summary) return;

    const blob = new Blob(
      [summary],
      {
        type: "text/markdown;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${
        file?.name?.replace(
          /\.pdf$/i,
          ""
        ) ||
        "studymind-summary"
      }-summary.md`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* BRAND */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="group flex min-w-0 items-center gap-3"
          >

            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-gradient-to-br
                from-indigo-600
                via-violet-600
                to-purple-600
                text-white
                shadow-lg
                shadow-indigo-500/20
                transition
                group-hover:scale-105
              "
            >
              <Brain size={21} />
            </div>

            <div className="min-w-0 text-left">

              <p className="truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                StudyMind
                <span className="text-indigo-600">
                  {" "}AI
                </span>
              </p>

              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Intelligent Learning Assistant
              </p>

            </div>

          </button>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2">

            <div
              className="
                hidden items-center gap-2
                rounded-full
                border border-emerald-100
                bg-emerald-50
                px-3 py-1.5
                text-xs font-bold
                text-emerald-600
                sm:flex
              "
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              AI Ready
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="
                inline-flex h-10
                items-center justify-center
                gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-3
                text-sm font-bold
                text-slate-600
                shadow-sm
                transition
                hover:border-indigo-200
                hover:bg-indigo-50
                hover:text-indigo-600
                sm:px-4
              "
            >
              <Home size={16} />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="w-full">

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          {/* BACK BUTTON */}

          <motion.div
            initial={{
              opacity: 0,
              x: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="mb-6"
          >

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="
                inline-flex items-center gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-4 py-2.5
                text-sm font-bold
                text-slate-600
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:border-indigo-200
                hover:text-indigo-600
                hover:shadow-md
              "
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

          </motion.div>

          {/* HERO */}

          <motion.section
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              relative overflow-hidden
              rounded-[30px]
              bg-slate-950
              shadow-2xl
            "
          >

            <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="pointer-events-none absolute right-1/3 top-1/2 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

            <div
              className="
                relative grid gap-8
                p-6
                sm:p-9
                lg:grid-cols-[1fr_auto]
                lg:items-center
                lg:p-11
              "
            >

              <div className="max-w-3xl">

                <div
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    border border-white/10
                    bg-white/10
                    px-3.5 py-2
                    text-xs font-bold
                    text-indigo-200
                    backdrop-blur-xl
                  "
                >
                  <Sparkles size={14} />
                  AI NOTES ANALYZER
                </div>

                <h1
                  className="
                    mt-5
                    text-3xl
                    font-black
                    leading-tight
                    tracking-tight
                    text-white
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Turn your notes into

                  <span className="block bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                    smarter summaries.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg">
                  Upload your study material and let StudyMind AI
                  transform complex content into clear,
                  structured and easy-to-understand summaries.
                </p>

              </div>

              {/* HERO SIDE CARD */}

              <div
                className="
                  hidden
                  rounded-3xl
                  border border-white/10
                  bg-white/10
                  p-5
                  backdrop-blur-xl
                  lg:block
                "
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <Zap size={22} />
                  </div>

                  <div>

                    <p className="text-xs font-medium text-slate-400">
                      Powered by
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      Artificial Intelligence
                    </p>

                  </div>

                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 size={14} />
                  Smart analysis ready
                </div>

              </div>

            </div>

          </motion.section>

          {/* UPLOAD CARD */}

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
              delay: 0.1,
              duration: 0.5,
            }}
            className="
              mt-7
              overflow-hidden
              rounded-[30px]
              border border-slate-200
              bg-white
              shadow-sm
            "
          >

            {/* CARD HEADER */}

            <div
              className="
                flex flex-col gap-4
                border-b border-slate-100
                px-5 py-5
                sm:px-7 sm:py-6
                lg:flex-row
                lg:items-center
                lg:justify-between
                lg:px-8
              "
            >

              <div>

                <div className="flex items-center gap-2.5">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BookOpen size={18} />
                  </div>

                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                    Upload Study Material
                  </h2>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Upload a PDF and let AI analyze the content.
                </p>

              </div>

              <div
                className="
                  inline-flex w-fit
                  items-center gap-2
                  rounded-full
                  border border-emerald-100
                  bg-emerald-50
                  px-3 py-1.5
                  text-xs font-bold
                  text-emerald-600
                "
              >
                <ShieldCheck size={14} />
                Secure Processing
              </div>

            </div>

            {/* UPLOAD BODY */}

            <div className="p-4 sm:p-7 lg:p-8">

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative
                  overflow-hidden
                  rounded-[26px]
                  border-2
                  border-dashed
                  px-5
                  py-10
                  text-center
                  transition-all
                  duration-300
                  sm:px-8
                  sm:py-14
                  ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50 shadow-inner"
                      : "border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/70"
                  }
                `}
              >

                {/* DRAG OVERLAY */}

                <AnimatePresence>

                  {isDragging && (
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
                        absolute inset-0 z-20
                        flex items-center justify-center
                        bg-indigo-50/90
                        backdrop-blur-sm
                      "
                    >

                      <div className="text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl">
                          <Upload size={28} />
                        </div>

                        <p className="mt-4 text-lg font-black text-indigo-700">
                          Drop your PDF here
                        </p>

                        <p className="mt-1 text-sm text-indigo-500">
                          Release to select the document
                        </p>

                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>

                {/* UPLOAD ICON */}

                {!file && (
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="
                      mx-auto
                      flex h-20 w-20
                      items-center justify-center
                      rounded-[24px]
                      bg-gradient-to-br
                      from-indigo-600
                      to-purple-600
                      text-white
                      shadow-xl
                      shadow-indigo-500/20
                      sm:h-24 sm:w-24
                    "
                  >
                    <Upload size={36} />
                  </motion.div>
                )}

                {file && (
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-emerald-50 text-emerald-600 sm:h-24 sm:w-24">
                    <FileCheck2 size={40} />
                  </div>
                )}

                {/* TITLE */}

                <div className="mt-7">

                  <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">

                    {file
                      ? "Your PDF is ready"
                      : "Upload Your Notes"}

                  </h3>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">

                    {file
                      ? "Your document has been selected successfully. Generate an AI-powered summary when you're ready."
                      : "Upload your PDF study material. StudyMind AI will analyze it and generate a concise, structured summary."}

                  </p>

                </div>

                {/* FILE PICKER */}

                {!file && (
                  <div className="mt-8">

                    <label
                      className="
                        inline-flex
                        min-h-[50px]
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-indigo-600
                        px-6 py-3
                        text-sm font-extrabold
                        text-white
                        shadow-lg
                        shadow-indigo-500/20
                        transition
                        hover:-translate-y-0.5
                        hover:bg-indigo-700
                        hover:shadow-xl
                      "
                    >

                      <FileText size={19} />

                      Choose PDF

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                    </label>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                      <MousePointer2 size={13} />
                      or drag & drop your PDF here
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      PDF only • Maximum file size 10 MB
                    </p>

                  </div>
                )}

                {/* SELECTED FILE */}

                {file && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="
                      mx-auto mt-8
                      flex w-full max-w-2xl
                      items-center gap-3
                      rounded-2xl
                      border border-indigo-100
                      bg-white
                      p-3
                      text-left
                      shadow-md
                      sm:gap-4
                      sm:p-4
                    "
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileCheck2 size={23} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p
                        title={file.name}
                        className="truncate text-sm font-extrabold text-slate-800 sm:text-base"
                      >
                        {file.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-400">

                        <span>
                          {formatFileSize(file.size)}
                        </span>

                        <span>•</span>

                        <span>
                          PDF document
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={loading}
                      aria-label="Remove selected file"
                      className="
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-xl
                        text-slate-400
                        transition
                        hover:bg-red-50
                        hover:text-red-500
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <X size={19} />
                    </button>

                  </motion.div>
                )}

                {/* ERROR */}

                <AnimatePresence>

                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                      }}
                      className="
                        mx-auto mt-5
                        flex w-full max-w-2xl
                        items-start gap-3
                        rounded-2xl
                        border border-red-100
                        bg-red-50
                        px-4 py-3
                        text-left
                      "
                    >

                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-500"
                      />

                      <p className="text-sm font-semibold leading-6 text-red-600">
                        {error}
                      </p>

                    </motion.div>
                  )}

                </AnimatePresence>

                {/* SUCCESS */}

                <AnimatePresence>

                  {saveMessage && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                      }}
                      className="
                        mx-auto mt-5
                        flex w-full max-w-2xl
                        items-start gap-3
                        rounded-2xl
                        border border-emerald-100
                        bg-emerald-50
                        px-4 py-3
                        text-left
                      "
                    >

                      <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />

                      <p className="text-sm font-semibold leading-6 text-emerald-600">
                        {saveMessage}
                      </p>

                    </motion.div>
                  )}

                </AnimatePresence>

                {/* GENERATE BUTTON */}

                <div className="mt-7 flex justify-center">

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="
                      inline-flex
                      min-h-[52px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-indigo-600
                      via-violet-600
                      to-purple-600
                      px-7 py-3.5
                      text-sm font-extrabold
                      text-white
                      shadow-lg
                      shadow-indigo-500/20
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-xl
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      disabled:hover:translate-y-0
                      sm:w-auto
                      sm:min-w-[245px]
                    "
                  >

                    {loading ? (
                      <>
                        <Loader2
                          size={20}
                          className="animate-spin"
                        />

                        AI is analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={19} />

                        Generate AI Summary
                      </>
                    )}

                  </button>

                </div>

                {/* TRUST FEATURES */}

                <div
                  className="
                    mt-8
                    flex flex-wrap
                    items-center justify-center
                    gap-x-7 gap-y-3
                    border-t border-slate-200/80
                    pt-6
                    text-xs font-semibold
                    text-slate-500
                    sm:text-sm
                  "
                >

                  <span className="flex items-center gap-2">
                    <ShieldCheck
                      size={16}
                      className="text-emerald-500"
                    />
                    Secure
                  </span>

                  <span className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500"
                    />
                    PDF only
                  </span>

                  <span className="flex items-center gap-2">
                    <FileText
                      size={16}
                      className="text-indigo-500"
                    />
                    Up to 10 MB
                  </span>

                  <span className="flex items-center gap-2">
                    <Brain
                      size={16}
                      className="text-purple-500"
                    />
                    AI Powered
                  </span>

                </div>

              </div>

            </div>

          </motion.section>

          {/* =================================================
              LOADING
          ================================================= */}

          <AnimatePresence>

            {loading && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="
                  mt-7
                  overflow-hidden
                  rounded-[30px]
                  border border-indigo-100
                  bg-white
                  p-6
                  shadow-sm
                  sm:p-8
                "
              >

                <div className="flex flex-col items-center justify-center text-center">

                  <div className="relative">

                    <div className="absolute inset-0 animate-ping rounded-2xl bg-indigo-200/50" />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

                      <Loader2
                        size={29}
                        className="animate-spin"
                      />

                    </div>

                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    Analyzing your notes
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    StudyMind AI is reading your document and
                    preparing a structured summary.
                  </p>

                  <div className="mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">

                    <motion.div
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                        h-full
                        w-1/2
                        rounded-full
                        bg-gradient-to-r
                        from-indigo-500
                        via-violet-500
                        to-purple-500
                      "
                    />

                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Lock size={13} />
                    Please don't close this page
                  </div>

                </div>

              </motion.section>
            )}

          </AnimatePresence>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <AnimatePresence>

            {summary && !loading && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="
                  mt-7
                  overflow-hidden
                  rounded-[30px]
                  border border-slate-200
                  bg-white
                  shadow-xl
                "
              >

                {/* SUMMARY HEADER */}

                <div
                  className="
                    relative overflow-hidden
                    bg-slate-950
                    px-5 py-7
                    sm:px-8 sm:py-8
                    lg:px-10
                  "
                >

                  <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />

                  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex min-w-0 items-center gap-4">

                      <div
                        className="
                          flex h-14 w-14 shrink-0
                          items-center justify-center
                          rounded-2xl
                          border border-white/10
                          bg-white/10
                          text-indigo-300
                          backdrop-blur-xl
                        "
                      >
                        <Brain size={27} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                          AI Generated
                        </p>

                        <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                          Smart Summary
                        </h2>

                        <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
                          {file?.name || "Study material"}
                        </p>

                      </div>

                    </div>

                    <div
                      className="
                        inline-flex w-fit
                        items-center gap-2
                        rounded-full
                        border border-emerald-400/20
                        bg-emerald-400/10
                        px-3 py-2
                        text-xs font-bold
                        text-emerald-300
                      "
                    >
                      <CheckCircle2 size={14} />
                      Analysis Complete
                    </div>

                  </div>

                </div>

                {/* SUMMARY DOCUMENT */}

                <div className="p-4 sm:p-6 lg:p-8">

                  <article
                    className="
                      mx-auto w-full max-w-5xl
                      overflow-hidden
                      rounded-2xl
                      border border-slate-200
                      bg-white
                      shadow-sm
                    "
                  >

                    <div className="overflow-x-auto px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">

                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1
                              className="
                                mb-6
                                border-b border-slate-200
                                pb-4
                                text-2xl
                                font-black
                                leading-tight
                                tracking-tight
                                text-slate-900
                                sm:text-3xl
                              "
                            >
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2
                              className="
                                mb-4 mt-9
                                border-b border-slate-100
                                pb-2
                                text-xl
                                font-black
                                text-slate-900
                                sm:text-2xl
                              "
                            >
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3
                              className="
                                mb-3 mt-7
                                text-lg
                                font-extrabold
                                text-indigo-700
                                sm:text-xl
                              "
                            >
                              {children}
                            </h3>
                          ),

                          p: ({ children }) => (
                            <p
                              className="
                                mb-5
                                text-sm
                                leading-7
                                text-slate-600
                                sm:text-base
                                sm:leading-8
                              "
                            >
                              {children}
                            </p>
                          ),

                          ul: ({ children }) => (
                            <ul
                              className="
                                mb-6 ml-5
                                list-disc
                                space-y-2.5
                                text-sm
                                leading-7
                                text-slate-600
                                marker:text-indigo-500
                                sm:text-base
                              "
                            >
                              {children}
                            </ul>
                          ),

                          ol: ({ children }) => (
                            <ol
                              className="
                                mb-6 ml-5
                                list-decimal
                                space-y-2.5
                                text-sm
                                leading-7
                                text-slate-600
                                marker:font-bold
                                marker:text-indigo-600
                                sm:text-base
                              "
                            >
                              {children}
                            </ol>
                          ),

                          li: ({ children }) => (
                            <li className="pl-1">
                              {children}
                            </li>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-extrabold text-slate-900">
                              {children}
                            </strong>
                          ),

                          em: ({ children }) => (
                            <em className="italic text-slate-600">
                              {children}
                            </em>
                          ),

                          blockquote: ({ children }) => (
                            <blockquote
                              className="
                                my-6
                                rounded-r-2xl
                                border-l-4 border-indigo-500
                                bg-indigo-50
                                px-5 py-4
                                text-sm
                                leading-7
                                text-slate-600
                                sm:text-base
                              "
                            >
                              {children}
                            </blockquote>
                          ),

                          hr: () => (
                            <hr className="my-8 border-slate-200" />
                          ),

                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="
                                font-bold
                                text-indigo-600
                                underline
                                decoration-indigo-200
                                underline-offset-2
                                hover:text-indigo-700
                              "
                            >
                              {children}
                            </a>
                          ),

                          code: ({
                            inline,
                            children,
                          }) => (
                            <code
                              className={
                                inline
                                  ? `
                                    rounded-md
                                    bg-slate-100
                                    px-1.5 py-0.5
                                    font-mono
                                    text-sm
                                    text-indigo-700
                                  `
                                  : `
                                    block
                                    overflow-x-auto
                                    rounded-xl
                                    bg-slate-950
                                    p-4
                                    font-mono
                                    text-sm
                                    leading-6
                                    text-slate-100
                                  `
                              }
                            >
                              {children}
                            </code>
                          ),

                          pre: ({ children }) => (
                            <pre
                              className="
                                mb-6
                                overflow-x-auto
                                rounded-xl
                                bg-slate-950
                                p-4
                                text-sm
                                leading-6
                                text-slate-100
                              "
                            >
                              {children}
                            </pre>
                          ),

                          table: ({ children }) => (
                            <div
                              className="
                                mb-6
                                w-full
                                overflow-x-auto
                                rounded-xl
                                border border-slate-200
                              "
                            >
                              <table
                                className="
                                  w-full min-w-[600px]
                                  border-collapse
                                  text-left
                                  text-sm
                                "
                              >
                                {children}
                              </table>
                            </div>
                          ),

                          thead: ({ children }) => (
                            <thead className="bg-slate-50 text-slate-800">
                              {children}
                            </thead>
                          ),

                          th: ({ children }) => (
                            <th
                              className="
                                border-b border-slate-200
                                px-4 py-3
                                font-extrabold
                              "
                            >
                              {children}
                            </th>
                          ),

                          td: ({ children }) => (
                            <td
                              className="
                                border-b border-slate-100
                                px-4 py-3
                                text-slate-600
                              "
                            >
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {summary}
                      </ReactMarkdown>

                    </div>

                  </article>

                </div>

                {/* SUMMARY ACTIONS */}

                <div
                  className="
                    flex flex-col gap-3
                    border-t border-slate-100
                    px-5 py-5
                    sm:flex-row sm:flex-wrap
                    sm:px-8 sm:py-6
                    lg:px-10
                  "
                >

                  {/* COPY */}

                  <button
                    type="button"
                    onClick={copySummary}
                    className="
                      inline-flex min-h-[48px]
                      flex-1
                      items-center justify-center gap-2
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-5 py-3
                      text-sm font-bold
                      text-slate-700
                      transition
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-600
                      sm:flex-none
                    "
                  >

                    {copied ? (
                      <Check size={18} />
                    ) : (
                      <Clipboard size={18} />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy Summary"}

                  </button>

                  {/* EXPORT */}

                  <button
                    type="button"
                    onClick={downloadSummary}
                    className="
                      inline-flex min-h-[48px]
                      flex-1
                      items-center justify-center gap-2
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-5 py-3
                      text-sm font-bold
                      text-slate-700
                      transition
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-600
                      sm:flex-none
                    "
                  >
                    <Download size={18} />
                    Export
                  </button>

                  {/* GENERATE AGAIN */}

                  <button
                    type="button"
                    onClick={generateAnother}
                    className="
                      inline-flex min-h-[48px]
                      flex-1
                      items-center justify-center gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-indigo-600
                      to-purple-600
                      px-6 py-3
                      text-sm font-extrabold
                      text-white
                      shadow-md
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      sm:flex-none
                    "
                  >
                    <RotateCcw size={18} />
                    Generate Another
                  </button>

                  {/* DASHBOARD */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard")
                    }
                    className="
                      inline-flex min-h-[48px]
                      flex-1
                      items-center justify-center gap-2
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-6 py-3
                      text-sm font-bold
                      text-slate-700
                      transition
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-600
                      sm:flex-none
                    "
                  >
                    <Home size={18} />

                    Dashboard

                    <ChevronRight
                      size={16}
                      className="hidden sm:block"
                    />
                  </button>

                </div>

              </motion.section>
            )}

          </AnimatePresence>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-12 border-t border-slate-200 bg-white">

        <div
          className="
            mx-auto flex w-full max-w-7xl
            flex-col gap-4
            px-4 py-7
            sm:px-6
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-8
          "
        >

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Brain size={18} />
            </div>

            <div>

              <p className="text-sm font-extrabold text-slate-800">
                StudyMind AI
              </p>

              <p className="text-xs text-slate-400">
                Learn smarter. Study better.
              </p>

            </div>

          </div>

          <div
            className="
              flex flex-wrap
              items-center
              gap-x-4 gap-y-2
              text-xs font-medium
              text-slate-400
            "
          >

            <span>
              AI Powered Learning
            </span>

            <span className="hidden sm:inline">
              •
            </span>

            <span>
              Secure PDF Processing
            </span>

            <span className="hidden sm:inline">
              •
            </span>

            <span>
              © 2026 StudyMind AI
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Summary;