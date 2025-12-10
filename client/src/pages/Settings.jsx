import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import SendIcon from "../assets/icons/messages.svg?react";
import LogoutIcon from "../assets/icons/logout.svg?react";
import BackIcon from "../assets/icons/back.svg?react";
import { useAuth } from "../context/AuthContext";
import {
  userFollowers,
  userFollowing,
  userStatus,
  userData,
  userPassword,
  userEmail,
  userUsername,
} from "../utils/userApi";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

const handlePassword = async (currentPass, newPass) => {
  try {
    if (!currentPass.trim() || !newPass.trim())
      throw new Error("Please fill in both password fields.");
    if (currentPass === newPass)
      throw new Error(
        "Your new password cannot be the same as your current password."
      );
    if (newPass.length < 8)
      throw new Error("Your password must have minimum 8 characters.");

    const res = await userPassword(currentPass, newPass);
    Swal.fire({
      theme: "dark",
      title: "Updated!",
      text: res.message,
      icon: "success",
      confirmButtonColor: "#d155e6",
    });
  } catch (e) {
    Swal.fire({
      theme: "dark",
      title: "Whoops!",
      text: e,
      icon: "error",
      confirmButtonColor: "#d155e6",
    });
  }
};
const handleEmail = async (email) => {
  try {
    if (!email.trim()) throw new Error("Please fill in the email field.");
    if (!email.includes("@"))
      throw new Error("Please enter a valid email adress.");

    const res = await userEmail(email);
    Swal.fire({
      theme: "dark",
      title: "Updated!",
      text: res.message,
      icon: "success",
      confirmButtonColor: "#d155e6",
    });
  } catch (e) {
    Swal.fire({
      theme: "dark",
      title: "Whoops!",
      text: e,
      icon: "error",
      confirmButtonColor: "#d155e6",
    });
  }
};
const handleUsername = async (username, setUserInfo) => {
  try {
    if (!username.trim()) throw new Error("Please fill in the username field.");
    if (username.length < 4)
      throw new Error("Your username must have minimum 4 characters.");

    const res = await userUsername(username);
    setUserInfo((prev) => ({
      ...prev,
      username: username,
    }));
    Swal.fire({
      theme: "dark",
      title: "Updated!",
      text: res.message,
      icon: "success",
      confirmButtonColor: "#d155e6",
    });
  } catch (e) {
    Swal.fire({
      theme: "dark",
      title: "Whoops!",
      text: e,
      icon: "error",
      confirmButtonColor: "#d155e6",
    });
  }
};
const handleChange = async (setAccountType) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to switch your account type",
    icon: "warning",
    theme: "dark",
    showCancelButton: true,
    confirmButtonColor: "#d155e6",
    confirmButtonText: "Switch",
    cancelButtonColor: "#303030",
  }).then(async (result) => {
    if (result.isConfirmed) {
      setAccountType((prev) => !prev);
      await userStatus();
      Swal.fire({
        title: "Updated!",
        text: "Your account type has been changed.",
        icon: "success",
        theme: "dark",
        confirmButtonColor: "#303030",
      });
    }
  });
};
const Settings = () => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [accountType, setAccountType] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const accountData = await userData(user.username);
        setAccountType(accountData.data.accounttype);
      } catch {}
    };
    const fetchFollowers = async () => {
      try {
        const followers = await userFollowers(user.username);
        setFollowers(followers.data.length);
        const following = await userFollowing(user.username);
        setFollowing(following.data.length);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    fetchFollowers();
  }, []);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [userInfo, setUserInfo] = useState(user);
  if (loading) {
    return (
      <div className="flex text-secondary justify-center items-center min-lg:ml-80 min-h-screen">
        <ClipLoader color="" size={60} />
      </div>
    );
  }
  return (
    <div className="mt-30 min-lg:ml-90 ">
      <div className="flex pl-8 max-lg:pl-13 items-center space-x-7 flex-grow ">
        <img
          src={`${userInfo.avatar}`}
          alt="profile_img"
          className="flex rounded-full h-36 w-36 max-lg:h-20 max-lg:w-20 object-fit relative shrink-0"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="flex flex-col space-y-2">
          <h1 className="text-secondary font-bold font-other text-3xl max-lg:text-xl">
            {userInfo.username}
          </h1>
          <div className="flex items-center space-x-3">
            <h1 className="text-secondary font-other text-md">
              <div className="flex flex-col text-[0.9rem]">
                <p>
                  <b>{followers}</b>
                </p>
                <p>followers</p>
              </div>
            </h1>
            <h1 className="text-secondary font-other text-md">
              <div className="flex flex-col text-[0.9rem]">
                <p>
                  <b>{following}</b>
                </p>
                <p>following</p>
              </div>
            </h1>
          </div>
          <NavLink
            to={`/profile/${userInfo.username}`}
            className="mt-3 rounded-lg h-8 flex-grow bg-inactive text-secondary font-other cursor-pointer hover:transition hover:scale-102 font-tightest flex items-center justify-center space-x-2 p-5"
          >
            <BackIcon className="h-5 w-5 text-secondary" />
            <span className="max-lg:text-xs">Back to profile</span>
          </NavLink>
        </div>
      </div>

      <div>
        <div className="mt-10 min-lg:mt-1 flex flex-wrap flex-grow justify-start max-lg:ml-15 max-lg:pr-15 min-lg:p-10 gap-2 text-secondary">
          <div className="py-4 w-full font-other flex space-x-3 bg-cards rounded-xl items-center justify-start">
            <h1 className="text-md px-3">Public account</h1>
            <button
              onClick={() => handleChange(setAccountType)}
              className={`relative inline-flex h-6 w-15 items-center rounded-full transition-colors ${
                accountType ? "bg-active" : "bg-gray-400"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  accountType ? "translate-x-10" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="py-3 w-full font-other space-y-3 flex flex-col">
            <span>Username</span>
            <div className="bg-cards p-3 w-full rounded-lg font-other relative border-inactive border-1 hover:border-active">
              <input
                type="input"
                className="w-full focus:outline-0 p-1 placeholder-secondary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <SendIcon
                className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 cursor-pointer"
                onClick={() => handleUsername(username, setUserInfo)}
              />
            </div>
          </div>

          <div className="py-3 w-full font-other space-y-3 flex flex-col">
            <span>E-mail</span>
            <div className="bg-cards p-3 w-full rounded-lg font-other relative border-inactive border-1 hover:border-active">
              <input
                type="email"
                className="w-full focus:outline-0 p-1 placeholder-secondary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SendIcon
                className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 cursor-pointer"
                onClick={() => handleEmail(email)}
              />
            </div>
          </div>

          <div className="py-3 w-full font-other space-y-3 flex flex-col">
            <span>Update password</span>
            <div className="bg-cards p-3 w-full rounded-lg font-other border-inactive border-1 hover:border-active">
              <input
                type="password"
                className="w-full focus:outline-0 p-1 placeholder-secondary"
                placeholder="Enter your current password"
                onChange={(e) => setCurrentPass(e.target.value)}
              />
            </div>

            <div className="bg-cards p-3 w-full rounded-lg font-other relative border-inactive border-1 hover:border-active">
              <input
                type="password"
                className="w-full focus:outline-0 p-1 placeholder-secondary"
                placeholder="Enter your new password"
                onChange={(e) => setNewPass(e.target.value)}
              />
              <SendIcon
                className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 cursor-pointer"
                onClick={() => handlePassword(currentPass, newPass)}
              />
            </div>

            <button
              onClick={async () => await logout()}
              className="mt-5 rounded-lg h-8 flex-grow bg-red-400 text-text-highlight font-other cursor-pointer hover:transition hover:scale-102 font-tightest flex items-center justify-center space-x-2 p-5"
            >
              <LogoutIcon className="h-6 w-6 text-text-highlight" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
