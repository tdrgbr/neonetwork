import api from "./api";
export const userData = async (profile) => {
  try {
    const res = await api.get(`/users/${profile}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res;
  } catch (e) {
    throw "Failed to fetch user data";
  }
};
export const searchUser = async (input) => {
  try {
    const res = await api.get("/users/search", {
      params: { q: input },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return res.data;
  } catch (err) {
    return [];
  }
};
export const getDiscover = async () => {
  try {
    const res = await api.get(`/users/discover`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res.data;
  } catch (e) {}
};
export const userIdData = async (id) => {
  try {
    const res = await api.get(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res;
  } catch (e) {
    throw "Failed to get user by id";
  }
};
export const userFollowing = async (profile) => {
  try {
    const res = await api.get(`/users/${profile}/following`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res;
  } catch (e) {}
};
export const userFollowers = async (profile) => {
  try {
    const res = await api.get(`/users/${profile}/followers`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res;
  } catch (e) {}
};
export const userRequests = async (profile) => {
  try {
    const res = await api.get(`/users/${profile}/requests`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res;
  } catch (e) {}
};
export const userRequesting = async (profile) => {
  try {
    const res = await api.get(`/users/${profile}/requesting`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return res;
  } catch (e) {}
};
export const userFollow = async (userId) => {
  try {
    await api.post(`/follow/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return;
  } catch (e) {
    throw "Failed to submit action (follow user)";
  }
};
export const userRequest = async (userId) => {
  try {
    await api.post(`/follow/request/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return;
  } catch (e) {
    throw "Failed to submit action (request follow)";
  }
};
export const userRequestAccept = async (userId) => {
  try {
    await api.post(`/follow/request/${userId}/accept`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return;
  } catch (e) {
    throw "Failed to submit action (accept request)";
  }
};
export const userRequestDecline = async (userId) => {
  try {
    await api.post(`/follow/request/${userId}/decline`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return;
  } catch (e) {
    throw "Failed to submit action (decline request)";
  }
};
export const userStatus = async () => {
  try {
    await api.post(`/users/updatestatus`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return;
  } catch (e) {
    throw "Failed to submit action (modify privacy)";
  }
};
export const userPassword = async (currentPassword, newPassword) => {
  try {
    const res = await api.post(
      `/users/updatepassword`,
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw e.response.data.message;
  }
};
export const userEmail = async (email) => {
  try {
    const res = await api.post(
      `/users/updatemail`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw e.response.data.message;
  }
};
export const userUsername = async (username) => {
  try {
    const res = await api.post(
      `/users/updateusername`,
      { username },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return res.data;
  } catch (e) {
    throw e.response.data.message;
  }
};
