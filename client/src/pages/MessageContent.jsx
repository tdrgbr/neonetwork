import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MessagesIcon from "../assets/icons/messages.svg?react";
import BackIcon from "../assets/icons/back.svg?react";
import {
  getConversationParticipant,
  getMessages,
  markRead,
  sendMessage,
} from "../utils/messagesApi";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";
import { socket } from "../utils/socket";
import { DOMAIN } from "../utils/config";

const handleSubmit = async (
  user,
  conversationId,
  message,
  setUserMessage,
  setMessages
) => {
  try {
    if (!message.trim()) return;
    if (message.length > 255) {
      const newMessage = {
        id: Date.now(),
        conversationid: conversationId,
        created_at: Date.now(),
        message: "Your message must not exceed 255 characters.",
        senderid: user.id,
        errorMessage: true,
      };
      setMessages((prev) => [...prev, newMessage]);
      return;
    }
    const tempMessage = {
      id: Date.now(),
      conversationid: conversationId,
      created_at: new Date(),
      message,
      senderid: user.id,
      seen: false,
      errorMessage: false,
    };
    setMessages((prev) => [...prev, tempMessage]);
    socket.emit("sendMessage", { conversationId, message, senderId: user.id });
    await sendMessage(conversationId, message);
    setUserMessage("");
  } catch (err) {
    const newMessage = {
      id: Date.now(),
      conversationid: conversationId,
      created_at: Date.now(),
      message: "There was an unexpected error. Please try again later.",
      senderid: user.id,
      errorMessage: true,
    };
    setMessages((prev) => [...prev, newMessage]);
  }
};

const MessageContent = () => {
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 30;

  if (!id) return navigate("/messages");

  const fetchMessages = async (pageToLoad = 0) => {
    try {
      const offset = pageToLoad * limit;
      const res = await getMessages(id, limit, offset);
      if (res.length < limit) setHasMore(false);
      setMessages((prev) => [...res, ...prev]);
    } catch (e) {}
  };

  useEffect(() => {
    const initFetch = async () => {
      try {
        const res = await getMessages(id, limit, 0);
        setMessages(res);
        if (res.length < limit) setHasMore(false);
        const profileData = await getConversationParticipant(id);
        setProfile(profileData);
        await markRead(id);
        socket.emit("markSeen", { conversationId: id, userId: user.id });
        socket.emit("joinConversation", id);
      } catch {
        return navigate("/messages");
      } finally {
        setLoading(false);
      }
    };
    initFetch();
    return () => socket.emit("leaveConversation", id);
  }, [id]);

  useEffect(() => {
    if (page > 0) fetchMessages(page);
  }, [page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      const prevHeight = scrollHeight;
      setPage((prev) => prev + 1);
      setTimeout(() => {
        const newHeight = e.target.scrollHeight;
        e.target.scrollTop = newHeight - prevHeight;
      }, 50);
    }
  };

  useEffect(() => {
    if (page === 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = (newMsg) => {
      if (newMsg.senderid === user.id) return;
      setMessages((prev) => [...prev, newMsg]);
      socket.emit("markSeen", { conversationId: id, userId: user.id });
      markRead(id);
    };

    const handleMarkSeen = async ({ conversationId, userId: seenBy }) => {
      if (conversationId === id && seenBy !== user.id) {
        try {
          await markRead(conversationId);
        } catch {}
        setMessages((prev) =>
          prev.map((msg) =>
            Number(msg.senderid) === Number(user.id)
              ? { ...msg, seen: true }
              : msg
          )
        );
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("markSeen", handleMarkSeen);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("markSeen", handleMarkSeen);
    };
  }, [id, user.id]);

  useEffect(() => {
    const timers = messages
      .filter((msg) => msg.errorMessage)
      .map((msg) =>
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }, 1500)
      );
    return () => timers.forEach(clearTimeout);
  }, [messages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-lg:ml-80 min-h-screen">
        <ClipLoader color="#b15af5" size={60} />
      </div>
    );
  }

  return (
    <>
      <h1 className="font-title mt-30 ml-7 min-lg:ml-90 text-2xl text-white">
        <span className="text-secondary">Connections / </span>Messages
      </h1>

      <div className="mt-10 min-lg:ml-90 flex space-x-3 mb-3 font-other text-white">
        <div className="flex flex-col bg-cards w-full h-dvh rounded-xl min-lg:mr-10 mb-3">
          <div className="flex bg-black/50 h-20 p-0 rounded-t-xl justify-between items-center sticky top-0 z-10">
            <NavLink
              to={`/profile/${profile.username}`}
              className="flex items-center p-3 space-x-3"
            >
              <img
                src={`${profile.avatar}`}
                alt="profile_img"
                className="h-12 w-12 rounded-full object-cover max-lg:h-8 max-lg:w-8"
              />
              <h2>
                Chatting with{" "}
                <span className="font-bold">{profile.username}</span>
              </h2>
            </NavLink>
            <NavLink
              to="/messages"
              className="flex items-center p-4 m-4 space-x-2 bg-white/30 h-10 rounded-lg cursor-pointer hover:scale-103 transition-all duration-300"
            >
              <BackIcon className="h-5" />
              <span>Back</span>
            </NavLink>
          </div>

          <div
            className="flex-1 flex flex-col overflow-y-auto p-5 space-y-3"
            onScroll={handleScroll}
          >
            {!hasMore && (
              <div className="flex flex-col items-center justify-center mb-5 text-gray-400 text-sm p-5">
                <img
                  src={`${profile.avatar}`}
                  className="h-20 w-20 rounded-full mb-3"
                />
                <h1>
                  Say hi to{" "}
                  <span className="font-bold text-white">
                    {profile.username}
                  </span>
                </h1>
                <NavLink
                  to={`/profile/${profile.username}`}
                  className="mt-3 rounded-xl h-5 bg-black/50 text-white font-other hover:scale-101 flex items-center justify-center space-x-2 p-4"
                >
                  View profile
                </NavLink>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => {
                const isOwn = msg.senderid === user.id;
                const isError = msg.errorMessage;
                return (
                  <React.Fragment key={msg.id || i}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-start space-x-3 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && (
                        <NavLink to={`/profile/${profile.username}`}>
                          <img
                            src={`${profile.avatar}`}
                            alt="profile_img"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </NavLink>
                      )}
                      <div
                        className={`rounded-4xl px-5 py-3 max-w-[80%] break-words flex-shrink-0 ${
                          isError
                            ? "bg-black/50 text-white shadow-md"
                            : isOwn
                            ? "bg-active text-white shadow-md shadow-purple-500/20"
                            : "bg-black/50 text-gray-100"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </motion.div>
                    <div className="flex justify-end px-3 text-sm">
                      {msg.seen &&
                      i === messages.length - 1 &&
                      msg.senderid === user.id
                        ? "Seen"
                        : ""}
                      {!msg.seen &&
                      i === messages.length - 1 &&
                      msg.senderid === user.id
                        ? "Delivered  "
                        : ""}
                    </div>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>

            <div ref={bottomRef}></div>
          </div>

          <div className="flex h-14 p-5 mb-10">
            <div className="relative flex w-full bg-black/50 h-14 rounded-xl text-white font-other items-center">
              <input
                type="text"
                className="w-full focus:outline-active focus:outline-1 rounded-xl h-14 p-6 placeholder-gray-400 focus:placeholder-gray-300"
                placeholder="Send a text message"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(
                      user,
                      id,
                      userMessage,
                      setUserMessage,
                      setMessages
                    );
                    e.preventDefault();
                  }
                }}
              />
              <MessagesIcon
                className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 cursor-pointer"
                onClick={() =>
                  handleSubmit(
                    user,
                    id,
                    userMessage,
                    setUserMessage,
                    setMessages
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageContent;
