import api from "./api.js";

export const getUserStory = async (id) => {
  try {
    const res = await api.get(`/story/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch {
    return 1;
  }
};

export const deleteStory = async (storyId) => {
  try {
    const res = await api.delete(`/story/del/${storyId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to submit action (delete story)";
  }
};

export const addStory = async (formData) => {
  try {
    const res = await api.post(`/story/add`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (e) {
    throw "Failed to submit action (add story)";
  }
};

export const getFeed = async () => {
  try {
    const res = await api.get(`/story/feed`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {}
};
export const storyStats = async () => {
  try {
    const res = await api.get(`/story/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch {}
};
export const likeStory = async (storyId) => {
  try {
    const res = await api.post(
      `/story/${storyId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw "Failed to submit action (story like)";
  }
};
export const viewStory = async (storyId) => {
  try {
    const res = await api.post(
      `/story/${storyId}/view`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw "Failed to submit action (story view)";
  }
};
