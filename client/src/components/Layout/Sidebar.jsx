import { useState, useEffect, useRef } from "react";

import { SidebarLinks, MobileLinks } from "./SidebarLinks";
import ProfileCard from "../Users/ProfileCard";
import { NavLink, useNavigate } from "react-router-dom";
import Searchbar from "./Searchbar";
import { motion, AnimatePresence } from "motion/react";
import NotificationsIcon from "../../assets/icons/like.svg?react";
import MessagesIcon from "../../assets/icons/messages.svg?react";
import HomeIcon from "../../assets/icons/home.svg?react";
import SearchIcon from "../../assets/icons/search.svg?react";
import PostIcon from "../../assets/icons/follow.svg?react";
import ProfileIcon from "../../assets/icons/profile.svg?react";
import SettingsIcon from "../../assets/icons/settings.svg?react";
import CheckedIcon from "../../assets/icons/checked.svg?react";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../utils/socket";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [hideMobile, setHideMobile] = useState(false);
  const lastScroll = useRef(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificationBadge, setNotificationBadge] = useState(false);
  useEffect(() => {
    function handler(notification) {
      setNotificationBadge(true);
    }
    socket.on("receiveNotification", handler);
    return () => {
      socket.off("receiveNotification", handler);
    };
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > lastScroll.current + 1) setHideMobile(true);
      else if (currentScroll < lastScroll.current - 1) setHideMobile(false);

      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <>
      {/* Sidebar */}
      <div className="max-lg:hidden w-80 bg-cards fixed min-h-screen max-h-screen overflow-y-auto flex flex-col p-5 pt-8 transition-all duration-300 z-50">
        <NavLink to="/" className="font-title text-white text-5xl text-left">
          Neonetwork
        </NavLink>

        {/* Profile card */}
        <ProfileCard name={user.username} avatar={user.avatar} />

        {/* Links */}
        <div className="flex-col mt-5 flex-1 space-y-3 sidebar">
          <h1 className="font-title text-white text-xl text-left tracking-widest mt-7">
            Connections
          </h1>
          <SidebarLinks to="/" label="Feed" icon={HomeIcon} />
          <SidebarLinks to="/discover" label="Discover" icon={SearchIcon} />
          <SidebarLinks to="/create" label="New post" icon={PostIcon} />

          <h1 className="font-title text-white text-xl text-left tracking-widest mt-10 mb-5">
            Privacy
          </h1>
          <SidebarLinks to="/settings" label="Settings" icon={SettingsIcon} />
        </div>
      </div>

      {/* Topbar */}
      <div className="max-lg:hidden absolute top-6 left-90 right-2 flex justify-between items-center h-14 z-10">
        <div className="flex flex-grow justify-between h-14 pr-5">
          <Searchbar />

          <div className="flex space-x-3 right-2">
            <button
              className="bg-cards h-14 w-14 flex items-center justify-center rounded-xl p-2 cursor-pointer"
              onClick={() => {
                if (notificationBadge) setNotificationBadge(false);
                navigate("/notifications");
              }}
            >
              <div className="relative inline-block cursor-pointer">
                <NotificationsIcon className="w-9 h-8 text-white" />
                <span
                  className={`absolute bottom-7 left-8 h-2 w-2 bg-red-500 rounded-full ${
                    !notificationBadge ? "hidden" : ""
                  }`}
                ></span>
              </div>
            </button>
            <NavLink
              to="/messages"
              className="bg-cards h-14 w-14 flex items-center justify-center rounded-2xl p-2 cursor-pointer"
            >
              <MessagesIcon className="h-8 text-white" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile UI */}
      <div
        className={`min-lg:hidden fixed right-2 left-2 flex justify-between space-x-10 items-center m-6 z-50 ${
          hideMobile ? "hidden" : ""
        }`}
      >
        <NavLink to="/" className="font-title text-white text-4xl text-left">
          Neonetwork
        </NavLink>

        <div className="flex space-x-3 right-2">
          <button
            onClick={() => {
              if (notificationBadge) setNotificationBadge(false);
              navigate("/notifications");
            }}
            className="bg-cards h-14 w-14 flex items-center justify-center rounded-2xl p-2"
          >
            <div className="relative inline-block cursor-pointer">
              <NotificationsIcon className="w-7 h-8 text-white" />
              <span
                className={`absolute bottom-7 left-8 h-2 w-2 bg-red-500 rounded-full ${
                  !notificationBadge ? "hidden" : ""
                }`}
              ></span>{" "}
            </div>
          </button>
          <NavLink
            to="/messages"
            className="bg-cards h-14 w-14 flex items-center justify-center rounded-2xl p-2 cursor-pointer"
          >
            <MessagesIcon className="w-7 h-8 text-white" />
          </NavLink>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        className={`min-lg:hidden h-24 bg-cards rounded-3xl fixed bottom-3 left-3 right-3 flex justify-around items-center p-6 m-3 font-other border-2 border-active z-50 transition-all duration-300 ${
          hideMobile ? "translate-y-100" : "translate-y-0"
        }`}
      >
        <MobileLinks to="/" label="Feed" icon={HomeIcon} />
        <MobileLinks to="/discover" label="Discover" icon={SearchIcon} />
        <MobileLinks to="/create" label="New post" icon={PostIcon} />
        <MobileLinks
          to={`/profile/${user.username}`}
          label="Profile"
          icon={ProfileIcon}
        />
      </div>
    </>
  );
};

export default Sidebar;
