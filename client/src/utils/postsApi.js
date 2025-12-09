import api from "./api.js";

export const getPost = async (postId) => {
  try {
    const res = await api.get(`/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to get post by id";
  }
};

export const getUserPosts = async (userId) => {
  try {
    const res = await api.get(`/posts/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to get user post";
  }
};

export const deletePost = async (postId) => {
  try {
    const res = await api.delete(`/posts/del/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to submit action (delete post)";
  }
};

export const addPost = async (formData) => {
  try {
    const res = await api.post(`/posts`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to add post";
  }
};

export const getFeed = async (limit, offset) => {
  try {
    const res = await api.get(`/posts/feed?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to get feed";
  }
};

export const likePost = async (postId) => {
  try {
    const res = await api.post(
      `/posts/${postId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw "Failed to submit action (post like)";
  }
};

export const commentPost = async (postId, comment) => {
  try {
    const res = await api.post(
      `/posts/${postId}/comment`,
      { comment },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw "Failed to submit action (post commnet)";
  }
};
