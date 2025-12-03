import api from "./api";

export const getConversations = async (limit = 30, offset = 0) => {
  try {
    const res = await api.get(`/messages/conversations`, {
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to fetch conversations";
  }
};

export const getMessages = async (conversationId, limit = 30, offset = 0) => {
  try {
    const res = await api.get(`/messages/${conversationId}`, {
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to fetch messages";
  }
};

export const createConversation = async (withUserId) => {
  try {
    const res = await api.post(
      "/messages/conversation",
      { withUserId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw "Failed to create conversation";
  }
};
export const markRead = async (conversationId) => {
  try {
    const res = await api.post(
      `/messages/${conversationId}/seen`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw "Failed to submit action (markRead)";
  }
};
export const getConversationParticipant = async (conversationId) => {
  try {
    const res = await api.get(`/messages/conversation/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to get conversation participant";
  }
};
export const sendMessage = async (conversationId, message) => {
  try {
    const res = await api.post(
      "/messages/message",
      { conversationId, message },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw "Failed to send message";
  }
};
