import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  getConversations,
  getConversationParticipant,
} from "../utils/messagesApi";
import { calcDate } from "../utils/calculateDate";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";
import { socket } from "../utils/socket";
import { DOMAIN } from "../utils/config";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const limit = 30;

  const fetchConversations = async (pageToLoad = 0) => {
    try {
      const offset = pageToLoad * limit;
      const res = await getConversations(limit, offset);

      if (!res || res.length === 0) {
        setHasMore(false);
        return;
      }

      const convItems = res.map((conv) => {
        const { time, unit } = calcDate(conv.last_message_time || Date.now());
        const lastMsg = conv.last_message || "Say hi!";
        const showMsg =
          conv.last_sender_id === user.id ? `You: ${lastMsg}` : lastMsg;

        return {
          ...conv,
          last_message: showMsg,
          time,
          unit,
        };
      });

      if (pageToLoad === 0) {
        setConversations(convItems);
      } else {
        setConversations((prev) => [...prev, ...convItems]);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(0);
  }, []);

  useEffect(() => {
    if (page > 0) fetchConversations(page);
  }, [page]);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const updateConversation = async (data) => {
      const { time, unit } = calcDate(data.created_at || Date.now());

      setConversations((prev) => {
        const exist = prev.find((c) => c.id === data.conversationId);

        if (exist) {
          const updated = prev.map((c) => {
            if (c.id === data.conversationId) {
              return {
                ...c,
                last_message:
                  data.senderId === user.id
                    ? `You: ${data.lastMessage}`
                    : data.lastMessage,
                last_sender_id: data.senderId,
                last_message_time: data.created_at,
                time,
                unit,
                is_unread: data.senderId !== user.id,
              };
            }
            return c;
          });

          updated.sort(
            (a, b) =>
              new Date(b.last_message_time) - new Date(a.last_message_time)
          );
          return [...updated];
        }

        getConversationParticipant(data.conversationId).then((part) => {
          const newConv = {
            id: data.conversationId,
            partner_username: part.username,
            partner_avatar: part.avatar,
            last_message:
              data.senderId === user.id
                ? `You: ${data.lastMessage}`
                : data.lastMessage,
            last_sender_id: data.senderId,
            last_message_time: data.created_at,
            time,
            unit,
            is_unread: data.senderId !== user.id,
          };
          setConversations((prev) => [newConv, ...prev]);
        });

        return prev;
      });
    };

    socket.on("conversationUpdate", updateConversation);
    return () => socket.off("conversationUpdate", updateConversation);
  }, [user.id]);

  if (loading && conversations.length === 0) {
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

      <div className="ml-7 mt-10 min-lg:ml-90 flex space-x-3 mb-3 font-other text-white pr-10">
        <div className="flex flex-col bg-cards w-full h-dvh rounded-xl">
          <div className="flex bg-black/50 h-20 p-5 rounded-t-xl justify-start items-center">
            <h1>Messages</h1>
          </div>

          <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            {conversations.length < 1 ? (
              <span className="flex items-center justify-center mt-30">
                No messages to show.
              </span>
            ) : (
              conversations.map((msg) => (
                <NavLink
                  key={msg.id}
                  to={`/messages/${msg.id}`}
                  className={`flex items-center space-x-3 min-w-0 p-4 cursor-pointer justify-between transition-all duration-300 ${
                    msg.is_unread
                      ? "bg-black/30 hover:bg-black/40"
                      : "hover:bg-black/10"
                  }`}
                >
                  <div className="flex space-x-3">
                    <img
                      src={`${msg.partner_avatar}`}
                      alt="profile_img"
                      className="h-10 w-10 rounded-full object-cover max-lg:h-8 max-lg:w-8"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <div className="flex flex-col justify-center truncate">
                      <h2 className="font-bold truncate">
                        {msg.partner_username}{" "}
                        <span className="text-secondary text-sm font-normal">
                          {msg.time}
                          {msg.unit}
                        </span>
                      </h2>
                      <h6
                        className={`truncate text-sm ${
                          msg.is_unread
                            ? "font-semibold text-white"
                            : "font-light text-gray-300"
                        }`}
                      >
                        {msg.last_message}
                      </h6>
                    </div>
                  </div>

                  {msg.is_unread && (
                    <div className="flex items-center space-x-1 text-fuchsia-200 mr-4">
                      <span className="text-xl">•</span>
                      <span className="text-sm font-bold">Unread</span>
                    </div>
                  )}
                </NavLink>
              ))
            )}

            {hasMore && loading && (
              <div className="flex justify-center py-3">
                <ClipLoader color="#b15af5" size={25} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
