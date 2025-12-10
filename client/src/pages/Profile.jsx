import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners";
import FollowIcon from "../assets/icons/follow.svg?react";
import SettingsIcon from "../assets/icons/settings.svg?react";
import MessageIcon from "../assets/icons/messages.svg?react";
import LikeIcon from "../assets/icons/like.svg?react";
import PrivateIcon from "../assets/icons/private.svg?react";
import CommentIcon from "../assets/icons/comment.svg?react";
import EditIcon from "../assets/icons/edit.svg?react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Swal from "sweetalert2";
import { getUserPosts } from "../utils/postsApi";
import {
  userFollowing,
  userFollowers,
  userFollow,
  userData,
  userRequest,
  userRequesting,
} from "../utils/userApi";
import { createConversation } from "../utils/messagesApi";
import { getUserStory } from "../utils/storyApi";

const PostCard = ({ imgUrl, likes, comments, to }) => (
  <NavLink
    to={to}
    className="bg-cards rounded-xl overflow-hidden max-lg:max-w-fit min-lg:max-w-[250px] min-w-[120px] w-[250px] max-md:w-[140px] max-lg:aspect-[3/5] aspect-[3/5] flex-grow relative group"
  >
    <img
      src={imgUrl}
      className="w-full h-full object-cover"
      alt="post_img"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
    <div className="absolute inset-0 bg-profile/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer">
      <div className="text-text-highlight text-lg font-other font-bold flex gap-4 items-center">
        <LikeIcon className="h-6 w-6 min-md:h-8 text-active" />
        <span className="text-sm min-md:text-lg">{likes}</span>
        <CommentIcon className="h-6 w-6 min-md:h-7 text-text-highlight" />
        <span className="text-sm min-md:text-lg">{comments}</span>
      </div>
    </div>
  </NavLink>
);
const handleConversation = async (profile, navigate) => {
  try {
    const res = await createConversation(profile.id);
    navigate(`/messages/${res.id}`);
  } catch (error) {}
};
const submitProfileFollowRequest = async (
  user,
  setLoadingButton,
  targetUser,
  setRequested
) => {
  setLoadingButton(true);
  try {
    if (user.id === targetUser.id) return;
    await userRequest(targetUser.id);
    setRequested((prev) => !prev);
  } catch (e) {
    console.log(e);
  } finally {
    setLoadingButton(false);
  }
};
const submitProfileFollow = async (
  user,
  setFollowUser,
  setLoadingButton,
  setFollowers,
  targetUser,
  setUserFollows
) => {
  setLoadingButton(true);
  try {
    await userFollow(targetUser.id);
    if (user.id === targetUser.id) return;

    setFollowUser((prev) => {
      const newState = !prev;
      setFollowers((old) => {
        if (newState) {
          if (!old.some((f) => f.id === user.id)) return [...old, user];
          return old;
        }
        return old.filter((f) => f.id !== user.id);
      });
      return newState;
    });

    setUserFollows((old) => {
      const isFollowing = old.some((f) => f.id === targetUser.id);
      if (isFollowing) return old.filter((f) => f.id !== targetUser.id);
      return [...old, targetUser];
    });
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingButton(false);
  }
};

const submitModalFollow = async (
  user,
  follow,
  userFollows,
  setUserFollows,
  profile,
  setFollowUser
) => {
  try {
    if (user.id === follow.id) return;
    await userFollow(follow.id);

    const isFollowing = userFollows.some((f) => f.id === follow.id);
    if (isFollowing) {
      setUserFollows((old) => old.filter((f) => f.id !== follow.id));
    } else {
      setUserFollows((old) => [...old, follow]);
    }

    if (follow.id === profile.id) {
      setFollowUser(!isFollowing);
    }
  } catch (e) {
    console.error(e);
  }
};
const submitModalRequest = async (user, follow, setRequests, requests) => {
  try {
    if (user.id === follow.id) return;
    await userRequest(follow.id);

    const isRequested = requests.some((f) => f.id === follow.id);
    if (isRequested) {
      setRequests((old) => old.filter((f) => f.id !== follow.id));
    } else {
      setRequests((old) => [...old, follow]);
    }
  } catch (e) {
    console.error(e);
  }
};
const UserListModal = ({
  userName,
  isOpen,
  onClose,
  users,
  listType,
  user,
  userFollows,
  setUserFollows,
  profile,
  setFollowUser,
  requests,
  setRequests,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-profile/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-cards max-h-[30rem] rounded-3xl p-5 min-lg:ml-80 w-auto overflow-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <h1 className="font-other font-light text-secondary text-lg mb-4">
            {userName}'s {listType === 0 ? "followers" : "following"} list (
            {users.length})
          </h1>
          <div className="flex flex-col gap-4 flex-grow justify-around">
            {users.map((follow) => {
              const isSelf = user.id === follow.id;
              const isFollowing = userFollows.some((f) => f.id === follow.id);
              const isRequested = requests.some((r) => r.id === follow.id);

              return (
                <div key={follow.id} className="flex items-center">
                  <NavLink
                    to={`/profile/${follow.username}`}
                    className="flex items-center space-x-3 truncate w-60"
                  >
                    <img
                      src={
                        `${follow.avatar}` ||
                        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                      }
                      alt={follow.username}
                      className="h-10 w-10 rounded-full object-cover"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <span className="text-secondary font-other">
                      {follow.username}
                    </span>
                  </NavLink>

                  {!isSelf && (
                    <button
                      className={`rounded-lg h-5 ${
                        isFollowing || isRequested
                          ? "bg-profile/50 "
                          : "bg-active"
                      } text-secondary font-other cursor-pointer hover:scale-102 flex items-center justify-center space-x-2 p-3 text-sm w-26 ml-20`}
                      onClick={() => {
                        if (follow.accounttype || isFollowing) {
                          submitModalFollow(
                            user,
                            follow,
                            userFollows,
                            setUserFollows,
                            profile,
                            setFollowUser
                          );
                        } else
                          submitModalRequest(
                            user,
                            follow,
                            setRequests,
                            requests
                          );
                      }}
                    >
                      {isFollowing
                        ? "Unfollow"
                        : follow.accounttype
                        ? "Follow"
                        : isRequested
                        ? "Unrequest"
                        : "Request"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Profile = () => {
  const { name } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userFollows, setUserFollows] = useState([]);
  const [followUser, setFollowUser] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [usersListOpen, setUsersListOpen] = useState(false);
  const [listType, setListType] = useState(0);
  const [requested, setRequested] = useState(false);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [story, setStory] = useState();
  const didRun = useRef(false);
  useEffect(() => {
    let ignore = false;
    const ctrl = new AbortController();

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const [
          profileRes,
          followersRes,
          followingRes,
          requestsRes,
          loggedFollowing,
          postsRes,
        ] = await Promise.all([
          userData(name, { signal: ctrl.signal }),
          userFollowers(name, { signal: ctrl.signal }),
          userFollowing(name, { signal: ctrl.signal }),
          userRequesting(user.username, { signal: ctrl.signal }),
          userFollowing(user.username, { signal: ctrl.signal }),
          getUserPosts((await userData(name)).data.id),
        ]);

        if (ignore) return;

        setProfile(profileRes.data);
        setFollowers(followersRes.data);
        setFollowing(followingRes.data);
        setRequests(requestsRes.data);
        setUserFollows(loggedFollowing.data);
        setPosts(postsRes);
        const storyData = await getUserStory(profileRes.data.id);
        setStory(storyData);

        const isFollowing = followersRes.data.some((f) => f.id === user.id);
        const isRequested = requestsRes.data.some(
          (r) => r.id === profileRes.data.id
        );
        setFollowUser(isFollowing);
        setRequested(isRequested);
      } catch (err) {
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      ignore = true;
      ctrl.abort();
    };
  }, [name, user.username]);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        theme: "dark",
        title: "Whoops!",
        text: "Please select an image.",
        icon: "error",
        confirmButtonColor: "#d155e6",
      });
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        theme: "dark",
        title: "Whoops!",
        text: "Max 5MB",
        icon: "error",
        confirmButtonColor: "#d155e6",
      });
      e.target.value = "";
      return;
    }

    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await api.post("/users/avatar", fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (res.data?.avatar) {
        setProfile((p) => ({ ...p, avatar: res.data.avatar }));
      }
      Swal.fire({
        theme: "dark",
        title: "Updated!",
        text: "Your profile picture has been updated!",
        icon: "success",
        confirmButtonColor: "#d155e6",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed.");
      Swal.fire({
        theme: "dark",
        title: "Whoops!",
        text: res.message,
        icon: "error",
        confirmButtonColor: "#d155e6",
      });
    } finally {
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!loading) {
      const isFollowing = followers.some((f) => f.id === user.id);
      setFollowUser(isFollowing);
      const isRequested = requests.some((f) => f.id === profile.id);
      setRequested(isRequested);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center text-secondary items-center min-lg:ml-80 min-h-screen">
        <ClipLoader color="" size={60} />
      </div>
    );
  }

  return (
    <div className="mt-30 min-lg:ml-90">
      <div className="flex pl-8 max-lg:pl-13 items-center space-x-7 flex-grow">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        <div className="relative inline-block">
          <img
            src={`${profile.avatar}`}
            alt={profile.username}
            className={`flex grow rounded-full h-36 w-36 max-lg:h-20 max-lg:w-20 object-fit relative shrink-0 ${
              name === user.username
                ? "hover:opacity-40 cursor-pointer transition-all duration-100"
                : story?.is_public
                ? story?.viewed
                  ? "border-5 border-gray-400 cursor-pointer"
                  : "border-3 border-active cursor-pointer"
                : ""
            }`}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
              if (name === user.username) {
                handleClick();
              } else {
                if (story?.is_public) {
                  navigate(`/story/${profile.id}?mode=single`);
                }
              }
            }}
          />
          <EditIcon
            className={`absolute -right-2 bottom-2 h-10 w-10 text-secondary bg-profile rounded-full p-2 shadow-md cursor-pointer hover:scale-110 transition-transform duration-150 ${
              name !== user.username ? "hidden" : ""
            }`}
            onClick={() => {
              if (name === user.username) {
                handleClick();
              }
            }}
          />
        </div>
        <div className="flex flex-col space-y-0.5">
          <h1 className="text-secondary font-bold font-other text-3xl max-lg:text-xl">
            {profile.username}
          </h1>

          <div className="flex items-center space-x-3 mt-2 font-other">
            <h1
              className="text-secondary font-other text-md cursor-pointer"
              onClick={() => {
                if (
                  profile.accounttype ||
                  followUser ||
                  user.username === name
                ) {
                  setUsersListOpen(true);
                  setListType(0);
                }
              }}
            >
              <div className="flex flex-col text-[0.9rem]">
                <p>
                  <b>{followers.length}</b>
                </p>
                <p>followers</p>
              </div>
            </h1>
            <h1
              className="text-secondary font-other text-md cursor-pointer"
              onClick={() => {
                if (
                  profile.accounttype ||
                  followUser ||
                  user.username === name
                ) {
                  setUsersListOpen(true);
                  setListType(1);
                }
              }}
            >
              <div className="flex flex-col text-[0.9rem] ">
                <p>
                  <b>{following.length}</b>
                </p>
                <p>following</p>
              </div>
            </h1>
          </div>

          <div className="flex space-x-3 mt-3">
            {name !== user.username ? (
              <button
                className={`rounded-xl h-8 flex-grow ${
                  followUser || requested
                    ? "bg-inactive text-secondary"
                    : "bg-active text-text-highlight"
                }  font-other cursor-pointer hover:scale-102 flex items-center justify-center space-x-2 p-5 text-contrast`}
                onClick={() => {
                  if (profile.accounttype || followUser) {
                    submitProfileFollow(
                      user,
                      setFollowUser,
                      setLoadingButton,
                      setFollowers,
                      profile,
                      setUserFollows
                    );
                  } else
                    submitProfileFollowRequest(
                      user,
                      setLoadingButton,
                      profile,
                      setRequested
                    );
                }}
              >
                {loadingButton ? (
                  <ClipLoader color="text-text-highlight" size={20} />
                ) : (
                  <FollowIcon className="h-5 w-5" />
                )}
                <span className="max-lg:text-xs">
                  {followUser
                    ? "Unfollow"
                    : profile.accounttype
                    ? "Follow"
                    : requested
                    ? "Cancel request"
                    : "Request"}
                </span>
              </button>
            ) : (
              <NavLink
                to="/settings"
                className="rounded-xl h-8 flex-grow bg-inactive text-secondary font-other hover:scale-102 flex items-center justify-center space-x-2 p-5"
              >
                <SettingsIcon className="h-5 w-5 text-secondary" />
                <span className="max-lg:text-xs">Settings</span>
              </NavLink>
            )}
            {name !== user.username && (profile.accounttype || followUser) && (
              <button
                className="rounded-xl h-8 bg-inactive font-other hover:scale-102 flex items-center justify-center space-x-2 py-5 px-3 cursor-pointer"
                onClick={() => handleConversation(profile, navigate)}
              >
                <MessageIcon className="h-6 max-md:ml-1 text-secondary" />
                <span className="max-md:hidden text-secondary">Message</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {profile.accounttype || followUser || name === user.username ? (
        <>
          <h1 className="font-title ml-16 min-lg:ml-10 text-lg   text-secondary mt-5 max-lg:mb-5 tracking-[0.25em]">
            Posts
          </h1>

          <div className="flex flex-wrap flex-grow justify-start max-lg:ml-15 max-lg:pr-15 min-lg:p-10 gap-5">
            {posts.length > 0 ? (
              posts.map((post) => {
                if (post.is_public)
                  return (
                    <PostCard
                      key={post.id}
                      imgUrl={`${post.image}`}
                      likes={post.likes_count}
                      comments={post.comments_count}
                      to={`/post/${post.id}`}
                    />
                  );
              })
            ) : (
              <span className="text-secondary flex justify-center text-lg">
                No posts to show.
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="text-secondary flex flex-col items-center justify-center gap-5 mt-20 overflow-hidden">
          <PrivateIcon className="h-36" />
          <h1>This account is private.</h1>
        </div>
      )}
      <UserListModal
        isOpen={usersListOpen}
        userName={name}
        onClose={() => setUsersListOpen(false)}
        users={listType === 0 ? followers : following}
        listType={listType}
        user={user}
        userFollows={userFollows}
        setUserFollows={setUserFollows}
        profile={profile}
        setFollowUser={setFollowUser}
        setRequested={setRequested}
        requests={requests}
        setRequests={setRequests}
      />
    </div>
  );
};

export default Profile;
