import api from "./api.js";

export const followUser = async (userId) => {
  try {
    await api.post(`/follow/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  } catch (e) {
    e;
  }
};
