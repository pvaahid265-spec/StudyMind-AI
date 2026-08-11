import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Moon,
  Bell,
  Lock,
  LogOut,
  ShieldCheck,
  Settings as SettingsIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../axios";


function Settings() {

  const navigate = useNavigate();


  // =====================================================
  // SETTINGS STATE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {

    return localStorage.getItem("darkMode") === "true";

  });


  const [notifications, setNotifications] = useState(() => {

    const saved = localStorage.getItem("notifications");

    return saved !== "false";

  });


  // =====================================================
  // PASSWORD STATE
  // =====================================================

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);


  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");


  const [passwordMessage, setPasswordMessage] =
    useState("");


  const [passwordError, setPasswordError] =
    useState("");


  const [passwordLoading, setPasswordLoading] =
    useState(false);


  // =====================================================
  // LOGOUT
  // =====================================================

  const [logoutConfirm, setLogoutConfirm] =
    useState(false);


  // =====================================================
  // SAVE DARK MODE
  // =====================================================

  useEffect(() => {

    localStorage.setItem(
      "darkMode",
      darkMode
    );

  }, [darkMode]);


  // =====================================================
  // SAVE NOTIFICATIONS
  // =====================================================

  useEffect(() => {

    localStorage.setItem(
      "notifications",
      notifications
    );

  }, [notifications]);


  // =====================================================
  // DARK MODE
  // =====================================================

  const toggleDarkMode = () => {

    setDarkMode(
      (prev) => !prev
    );

  };


  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const toggleNotifications = () => {

    setNotifications(
      (prev) => !prev
    );

  };


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handlePasswordUpdate = async (e) => {

    e.preventDefault();


    setPasswordMessage("");
    setPasswordError("");


    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!currentPassword || !newPassword) {

      setPasswordError(
        "Please fill in both password fields."
      );

      return;
    }


    if (newPassword.length < 6) {

      setPasswordError(
        "New password must contain at least 6 characters."
      );

      return;
    }


    if (currentPassword === newPassword) {

      setPasswordError(
        "New password must be different from current password."
      );

      return;
    }


    // ---------------------------------------------------
    // GET USER
    // ---------------------------------------------------

    const user = JSON.parse(
      localStorage.getItem("user")
    );


    const token =
      localStorage.getItem("token");


    if (!user || !user.email) {

      setPasswordError(
        "Login required. Please login again."
      );

      return;
    }


    if (!token) {

      setPasswordError(
        "Session expired. Please login again."
      );

      return;
    }


    // ---------------------------------------------------
    // START LOADING
    // ---------------------------------------------------

    setPasswordLoading(true);


    try {

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      const response = await API.put(

        "/auth/change-password",

        {

          email: user.email,

          current_password:
            currentPassword,

          new_password:
            newPassword,
        },

        {

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        }

      );


      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setPasswordMessage(

        response.data.message ||
        "Password updated successfully 🔐"

      );


      // -------------------------------------------------
      // CLEAR INPUTS
      // -------------------------------------------------

      setCurrentPassword("");

      setNewPassword("");

      setShowCurrentPassword(false);

      setShowNewPassword(false);


    } catch (error) {

      console.log(
        "Password update error:",
        error
      );


      // -------------------------------------------------
      // BACKEND ERROR
      // -------------------------------------------------

      const message =
        error.response?.data?.detail;


      if (message) {

        setPasswordError(
          message
        );

      } else {

        setPasswordError(
          "Unable to update password. Please try again."
        );

      }

    } finally {

      setPasswordLoading(false);

    }

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logoutAll = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
      "/login";

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <main
      className={`
        min-h-screen
        px-4
        pb-16
        pt-24
        transition-colors
        duration-300

        ${
          darkMode

            ? "bg-slate-950 text-white"

            : "bg-gradient-to-br from-slate-50 via-white to-indigo-50"
        }
      `}
    >

      <div className="
        mx-auto
        w-full
        max-w-5xl
      ">


        {/* =================================================
            BACK BUTTON
        ================================================== */}

        <motion.button

          initial={{
            opacity: 0,
            x: -15
          }}

          animate={{
            opacity: 1,
            x: 0
          }}

          type="button"

          onClick={() =>
            navigate("/dashboard")
          }

          className={`
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            px-4
            py-2.5
            text-sm
            font-bold
            shadow-sm
            transition
            hover:-translate-y-0.5

            ${
              darkMode

                ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500"

                : "border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:text-indigo-600"
            }
          `}
        >

          <ArrowLeft size={18} />

          Back to Dashboard

        </motion.button>


        {/* =================================================
            HEADER
        ================================================== */}

        <motion.section

          initial={{
            opacity: 0,
            y: -20
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          className={`
            relative
            mt-7
            overflow-hidden
            rounded-[2rem]
            p-7
            shadow-xl
            sm:p-9

            ${
              darkMode

                ? "bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900"

                : "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700"
            }
          `}
        >

          <div className="
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
            relative
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
              bg-white/15
              text-white
              backdrop-blur
            ">

              <SettingsIcon
                size={32}
              />

            </div>


            <div>

              <p className="
                text-sm
                font-semibold
                text-white/70
              ">
                StudyMind AI
              </p>


              <h1 className="
                mt-1
                text-3xl
                font-extrabold
                tracking-tight
                text-white
                sm:text-4xl
              ">
                Settings
              </h1>


              <p className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-white/70
              ">
                Manage your preferences, security and
                learning experience.
              </p>

            </div>

          </div>

        </motion.section>


        {/* =================================================
            PREFERENCES
        ================================================== */}

        <SettingsSection

          title="Preferences"

          description="Customize how StudyMind AI works for you."

          darkMode={darkMode}
        >


          {/* DARK MODE */}

          <SettingRow

            icon={<Moon size={21} />}

            title="Dark Mode"

            description="Use a darker interface for comfortable viewing."

            darkMode={darkMode}
          >

            <Toggle

              enabled={darkMode}

              onClick={toggleDarkMode}

              label={
                darkMode
                  ? "ON"
                  : "OFF"
              }

            />

          </SettingRow>


          {/* NOTIFICATIONS */}

          <SettingRow

            icon={<Bell size={21} />}

            title="Learning Notifications"

            description="Receive updates about your learning activity."

            darkMode={darkMode}
          >

            <Toggle

              enabled={notifications}

              onClick={toggleNotifications}

              label={
                notifications
                  ? "ON"
                  : "OFF"
              }

            />

          </SettingRow>


        </SettingsSection>


        {/* =================================================
            SECURITY
        ================================================== */}

        <SettingsSection

          title="Security"

          description="Keep your StudyMind AI account secure."

          darkMode={darkMode}
        >


          <div
            className={`
              rounded-2xl
              border
              p-5

              ${
                darkMode

                  ? "border-slate-700 bg-slate-900"

                  : "border-gray-200 bg-gray-50/70"
              }
            `}
          >

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
                bg-indigo-100
                text-indigo-600
              ">

                <Lock size={21} />

              </div>


              <div>

                <h3 className={`
                  font-extrabold

                  ${
                    darkMode
                      ? "text-white"
                      : "text-gray-900"
                  }
                `}>
                  Change Password
                </h3>


                <p className={`
                  text-xs

                  ${
                    darkMode
                      ? "text-slate-400"
                      : "text-gray-500"
                  }
                `}>
                  Update your account password securely.
                </p>

              </div>

            </div>


            <form

              onSubmit={
                handlePasswordUpdate
              }

              className="
                mt-5
                space-y-4
              "
            >


              {/* CURRENT PASSWORD */}

              <PasswordInput

                placeholder="Current Password"

                value={
                  currentPassword
                }

                onChange={
                  setCurrentPassword
                }

                visible={
                  showCurrentPassword
                }

                setVisible={
                  setShowCurrentPassword
                }

                darkMode={
                  darkMode
                }

              />


              {/* NEW PASSWORD */}

              <PasswordInput

                placeholder="New Password"

                value={
                  newPassword
                }

                onChange={
                  setNewPassword
                }

                visible={
                  showNewPassword
                }

                setVisible={
                  setShowNewPassword
                }

                darkMode={
                  darkMode
                }

              />


              {/* UPDATE BUTTON */}

              <button

                type="submit"

                disabled={
                  passwordLoading
                }

                className="
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
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {passwordLoading ? (

                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Updating...

                  </>

                ) : (

                  <>
                    <ShieldCheck
                      size={18}
                    />

                    Update Password
                  </>

                )}

              </button>


              {/* SUCCESS MESSAGE */}

              {passwordMessage && (

                <div className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-emerald-100
                  bg-emerald-50
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-emerald-700
                ">

                  <CheckCircle2
                    size={18}
                  />

                  {passwordMessage}

                </div>

              )}


              {/* ERROR MESSAGE */}

              {passwordError && (

                <div className="
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-red-600
                ">

                  {passwordError}

                </div>

              )}


            </form>

          </div>

        </SettingsSection>


        {/* =================================================
            ACCOUNT
        ================================================== */}

        <SettingsSection

          title="Account"

          description="Manage your active StudyMind AI session."

          darkMode={darkMode}
        >

          <div
            className={`
              flex
              flex-col
              gap-5
              rounded-2xl
              border
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between

              ${
                darkMode

                  ? "border-red-900/50 bg-red-950/20"

                  : "border-red-100 bg-red-50/50"
              }
            `}
          >

            <div className="
              flex
              items-start
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
                bg-red-100
                text-red-600
              ">

                <LogOut
                  size={21}
                />

              </div>


              <div>

                <h3 className={`
                  font-extrabold

                  ${
                    darkMode
                      ? "text-white"
                      : "text-gray-900"
                  }
                `}>
                  Logout
                </h3>


                <p className={`
                  mt-1
                  text-xs
                  leading-5

                  ${
                    darkMode
                      ? "text-slate-400"
                      : "text-gray-500"
                  }
                `}>
                  Sign out from your current StudyMind AI session.
                </p>

              </div>

            </div>


            <button

              type="button"

              onClick={() =>
                setLogoutConfirm(true)
              }

              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-red-700
              "
            >

              <LogOut
                size={17}
              />

              Logout

            </button>

          </div>

        </SettingsSection>


        {/* =================================================
            FOOTER
        ================================================== */}

        <div className={`
          mt-8
          rounded-2xl
          border
          px-5
          py-5
          text-center

          ${
            darkMode

              ? "border-slate-800 bg-slate-900"

              : "border-indigo-100 bg-indigo-50/70"
          }
        `}>

          <div className="
            flex
            items-center
            justify-center
            gap-2
          ">

            <CheckCircle2

              size={17}

              className="
                text-indigo-600
              "
            />

            <p className={`
              text-sm
              font-bold

              ${
                darkMode
                  ? "text-white"
                  : "text-indigo-700"
              }
            `}>
              StudyMind AI
            </p>

          </div>


          <p className={`
            mt-1
            text-xs

            ${
              darkMode
                ? "text-slate-500"
                : "text-indigo-500"
            }
          `}>
            Learn smarter. Practice better. Improve faster.
          </p>

        </div>


      </div>


      {/* =================================================
          LOGOUT MODAL
      ================================================== */}

      {logoutConfirm && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/60
          p-4
          backdrop-blur-sm
        ">

          <motion.div

            initial={{
              opacity: 0,
              scale: 0.95
            }}

            animate={{
              opacity: 1,
              scale: 1
            }}

            className={`
              w-full
              max-w-md
              rounded-3xl
              p-7
              shadow-2xl

              ${
                darkMode
                  ? "bg-slate-900"
                  : "bg-white"
              }
            `}
          >

            <div className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-red-100
              text-red-600
            ">

              <AlertTriangle
                size={26}
              />

            </div>


            <h2 className={`
              mt-5
              text-2xl
              font-extrabold

              ${
                darkMode
                  ? "text-white"
                  : "text-gray-900"
              }
            `}>
              Logout from StudyMind AI?
            </h2>


            <p className={`
              mt-2
              text-sm
              leading-6

              ${
                darkMode
                  ? "text-slate-400"
                  : "text-gray-500"
              }
            `}>
              You will be redirected to the login page.
              Your learning data will remain safe.
            </p>


            <div className="
              mt-6
              flex
              gap-3
            ">

              <button

                type="button"

                onClick={() =>
                  setLogoutConfirm(false)
                }

                className={`
                  flex-1
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-sm
                  font-bold

                  ${
                    darkMode

                      ? "border-slate-700 text-slate-200"

                      : "border-gray-200 text-gray-700"
                  }
                `}
              >
                Cancel
              </button>


              <button

                type="button"

                onClick={
                  logoutAll
                }

                className="
                  flex-1
                  rounded-xl
                  bg-red-600
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-white
                  hover:bg-red-700
                "
              >
                Logout
              </button>

            </div>

          </motion.div>

        </div>

      )}

    </main>

  );

}


// =====================================================
// SETTINGS SECTION
// =====================================================

function SettingsSection({
  title,
  description,
  children,
  darkMode,
}) {

  return (

    <motion.section

      initial={{
        opacity: 0,
        y: 15
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      className={`
        mt-7
        rounded-3xl
        border
        p-5
        shadow-sm
        sm:p-7

        ${
          darkMode

            ? "border-slate-800 bg-slate-900"

            : "border-gray-200 bg-white"
        }
      `}
    >

      <div className="
        mb-5
      ">

        <h2 className={`
          text-xl
          font-extrabold

          ${
            darkMode
              ? "text-white"
              : "text-gray-900"
          }
        `}>
          {title}
        </h2>


        <p className={`
          mt-1
          text-sm

          ${
            darkMode
              ? "text-slate-400"
              : "text-gray-500"
          }
        `}>
          {description}
        </p>

      </div>


      <div className="
        space-y-4
      ">
        {children}
      </div>

    </motion.section>

  );

}


// =====================================================
// SETTING ROW
// =====================================================

function SettingRow({
  icon,
  title,
  description,
  children,
  darkMode,
}) {

  return (

    <div className={`
      flex
      flex-col
      gap-4
      rounded-2xl
      border
      p-5
      sm:flex-row
      sm:items-center
      sm:justify-between

      ${
        darkMode

          ? "border-slate-700 bg-slate-950"

          : "border-gray-100 bg-gray-50/70"
      }
    `}>

      <div className="
        flex
        items-center
        gap-4
      ">

        <div className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-indigo-100
          text-indigo-600
        ">
          {icon}
        </div>


        <div>

          <h3 className={`
            font-extrabold

            ${
              darkMode
                ? "text-white"
                : "text-gray-900"
            }
          `}>
            {title}
          </h3>


          <p className={`
            mt-1
            text-xs

            ${
              darkMode
                ? "text-slate-400"
                : "text-gray-500"
            }
          `}>
            {description}
          </p>

        </div>

      </div>


      {children}

    </div>

  );

}


// =====================================================
// TOGGLE
// =====================================================

function Toggle({
  enabled,
  onClick,
  label,
}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={`
        inline-flex
        min-w-[76px]
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        py-2.5
        text-xs
        font-extrabold
        transition

        ${
          enabled

            ? "bg-indigo-600 text-white shadow-sm"

            : "bg-gray-200 text-gray-600"
        }
      `}
    >

      <span className={`
        h-2
        w-2
        rounded-full

        ${
          enabled
            ? "bg-emerald-300"
            : "bg-gray-400"
        }
      `} />

      {label}

    </button>

  );

}


// =====================================================
// PASSWORD INPUT
// =====================================================

function PasswordInput({
  placeholder,
  value,
  onChange,
  visible,
  setVisible,
  darkMode,
}) {

  return (

    <div className="
      relative
    ">

      <input

        type={
          visible
            ? "text"
            : "password"
        }

        value={value}

        onChange={(e) =>
          onChange(
            e.target.value
          )
        }

        placeholder={
          placeholder
        }

        className={`
          w-full
          rounded-xl
          border
          px-4
          py-3
          pr-12
          text-sm
          outline-none
          transition
          focus:border-indigo-500
          focus:ring-2
          focus:ring-indigo-100

          ${
            darkMode

              ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"

              : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
          }
        `}
      />


      <button

        type="button"

        onClick={() =>
          setVisible(
            (prev) => !prev
          )
        }

        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-gray-400
          transition
          hover:text-indigo-600
        "
      >

        {visible ? (

          <EyeOff
            size={18}
          />

        ) : (

          <Eye
            size={18}
          />

        )}

      </button>

    </div>

  );

}


export default Settings;