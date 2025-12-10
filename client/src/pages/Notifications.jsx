import React, { useEffect, useState } from "react";
import {
  userRequests,
  userRequestAccept,
  userRequestDecline,
} from "../utils/userApi";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router";
import { calcDate } from "../utils/calculateDate";
import { getNotifications } from "../utils/notififcationApi";
import CheckedIcon from "../assets/icons/checked.svg?react";
import { ClipLoader } from "react-spinners";
import { socket } from "../utils/socket";
import { DOMAIN } from "../utils/config";

const acceptRequest = async (setRequests, profileId) => {
  await userRequestAccept(profileId);
  setRequests((old) =>
    old.map((r) => (r.id === profileId ? { ...r, accepted: true } : r))
  );
};
const getLink = (n) => {
  switch (n.type) {
    case "like_post": {
      return `/post/${n.post_id}`;
    }
    case "comment_post": {
      return `/post/${n.post_id}`;
    }
    case "follow": {
      return `/profile/${n.sender_username}`;
    }
    case "like_story": {
      return `/story/`;
    }
  }
};
const getName = (n) => {
  switch (n.type) {
    case "like_post":
      return "See post";
    case "comment_post":
      return "See post";
    case "follow":
      return "View profile";
    case "like_story":
      return "View story";
  }
};
const declineRequest = async (setRequests, profileId) => {
  await userRequestDecline(profileId);
  setRequests((old) => old.filter((r) => r.id !== profileId));
};
const notificationMessage = (type) => {
  switch (type) {
    case "like_post":
      return "💜 Liked your post.";
    case "like_story":
      return "💜 Liked your story.";
    case "follow":
      return "✚ Followed you.";
    case "comment_post":
      return "💬 Commented on your post.";
  }
};
const Notifications = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    function handler(notification) {
      setNotifications((prev) => [{ ...notification, isNew: true }, ...prev]);
    }
    socket.on("receiveNotification", handler);
    return () => {
      socket.off("receiveNotification", handler);
    };
  }, []);
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestQuery = await userRequests(user.username);
        setRequests(requestQuery.data);
        const notificationsQuery = await getNotifications();
        setNotifications(notificationsQuery.data);
        setLoading(false);
      } catch {}
    };
    fetchRequests();
  }, [loading]);
  if (loading) {
    return (
      <div className="flex text-secondary justify-center items-center min-lg:ml-80 min-h-screen">
        <ClipLoader color="" size={60} />
      </div>
    );
  }
  return (
    <div className="mt-30 min-lg:ml-81 font-other text-secondary">
      <div
        className={`flex flex-col w-full max-w-full gap-0 p-6 ${
          requests.length === 0 ? "hidden" : null
        }`}
      >
        <div className="p-4 w-full flex bg-black/50 rounded-t-xl items-center justify-start">
          Follow requests
        </div>
        <div className="bg-cards rounded-b-xl justify-center flex flex-col p-4 gap-6 w-full max-w-full">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between w-full min-w-0 border-b-[0.01px] border-profile"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <NavLink to={`/profile/${r.username}`}>
                  <img
                    src={`${r.avatar}`}
                    alt="profile_img"
                    className="h-13 w-13 rounded-full object-cover max-lg:h-8 max-lg:w-8"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </NavLink>
                <div className="flex flex-col truncate">
                  <span className="truncate">
                    <NavLink to={`/profile/${r.username}`}>
                      <b>{r.username}</b>
                    </NavLink>{" "}
                    <span className="text-secondary text-md">
                      {calcDate(r.created_at).time}
                      {calcDate(r.created_at).unit}
                    </span>
                  </span>
                  <span className="text-sm truncate">Wants to follow you.</span>
                </div>
              </div>
              {r.accepted ? (
                <button
                  key={r.id + 2}
                  className="rounded-lg bg-active pl-6 pr-6 text-sm h-8 justify-center flex items-center min-lg:text-md cursor-pointer hover:scale-102 transition-all duration-300"
                >
                  Request accepted
                </button>
              ) : (
                <>
                  <button
                    key={r.id + 2}
                    className="rounded-lg bg-active pl-6 pr-6 text-sm h-8 justify-center flex items-center min-lg:text-md cursor-pointer hover:scale-102 transition-all duration-300"
                    onClick={() => acceptRequest(setRequests, r.id)}
                  >
                    Accept
                  </button>
                  <button
                    key={r.id + 1}
                    className="ml-3 rounded-lg bg-black/50 pl-6 pr-6 text-sm h-8 justify-center flex items-center min-lg:text-md cursor-pointer hover:scale-102 transition-all duration-300"
                    onClick={() => declineRequest(setRequests, r.id)}
                  >
                    Decline
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full max-w-full gap-0 p-6">
        <div className="p-4 w-full flex bg-highlight rounded-t-xl items-center justify-start">
          Notifications
        </div>

        {notifications.length === 0 ? (
          <div className="bg-cards rounded-b-xl justify-center flex flex-col p-4 gap-6 w-full max-w-full ">
            <div className="flex items-center justify-center space-x-3 p-5">
              <CheckedIcon className="h-8" />
              <span className="text-lg">You’re all caught up!</span>
            </div>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`justify-center flex flex-col p-4 gap-6 w-full max-w-full border-b-[0.01px] border-profile ${
                n.isNew ? "bg-active/30" : "bg-cards"
              }`}
            >
              <div
                className={`flex items-center justify-between w-full min-w-0`}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <NavLink to={`/profile/${n.sender_username}`}>
                    <img
                      src={`${n.sender_avatar}`}
                      alt="profile_img"
                      className="h-13 w-13 rounded-full object-cover max-lg:h-8 max-lg:w-8"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </NavLink>
                  <div className="flex flex-col truncate">
                    <span className="truncate">
                      <NavLink to={`/profile/${n.sender_username}`}>
                        <b>{n.sender_username}</b>{" "}
                      </NavLink>
                      <span className="text-secondary text-md">
                        {calcDate(n.created_at).time}
                        {calcDate(n.created_at).unit}
                      </span>
                    </span>
                    <span className="text-sm truncate">
                      {notificationMessage(n.type)}
                    </span>
                  </div>
                </div>
                <NavLink
                  to={getLink(n)}
                  className="rounded-lg bg-inactive text-secondary pl-6 pr-6 text-sm h-8 justify-center flex items-center min-lg:text-md cursor-pointer hover:scale-102 transition-all duration-300"
                >
                  {getName(n)}
                </NavLink>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
