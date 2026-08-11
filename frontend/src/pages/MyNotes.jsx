import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileDown,
  FileText,
  Loader,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

import API from "../axios";


function MyNotes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedNote, setSelectedNote] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);


  // =====================================================
  // LOAD NOTES
  // =====================================================

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    const token = localStorage.getItem("token");

    if (!user?.email || !token) {
      setLoading(false);
      return;
    }

    loadNotes(user.email);
  }, []);


  const loadNotes = async (email) => {
    try {
      setLoading(true);

      const response = await API.get(
        `/notes/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const responseNotes =
        response.data?.notes;

      setNotes(
        Array.isArray(responseNotes)
          ? responseNotes
          : []
      );

    } catch (error) {
      console.error(
        "Load Notes Error:",
        error
      );

      setNotes([]);

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // DELETE NOTE
  // =====================================================

  const deleteNote = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await API.delete(
        `/notes/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNotes((prev) =>
        prev.filter(
          (note) => String(note._id) !== String(id)
        )
      );

      if (
        selectedNote &&
        String(selectedNote._id) === String(id)
      ) {
        closeSummary();
      }

    } catch (error) {
      console.error(
        "Delete Note Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Unable to delete this note."
      );

    } finally {
      setActionLoading(null);
    }
  };


  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  const toggleFavorite = async (note) => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!user?.email) {
        alert("Login required.");
        return;
      }

      setActionLoading(
        `favorite-${note._id}`
      );

      const response = await API.put(
        `/notes/${note._id}/favorite`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const newFavorite =
        response.data?.favorite;

      setNotes((prev) =>
        prev.map((item) =>
          String(item._id) === String(note._id)
            ? {
                ...item,
                favorite:
                  typeof newFavorite === "boolean"
                    ? newFavorite
                    : !Boolean(item.favorite),
              }
            : item
        )
      );

      if (
        selectedNote &&
        String(selectedNote._id) === String(note._id)
      ) {
        setSelectedNote((prev) => ({
          ...prev,
          favorite:
            typeof newFavorite === "boolean"
              ? newFavorite
              : !Boolean(prev.favorite),
        }));
      }

    } catch (error) {
      console.error(
        "Favorite Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Unable to update favorite."
      );

    } finally {
      setActionLoading(null);
    }
  };


  // =====================================================
  // DOWNLOAD TXT
  // =====================================================

  const downloadTXT = (note) => {
    const content = `
StudyMind AI
AI Generated Study Summary

File:
${note.filename || "Study Note"}

Date:
${formatDate(note.uploaded_at)}

----------------------------------------

SUMMARY

${stripMarkdown(note.summary || "")}
`;

    const blob = new Blob(
      [content],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${removeExtension(
        note.filename || "study-note"
      )}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const downloadPDF = (note) => {
    const pdf = new jsPDF();

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 20;

    pdf.setFontSize(18);

    pdf.text(
      "StudyMind AI",
      margin,
      20
    );

    pdf.setFontSize(14);

    pdf.text(
      "AI Generated Study Summary",
      margin,
      30
    );

    pdf.setFontSize(11);

    pdf.text(
      `File: ${note.filename || "Study Note"}`,
      margin,
      42
    );

    pdf.text(
      `Date: ${formatDate(
        note.uploaded_at
      )}`,
      margin,
      50
    );

    const summaryText =
      stripMarkdown(
        note.summary || ""
      );

    const lines =
      pdf.splitTextToSize(
        summaryText,
        pageWidth - margin * 2
      );

    let y = 65;

    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(
        line,
        margin,
        y
      );

      y += 7;
    });

    pdf.save(
      `${removeExtension(
        note.filename || "study-note"
      )}.pdf`
    );
  };


  // =====================================================
  // OPEN SUMMARY
  // =====================================================

  const openSummary = (note) => {
    setSelectedNote(note);
    setShowSummary(true);
  };


  const closeSummary = () => {
    setShowSummary(false);
    setSelectedNote(null);
  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredNotes = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return notes.filter((note) => {
      const filename =
        note.filename?.toLowerCase() || "";

      const summary =
        note.summary?.toLowerCase() || "";

      const searchMatch =
        !normalizedSearch ||
        filename.includes(
          normalizedSearch
        ) ||
        summary.includes(
          normalizedSearch
        );

      if (!searchMatch) {
        return false;
      }

      if (filter === "favorites") {
        return Boolean(note.favorite);
      }

      if (filter === "recent") {
        const uploaded =
          new Date(note.uploaded_at);

        const now =
          new Date();

        const difference =
          now - uploaded;

        const sevenDays =
          7 *
          24 *
          60 *
          60 *
          1000;

        return (
          difference >= 0 &&
          difference <= sevenDays
        );
      }

      return true;
    });
  }, [
    notes,
    search,
    filter,
  ]);


  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    const now =
      new Date();

    const recentCount =
      notes.filter((note) => {
        const uploaded =
          new Date(
            note.uploaded_at
          );

        const difference =
          now - uploaded;

        return (
          difference >= 0 &&
          difference <=
            7 *
            24 *
            60 *
            60 *
            1000
        );
      }).length;

    return {
      total: notes.length,

      favorites:
        notes.filter(
          (note) =>
            Boolean(note.favorite)
        ).length,

      recent: recentCount,
    };
  }, [notes]);


  // =====================================================
  // LOGIN CHECK
  // =====================================================

  const token =
    localStorage.getItem("token");

  const user =
    JSON.parse(
      localStorage.getItem("user") || "null"
    );


  if (!token || !user?.email) {
    return (
      <main className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gradient-to-br
        from-indigo-50
        via-white
        to-purple-50
        px-6
      ">
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-10
          text-center
          max-w-md
          w-full
        ">
          <div className="
            mx-auto
            w-16
            h-16
            rounded-2xl
            bg-indigo-100
            text-indigo-600
            flex
            items-center
            justify-center
          ">
            <BookOpen size={32} />
          </div>

          <h2 className="
            text-2xl
            font-bold
            mt-5
          ">
            Login Required
          </h2>

          <p className="
            text-gray-500
            mt-2
          ">
            Please login to access your notes.
          </p>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="
              mt-6
              px-6
              py-3
              rounded-xl
              bg-indigo-600
              text-white
              font-bold
            "
          >
            Login
          </button>
        </div>
      </main>
    );
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <main className="
        mx-auto
        w-full
        max-w-7xl
        px-4
        pb-16
        pt-24
        sm:px-6
        lg:px-8
      ">

        {/* BACK BUTTON */}

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


        {/* HERO */}

        <motion.section
          initial={{
            opacity: 0,
            y: -25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-gradient-to-r
            from-indigo-600
            via-violet-600
            to-purple-700
            px-6
            py-8
            text-white
            shadow-xl
            sm:px-9
            sm:py-10
            lg:px-12
            lg:py-11
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
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            <div className="
              flex
              items-center
              gap-5
            ">
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
                <BookOpen size={34} />
              </div>

              <div>
                <div className="
                  mb-1
                  flex
                  items-center
                  gap-2
                ">
                  <span className="
                    text-sm
                    font-medium
                    text-white/70
                  ">
                    StudyMind AI
                  </span>

                  <span className="
                    h-1
                    w-1
                    rounded-full
                    bg-white/40
                  " />

                  <span className="
                    text-sm
                    text-white/60
                  ">
                    Intelligent Learning
                  </span>
                </div>

                <h1 className="
                  text-3xl
                  font-extrabold
                  tracking-tight
                  sm:text-4xl
                  lg:text-5xl
                ">
                  My Notes
                </h1>

                <p className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-white/75
                  sm:text-base
                ">
                  Manage, review and download
                  all your AI-generated study
                  summaries in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/summary")
              }
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
              <Sparkles size={18} />
              Generate New Summary
            </button>
          </div>
        </motion.section>


        {/* STATS */}

        <div className="
          mt-7
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        ">
          <StatsCard
            icon={<FileText size={22} />}
            title="Total Notes"
            value={stats.total}
            description="Saved study summaries"
          />

          <StatsCard
            icon={<Star size={22} />}
            title="Favorites"
            value={stats.favorites}
            description="Important notes saved"
            iconStyle="yellow"
          />

          <StatsCard
            icon={<Calendar size={22} />}
            title="Recent Uploads"
            value={stats.recent}
            description="Added within 7 days"
            iconStyle="green"
          />
        </div>


        {/* SEARCH */}

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
          }}
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

            <div className="
              relative
              w-full
              lg:max-w-xl
            ">
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
                placeholder="Search notes by filename or content..."
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
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={filter === "favorites"}
                onClick={() =>
                  setFilter("favorites")
                }
                activeClass="yellow"
              >
                <Star size={15} />
                Favorites
              </FilterButton>

              <FilterButton
                active={filter === "recent"}
                onClick={() =>
                  setFilter("recent")
                }
                activeClass="green"
              >
                <Calendar size={15} />
                Recent
              </FilterButton>
            </div>
          </div>
        </motion.section>


        {/* RESULT HEADER */}

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
                font-bold
                text-gray-900
              ">
                Your Notes
              </h2>

              <p className="
                mt-1
                text-sm
                text-gray-500
              ">
                {filteredNotes.length}{" "}
                {filteredNotes.length === 1
                  ? "note"
                  : "notes"}{" "}
                available
              </p>
            </div>

            {search && (
              <p className="
                text-sm
                text-gray-500
              ">
                Searching for{" "}
                <span className="
                  font-semibold
                  text-indigo-600
                ">
                  "{search}"
                </span>
              </p>
            )}
          </div>
        )}


        {/* LOADING */}

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
              className="
                animate-spin
                text-indigo-600
              "
            />

            <p className="
              mt-4
              font-semibold
              text-gray-700
            ">
              Loading your notes...
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


        {/* EMPTY */}

        {!loading &&
          filteredNotes.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
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
                <FileText size={36} />
              </div>

              <h3 className="
                mt-6
                text-2xl
                font-bold
                text-gray-900
              ">
                {search || filter !== "all"
                  ? "No Notes Found"
                  : "Your Notes Library Is Empty"}
              </h3>

              <p className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-gray-500
              ">
                {search || filter !== "all"
                  ? "Try changing your search or filter to find your notes."
                  : "Upload your study material and generate an AI summary to see it here."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/summary")
                }
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
                <Sparkles size={18} />
                Generate AI Summary
              </button>
            </motion.div>
          )}


        {/* NOTES */}

        {!loading &&
          filteredNotes.length > 0 && (
            <div className="
              mt-6
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            ">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onView={() =>
                      openSummary(note)
                    }
                    onFavorite={() =>
                      toggleFavorite(note)
                    }
                    onTXT={() =>
                      downloadTXT(note)
                    }
                    onPDF={() =>
                      downloadPDF(note)
                    }
                    onDelete={() =>
                      deleteNote(note._id)
                    }
                    loading={
                      actionLoading === note._id ||
                      actionLoading ===
                        `favorite-${note._id}`
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}


        {/* FOOTER */}

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
            font-medium
            text-indigo-700
          ">
            StudyMind AI
          </p>

          <p className="
            mt-1
            text-xs
            text-indigo-500
          ">
            Learn smarter.
            Practice better.
            Improve faster.
          </p>
        </div>

      </main>


      {/* =================================================
          SUMMARY MODAL
      ================================================= */}

      <AnimatePresence>
        {showSummary && selectedNote && (
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
            onClick={closeSummary}
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
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                flex
                max-h-[90vh]
                w-full
                max-w-4xl
                flex-col
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-2xl
              "
            >

              {/* HEADER */}

              <div className="
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
              ">
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
                    bg-white/15
                  ">
                    <FileText size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="
                      text-xs
                      font-medium
                      text-white/60
                    ">
                      AI Generated Summary
                    </p>

                    <h3
                      className="
                        truncate
                        text-lg
                        font-bold
                        sm:text-xl
                      "
                      title={
                        selectedNote.filename
                      }
                    >
                      {selectedNote.filename}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeSummary}
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
                  aria-label="Close summary"
                >
                  <X size={20} />
                </button>
              </div>


              {/* BODY */}

              <div className="
                flex-1
                overflow-y-auto
                px-5
                py-6
                sm:px-8
                sm:py-8
              ">
                <div className="
                  mb-6
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  text-xs
                  text-gray-500
                  sm:text-sm
                ">
                  <span className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    bg-gray-100
                    px-3
                    py-2
                  ">
                    <Calendar size={15} />
                    {formatDate(
                      selectedNote.uploaded_at
                    )}
                  </span>

                  {selectedNote.favorite && (
                    <span className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-yellow-50
                      px-3
                      py-2
                      font-semibold
                      text-yellow-600
                    ">
                      <Star
                        size={15}
                        fill="currentColor"
                      />
                      Favorite
                    </span>
                  )}
                </div>

                <article className="
                  whitespace-pre-wrap
                  break-words
                  text-sm
                  leading-7
                  text-gray-700
                  sm:text-base
                  sm:leading-8
                ">
                  {selectedNote.summary ||
                    "No summary content available."}
                </article>
              </div>


              {/* FOOTER */}

              <div className="
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
              ">
                <button
                  type="button"
                  onClick={() =>
                    downloadTXT(
                      selectedNote
                    )
                  }
                  className="
                    inline-flex
                    min-h-[46px]
                    items-center
                    justify-center
                    gap-2
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
                    hover:border-indigo-200
                    hover:text-indigo-600
                  "
                >
                  <Download size={17} />
                  TXT
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadPDF(
                      selectedNote
                    )
                  }
                  className="
                    inline-flex
                    min-h-[46px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-indigo-700
                  "
                >
                  <FileDown size={17} />
                  PDF
                </button>

                <button
                  type="button"
                  onClick={closeSummary}
                  className="
                    inline-flex
                    min-h-[46px]
                    items-center
                    justify-center
                    gap-2
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
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


// =====================================================
// NOTE CARD
// =====================================================

function NoteCard({
  note,
  onView,
  onFavorite,
  onTXT,
  onPDF,
  onDelete,
  loading,
}) {
  const summaryPreview =
    stripMarkdown(
      note.summary || ""
    );

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        group
        flex
        min-h-[360px]
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-shadow
        hover:shadow-xl
      "
    >

      {/* TOP */}

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
              <FileText size={23} />
            </div>

            <div className="min-w-0">
              <h3
                className="
                  truncate
                  text-sm
                  font-bold
                  text-gray-900
                "
                title={note.filename}
              >
                {note.filename}
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
                  note.uploaded_at
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onFavorite}
            disabled={loading}
            aria-label={
              note.favorite
                ? "Remove favorite"
                : "Add favorite"
            }
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              transition

              ${
                note.favorite
                  ? "bg-yellow-100 text-yellow-500"
                  : "bg-white text-gray-400 hover:bg-yellow-50 hover:text-yellow-500"
              }

              disabled:cursor-not-allowed
              disabled:opacity-50
            `}
          >
            <Star
              size={18}
              fill={
                note.favorite
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        </div>
      </div>


      {/* CONTENT */}

      <div className="
        flex
        flex-1
        flex-col
        p-5
      ">
        <div className="
          mb-5
          flex
          items-center
          gap-2
        ">
          <span className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            bg-indigo-50
            px-2.5
            py-1.5
            text-xs
            font-semibold
            text-indigo-600
          ">
            <Sparkles size={13} />
            AI Summary
          </span>

          {note.favorite && (
            <span className="
              rounded-lg
              bg-yellow-50
              px-2.5
              py-1.5
              text-xs
              font-semibold
              text-yellow-600
            ">
              Saved
            </span>
          )}
        </div>

        <p className="
          line-clamp-5
          flex-1
          text-sm
          leading-7
          text-gray-600
        ">
          {summaryPreview ||
            "No summary content available."}
        </p>


        {/* VIEW */}

        <button
          type="button"
          onClick={onView}
          className="
            mt-5
            inline-flex
            min-h-[46px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-indigo-600
            to-purple-600
            px-4
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
          <Eye size={17} />
          View Summary
        </button>


        {/* ACTIONS */}

        <div className="
          mt-3
          grid
          grid-cols-3
          gap-2
        ">
          <SmallAction
            onClick={onTXT}
            icon={
              <Download size={15} />
            }
            label="TXT"
          />

          <SmallAction
            onClick={onPDF}
            icon={
              <FileDown size={15} />
            }
            label="PDF"
          />

          <SmallAction
            onClick={onDelete}
            icon={
              <Trash2 size={15} />
            }
            label="Delete"
            danger
          />
        </div>
      </div>

    </motion.article>
  );
}


// =====================================================
// STATS CARD
// =====================================================

function StatsCard({
  icon,
  title,
  value,
  description,
  iconStyle = "indigo",
}) {
  const styles = {
    indigo:
      "from-indigo-600 to-purple-600",

    yellow:
      "from-yellow-400 to-orange-500",

    green:
      "from-emerald-500 to-green-600",
  };

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
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
      <div className="
        flex
        items-center
        gap-4
      ">
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            text-white
            shadow-sm
            ${styles[iconStyle]}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="
            text-sm
            font-medium
            text-gray-500
          ">
            {title}
          </p>

          <p className="
            mt-0.5
            text-2xl
            font-extrabold
            text-gray-900
          ">
            {value}
          </p>
        </div>
      </div>

      <p className="
        mt-4
        text-xs
        text-gray-400
      ">
        {description}
      </p>
    </motion.div>
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
  const activeStyles = {
    indigo:
      "bg-indigo-600 text-white shadow-sm",

    yellow:
      "bg-yellow-500 text-white shadow-sm",

    green:
      "bg-emerald-500 text-white shadow-sm",
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
            ? activeStyles[activeClass]
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
      `}
    >
      {children}
    </button>
  );
}


// =====================================================
// SMALL ACTION
// =====================================================

function SmallAction({
  onClick,
  icon,
  label,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        min-h-[42px]
        items-center
        justify-center
        gap-1.5
        rounded-xl
        border
        px-2
        py-2
        text-xs
        font-bold
        transition

        ${
          danger
            ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}


// =====================================================
// HELPERS
// =====================================================

function formatDate(date) {
  if (!date) {
    return "Unknown date";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "Unknown date";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function removeExtension(
  filename = ""
) {
  return filename.replace(
    /\.pdf$/i,
    ""
  );
}


function stripMarkdown(
  text = ""
) {
  return text
    .replace(
      /[#*_>`~]/g,
      ""
    )
    .replace(
      /\[(.*?)\]\(.*?\)/g,
      "$1"
    )
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}


export default MyNotes;