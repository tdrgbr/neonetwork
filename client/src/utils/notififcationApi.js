import api from "./api.js";

export const getNotifications = async () => {
  try {
    const res = await api.get("/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res;
  } catch (e) {}
};
