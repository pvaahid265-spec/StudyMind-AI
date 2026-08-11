import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  Brain,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Sparkles,
  User,
  X,
  Settings,
  BarChart3,
  CheckCircle2,
  Trash2,
  Clock3,
  BookOpen,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import API from "../axios";


// =====================================================
// NAVBAR
// =====================================================

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // ===================================================
  // USER
  // ===================================================

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  });

  const token = localStorage.getItem("token");

  // ===================================================
  // LOAD USER
  // ===================================================

  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        setUser(savedUser || null);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener(
      "storage",
      loadUser
    );

    window.addEventListener(
      "userUpdated",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadUser
      );

      window.removeEventListener(
        "userUpdated",
        loadUser
      );
    };
  }, [location.pathname]);

  // ===================================================
  // LOAD NOTIFICATIONS
  // ===================================================

  const loadNotifications = async () => {
    if (!user?.email || !token) {
      setNotifications([]);
      return;
    }

    try {
      setLoadingNotifications(true);

      const response = await API.get(
        `/notifications/${encodeURIComponent(
          user.email
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(
        Array.isArray(
          response.data?.notifications
        )
          ? response.data.notifications
          : []
      );
    } catch (error) {
      console.error(
        "Notification Load Error:",
        error
      );

      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // ===================================================
  // NOTIFICATION EFFECT
  // ===================================================

  useEffect(() => {
    if (token && user?.email) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [token, user?.email]);

  // ===================================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  // ===================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ===================================================
  // CLOSE MENUS ON ROUTE CHANGE
  // ===================================================

  useEffect(() => {
    setMobileOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // ===================================================
  // FEATURES
  // ===================================================

  const goToFeatures = () => {
    setMobileOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);

    if (location.pathname === "/") {
      const section =
        document.getElementById("features");

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    navigate("/");

    setTimeout(() => {
      const section =
        document.getElementById("features");

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);
  };

  // ===================================================
  // MARK NOTIFICATION READ
  // ===================================================

  const markAsRead = async (id) => {
    if (!token) return;

    try {
      await API.put(
        `/notifications/read/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Mark Notification Error:",
        error
      );
    }
  };

  // ===================================================
  // DELETE NOTIFICATION
  // ===================================================

  const deleteNotification = async (id) => {
    if (!token) return;

    try {
      await API.delete(
        `/notifications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.filter(
          (item) => item._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );
    }
  };

  // ===================================================
  // MARK ALL READ
  // ===================================================

  const markAllAsRead = async () => {
    if (!token) return;

    const unread =
      notifications.filter(
        (item) => !item.read
      );

    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((item) =>
          API.put(
            `/notifications/read/${item._id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark All Read Error:",
        error
      );
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setNotifications([]);

    setMobileOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);

    window.dispatchEvent(
      new Event("userUpdated")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ===================================================
  // ACTIVE LINK
  // ===================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path;
  };

  // ===================================================
  // USER DATA
  // ===================================================

  const userName =
    user?.name?.trim() || "Student";

  const userEmail =
    user?.email || "";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();

  const unreadCount =
    notifications.filter(
      (item) => !item.read
    ).length;

  // ===================================================
  // APPLICATION LINKS
  // ===================================================

  const appLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "AI Summary",
      path: "/summary",
      icon: FileText,
    },

    {
      label: "Quiz",
      path: "/quiz",
      icon: Brain,
    },

    {
      label: "AI Tutor",
      path: "/chat",
      icon: MessageCircle,
    },

    {
      label: "My Notes",
      path: "/my-notes",
      icon: BookOpen,
    },

    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav
        className="
          fixed
          inset-x-0
          top-0
          z-50
          border-b
          border-slate-200/80
          bg-white/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[72px]
            w-full
            max-w-[1440px]
            items-center
            justify-between
            gap-4
            px-4
            sm:px-6
            lg:px-8
          "
        >

          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            to="/"
            className="
              group
              flex
              shrink-0
              items-center
              gap-2.5
            "
          >
            <div
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                bg-gradient-to-br
                from-indigo-600
                via-violet-600
                to-purple-600
                text-white
                shadow-md
                shadow-indigo-200/70
                transition
                duration-300
                group-hover:scale-105
              "
            >
              <Sparkles size={19} />

              <div
                className="
                  absolute
                  inset-0
                  bg-white/10
                  opacity-0
                  transition
                  group-hover:opacity-100
                "
              />
            </div>

            <div className="hidden sm:block">
              <p
                className="
                  text-[17px]
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                StudyMind
                <span
                  className="
                    bg-gradient-to-r
                    from-indigo-600
                    to-purple-600
                    bg-clip-text
                    text-transparent
                  "
                >
                  AI
                </span>
              </p>

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                "
              >
                Intelligent Learning
              </p>
            </div>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div
            className="
              hidden
              min-w-0
              flex-1
              items-center
              justify-center
              lg:flex
            "
          >
            <div
              className="
                flex
                items-center
                gap-0.5
                rounded-2xl
                border
                border-slate-100
                bg-slate-50/70
                p-1
              "
            >
              {/* HOME */}

              <NavLink
                to="/"
                label="Home"
                active={isActive("/")}
              />

              {/* FEATURES */}

              <button
                type="button"
                onClick={goToFeatures}
                className="
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-white
                  hover:text-indigo-600
                "
              >
                Features
              </button>

              {/* APP LINKS */}

              {token && (
                <>
                  {appLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={item.label}
                        className={`
                          group
                          flex
                          items-center
                          gap-1.5
                          rounded-xl
                          px-3
                          py-2
                          text-sm
                          font-semibold
                          transition
                          ${
                            isActive(item.path)
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-600 hover:bg-white hover:text-indigo-600"
                          }
                        `}
                      >
                        <Icon
                          size={15}
                          className="
                            shrink-0
                            transition
                            group-hover:scale-110
                          "
                        />

                        <span className="hidden xl:inline">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-2
              md:flex
            "
          >
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="
                    rounded-xl
                    px-3.5
                    py-2.5
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-100
                    hover:text-indigo-600
                  "
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-purple-600
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-md
                    shadow-indigo-200
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-lg
                  "
                >
                  <Sparkles size={15} />

                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div
                  ref={notificationRef}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen(
                        (prev) => !prev
                      );

                      setProfileOpen(false);

                      if (!notificationOpen) {
                        loadNotifications();
                      }
                    }}
                    className="
                      relative
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-600
                      shadow-sm
                      transition
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-600
                    "
                    aria-label="Notifications"
                  >
                    <Bell size={18} />

                    {unreadCount > 0 && (
                      <span
                        className="
                          absolute
                          -right-1
                          -top-1
                          flex
                          h-5
                          min-w-5
                          items-center
                          justify-center
                          rounded-full
                          border-2
                          border-white
                          bg-red-500
                          px-1
                          text-[9px]
                          font-black
                          text-white
                        "
                      >
                        {unreadCount > 9
                          ? "9+"
                          : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationOpen && (
                      <NotificationDropdown
                        notifications={notifications}
                        loading={loadingNotifications}
                        unreadCount={unreadCount}
                        markAsRead={markAsRead}
                        deleteNotification={
                          deleteNotification
                        }
                        markAllAsRead={
                          markAllAsRead
                        }
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* =================================================
                    PROFILE
                ================================================= */}

                <div
                  ref={profileRef}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(
                        (prev) => !prev
                      );

                      setNotificationOpen(false);
                    }}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-2
                      py-1.5
                      shadow-sm
                      transition
                      hover:border-indigo-200
                      hover:bg-slate-50
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-gradient-to-br
                        from-indigo-600
                        to-purple-600
                        text-xs
                        font-black
                        text-white
                      "
                    >
                      {userInitial}
                    </div>

                    <div className="hidden max-w-[105px] text-left xl:block">
                      <p
                        className="
                          truncate
                          text-xs
                          font-bold
                          text-slate-800
                        "
                      >
                        {userName}
                      </p>

                      <p
                        className="
                          text-[10px]
                          font-medium
                          text-slate-400
                        "
                      >
                        Student
                      </p>
                    </div>

                    <ChevronDown
                      size={14}
                      className={`
                        text-slate-400
                        transition-transform
                        ${
                          profileOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <ProfileDropdown
                        userName={userName}
                        userEmail={userEmail}
                        userInitial={userInitial}
                        close={() =>
                          setProfileOpen(false)
                        }
                        logout={handleLogout}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (prev) => !prev
              )
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:text-indigo-600
              md:hidden
            "
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>

        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <AnimatePresence>
          {mobileOpen && (
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
              transition={{
                duration: 0.2,
              }}
              className="
                overflow-hidden
                border-t
                border-slate-100
                bg-white
                md:hidden
              "
            >
              <div
                className="
                  max-h-[calc(100vh-72px)]
                  overflow-y-auto
                  px-4
                  pb-5
                  pt-4
                  sm:px-6
                "
              >
                {/* =================================================
                    MOBILE USER
                ================================================= */}

                {token && (
                  <div
                    className="
                      mb-4
                      rounded-2xl
                      border
                      border-indigo-100
                      bg-gradient-to-br
                      from-indigo-50
                      to-purple-50
                      p-4
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-indigo-600
                          to-purple-600
                          text-sm
                          font-black
                          text-white
                          shadow-md
                        "
                      >
                        {userInitial}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-sm
                            font-black
                            text-slate-900
                          "
                        >
                          {userName}
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            text-slate-500
                          "
                        >
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    MAIN
                ================================================= */}

                <p
                  className="
                    mb-2
                    px-3
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-slate-400
                  "
                >
                  Main
                </p>

                <div className="space-y-1">
                  <MobileNavLink
                    to="/"
                    icon={<Sparkles size={17} />}
                    label="Home"
                    active={isActive("/")}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  />

                  <button
                    type="button"
                    onClick={goToFeatures}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      hover:text-indigo-600
                    "
                  >
                    <Sparkles size={17} />

                    Features
                  </button>
                </div>

                {/* =================================================
                    LEARNING
                ================================================= */}

                {token && (
                  <>
                    <div className="my-4 border-t border-slate-100" />

                    <p
                      className="
                        mb-2
                        px-3
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-slate-400
                      "
                    >
                      Learning
                    </p>

                    <div className="space-y-1">
                      {appLinks.map((item) => {
                        const Icon =
                          item.icon;

                        return (
                          <MobileNavLink
                            key={item.path}
                            to={item.path}
                            icon={
                              <Icon size={17} />
                            }
                            label={item.label}
                            active={isActive(
                              item.path
                            )}
                            onClick={() =>
                              setMobileOpen(false)
                            }
                          />
                        );
                      })}
                    </div>

                    {/* =================================================
                        ACCOUNT
                    ================================================= */}

                    <div className="my-4 border-t border-slate-100" />

                    <p
                      className="
                        mb-2
                        px-3
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-slate-400
                      "
                    >
                      Account
                    </p>

                    <div className="space-y-1">
                      <MobileNavLink
                        to="/profile"
                        icon={<User size={17} />}
                        label="My Profile"
                        active={isActive(
                          "/profile"
                        )}
                        onClick={() =>
                          setMobileOpen(false)
                        }
                      />

                      <MobileNavLink
                        to="/analytics"
                        icon={
                          <BarChart3 size={17} />
                        }
                        label="Learning Analytics"
                        active={isActive(
                          "/analytics"
                        )}
                        onClick={() =>
                          setMobileOpen(false)
                        }
                      />

                      <MobileNavLink
                        to="/settings"
                        icon={
                          <Settings size={17} />
                        }
                        label="Settings"
                        active={isActive(
                          "/settings"
                        )}
                        onClick={() =>
                          setMobileOpen(false)
                        }
                      />
                    </div>

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-red-500
                        transition
                        hover:bg-red-100
                      "
                    >
                      <LogOut size={17} />

                      Logout
                    </button>
                  </>
                )}

                {/* =================================================
                    AUTH
                ================================================= */}

                {!token && (
                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >
                    <Link
                      to="/login"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="
                        flex
                        min-h-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-slate-700
                      "
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/register"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="
                        flex
                        min-h-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-r
                        from-indigo-600
                        to-purple-600
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-md
                      "
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}


// =====================================================
// NAV LINK
// =====================================================

function NavLink({
  to,
  label,
  active,
}) {
  return (
    <Link
      to={to}
      className={`
        rounded-xl
        px-3
        py-2
        text-sm
        font-semibold
        transition
        ${
          active
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-600 hover:bg-white hover:text-indigo-600"
        }
      `}
    >
      {label}
    </Link>
  );
}


// =====================================================
// NOTIFICATION DROPDOWN
// =====================================================

function NotificationDropdown({
  notifications,
  loading,
  unreadCount,
  markAsRead,
  deleteNotification,
  markAllAsRead,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 8,
        scale: 0.97,
      }}
      transition={{
        duration: 0.18,
      }}
      className="
        absolute
        right-0
        mt-3
        w-[380px]
        max-w-[calc(100vw-2rem)]
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-100
          px-5
          py-4
        "
      >
        <div>
          <h3
            className="
              text-sm
              font-black
              text-slate-900
            "
          >
            Notifications
          </h3>

          <p
            className="
              mt-0.5
              text-xs
              text-slate-400
            "
          >
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="
              text-xs
              font-bold
              text-indigo-600
              hover:text-indigo-700
            "
          >
            Mark all read
          </button>
        )}
      </div>

      {/* BODY */}

      <div
        className="
          max-h-[390px]
          overflow-y-auto
        "
      >
        {loading ? (
          <div
            className="
              flex
              min-h-[190px]
              flex-col
              items-center
              justify-center
            "
          >
            <div
              className="
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-indigo-600
              "
            />

            <p
              className="
                mt-3
                text-xs
                font-medium
                text-slate-400
              "
            >
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="
              flex
              min-h-[210px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
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
                bg-indigo-50
                text-indigo-500
              "
            >
              <Bell size={24} />
            </div>

            <p
              className="
                mt-4
                text-sm
                font-black
                text-slate-800
              "
            >
              No notifications
            </p>

            <p
              className="
                mt-1
                max-w-[240px]
                text-xs
                leading-5
                text-slate-400
              "
            >
              Important learning updates
              will appear here.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              className={`
                border-b
                border-slate-100
                p-4
                transition
                ${
                  item.read
                    ? "bg-white"
                    : "bg-indigo-50/60"
                }
              `}
            >
              <div className="flex gap-3">
                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      item.read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-indigo-100 text-indigo-600"
                    }
                  `}
                >
                  {item.read ? (
                    <CheckCircle2
                      size={17}
                    />
                  ) : (
                    <Bell size={17} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      text-sm
                      font-bold
                      text-slate-900
                    "
                  >
                    {item.title}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    {item.message}
                  </p>

                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1
                      text-[10px]
                      text-slate-400
                    "
                  >
                    <Clock3 size={11} />

                    {item.created_at}
                  </div>

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            item._id
                          )
                        }
                        className="
                          rounded-lg
                          bg-emerald-50
                          px-2.5
                          py-1.5
                          text-[11px]
                          font-bold
                          text-emerald-600
                          transition
                          hover:bg-emerald-100
                        "
                      >
                        Mark read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteNotification(
                          item._id
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-lg
                        bg-red-50
                        px-2.5
                        py-1.5
                        text-[11px]
                        font-bold
                        text-red-500
                        transition
                        hover:bg-red-100
                      "
                    >
                      <Trash2 size={12} />

                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}


// =====================================================
// PROFILE DROPDOWN
// =====================================================

function ProfileDropdown({
  userName,
  userEmail,
  userInitial,
  close,
  logout,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 8,
        scale: 0.97,
      }}
      transition={{
        duration: 0.18,
      }}
      className="
        absolute
        right-0
        mt-3
        w-64
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
      "
    >
      {/* USER HEADER */}

      <div
        className="
          border-b
          border-indigo-100
          bg-gradient-to-br
          from-indigo-50
          to-purple-50
          p-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-indigo-600
              to-purple-600
              text-sm
              font-black
              text-white
              shadow-md
            "
          >
            {userInitial}
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-black
                text-slate-900
              "
            >
              {userName}
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-slate-500
              "
            >
              {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* LINKS */}

      <div className="p-2">
        <DropdownLink
          to="/profile"
          icon={<User size={17} />}
          label="My Profile"
          onClick={close}
        />

        <DropdownLink
          to="/analytics"
          icon={<BarChart3 size={17} />}
          label="Learning Analytics"
          onClick={close}
        />

        <DropdownLink
          to="/settings"
          icon={<Settings size={17} />}
          label="Settings"
          onClick={close}
        />

        <div
          className="
            my-2
            border-t
            border-slate-100
          "
        />

        <button
          type="button"
          onClick={logout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-bold
            text-red-500
            transition
            hover:bg-red-50
          "
        >
          <LogOut size={17} />

          Logout
        </button>
      </div>
    </motion.div>
  );
}


// =====================================================
// DROPDOWN LINK
// =====================================================

function DropdownLink({
  to,
  icon,
  label,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="
        flex
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-sm
        font-semibold
        text-slate-600
        transition
        hover:bg-indigo-50
        hover:text-indigo-600
      "
    >
      {icon}

      {label}
    </Link>
  );
}


// =====================================================
// MOBILE NAV LINK
// =====================================================

function MobileNavLink({
  to,
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex
        min-h-11
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        text-sm
        font-semibold
        transition
        ${
          active
            ? "bg-indigo-50 text-indigo-600"
            : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
        }
      `}
    >
      {icon}

      <span>{label}</span>

      {active && (
        <span
          className="
            ml-auto
            h-2
            w-2
            rounded-full
            bg-indigo-600
          "
        />
      )}
    </Link>
  );
}


export default Navbar;