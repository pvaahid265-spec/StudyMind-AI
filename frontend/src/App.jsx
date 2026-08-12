import React, { lazy, Suspense } from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import AIDemo from "./components/AIDemo";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// PAGES - LAZY LOADED
// =====================================================

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Summary = lazy(() => import("./pages/Summary"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Chat = lazy(() => import("./pages/Chat"));
const MyNotes = lazy(() => import("./pages/MyNotes"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Lesson = lazy(() => import("./pages/Lesson"));

// =====================================================
// LOADING SCREEN
// =====================================================

function PageLoader() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-50
        px-5
      "
    >
      <div className="text-center">

        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-indigo-600
            to-violet-600
            text-lg
            font-black
            text-white
            shadow-lg
            shadow-indigo-200
          "
        >
          S
        </div>

        <div className="mt-5">

          <div
            className="
              mx-auto
              h-7
              w-7
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-indigo-600
            "
          />

        </div>

        <p
          className="
            mt-4
            text-sm
            font-semibold
            text-slate-500
          "
        >
          Loading StudyMind AI...
        </p>

      </div>
    </main>
  );
}

// =====================================================
// HOME PAGE
// =====================================================

function HomePage() {
  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-slate-50
        text-slate-900
      "
    >
      <Navbar />

      <main>
        <Hero />

        <Features />

        <AIDemo />
      </main>

      <Footer />
    </div>
  );
}

// =====================================================
// PAGE NOT FOUND
// =====================================================

function NotFound() {
  const location = useLocation();

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-slate-50
        px-5
        py-12
      "
    >

      {/* Background decoration */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-32
          h-72
          w-72
          rounded-full
          bg-indigo-200/30
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-32
          h-80
          w-80
          rounded-full
          bg-violet-200/30
          blur-3xl
        "
      />

      {/* Card */}

      <div
        className="
          relative
          w-full
          max-w-lg
          rounded-[2rem]
          border
          border-slate-200
          bg-white
          p-8
          text-center
          shadow-xl
          sm:p-10
        "
      >

        {/* Logo */}

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-indigo-600
            to-violet-600
            text-xl
            font-black
            text-white
            shadow-lg
            shadow-indigo-200
          "
        >
          S
        </div>

        {/* Brand */}

        <p
          className="
            mt-5
            text-xs
            font-black
            uppercase
            tracking-[0.2em]
            text-indigo-600
          "
        >
          StudyMind AI
        </p>

        {/* Error */}

        <h1
          className="
            mt-2
            text-6xl
            font-black
            tracking-tight
            text-slate-900
            sm:text-7xl
          "
        >
          404
        </h1>

        <h2
          className="
            mt-3
            text-xl
            font-black
            text-slate-900
          "
        >
          Page not found
        </h2>

        <p
          className="
            mx-auto
            mt-2
            max-w-md
            text-sm
            leading-6
            text-slate-500
          "
        >
          The page you are looking for
          doesn't exist or may have been
          moved.
        </p>

        {/* Current path */}

        <div
          className="
            mx-auto
            mt-5
            max-w-full
            overflow-hidden
            rounded-xl
            border
            border-slate-100
            bg-slate-50
            px-4
            py-2.5
          "
        >
          <p
            className="
              truncate
              text-xs
              font-semibold
              text-slate-400
            "
          >
            {location.pathname}
          </p>
        </div>

        {/* Actions */}

        <div
          className="
            mt-7
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:justify-center
          "
        >

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-slate-700
              transition
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:text-indigo-600
            "
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={() =>
              window.location.replace("/")
            }
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-r
              from-indigo-600
              to-violet-600
              px-5
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
            Go Home
          </button>

        </div>

      </div>
    </main>
  );
}

// =====================================================
// PROTECTED PAGE WRAPPER
// =====================================================

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <Suspense fallback={<PageLoader />}>

      <Routes>

        {/* =================================================
            PUBLIC HOME
        ================================================= */}

        <Route
          path="/"
          element={<HomePage />}
        />

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            MAIN DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedPage>
              <Dashboard />
            </ProtectedPage>
          }
        />

        {/* =================================================
            LEARNING
        ================================================= */}

        <Route
          path="/lesson"
          element={
            <ProtectedPage>
              <Lesson />
            </ProtectedPage>
          }
        />

        <Route
          path="/summary"
          element={
            <ProtectedPage>
              <Summary />
            </ProtectedPage>
          }
        />

        <Route
          path="/quiz"
          element={
            <ProtectedPage>
              <Quiz />
            </ProtectedPage>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedPage>
              <Chat />
            </ProtectedPage>
          }
        />

        {/* =================================================
            KNOWLEDGE
        ================================================= */}

        <Route
          path="/my-notes"
          element={
            <ProtectedPage>
              <MyNotes />
            </ProtectedPage>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedPage>
              <Analytics />
            </ProtectedPage>
          }
        />

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedPage>
              <Profile />
            </ProtectedPage>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedPage>
              <Settings />
            </ProtectedPage>
          }
        />

        {/* =================================================
            404
        ================================================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </Suspense>
  );
}

export default App;