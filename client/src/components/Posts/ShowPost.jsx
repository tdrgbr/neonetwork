import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ShowComment from "./ShowComment";
import { useNavigate, NavLink } from "react-router-dom";
import LikeIcon from "../../assets/icons/like.svg?react";
import DeleteIcon from "../../assets/icons/delete.svg?react";
import CommentIcon from "../../assets/icons/comment.svg?react";
import { likePost, commentPost, deletePost } from "../../utils/postsApi";
import { calcDate } from "../../utils/calculateDate";
import { useAuth } from "../../context/AuthContext";
import { DOMAIN } from "../../utils/config";

const handleSubmit = async (postId, comment, setPost, setComment, user) => {
  if (!comment.trim()) return;
  const newComment = {
    id: Date.now(),
    comment,
    created_at: Date.now(),
    username: user.username,
    avatar: user.avatar,
  };

  setPost((prev) => ({
    ...prev,
    comments_count: Number(prev.comments_count) + 1,
    comments: [newComment, ...prev?.comments],
  }));

  setComment("");

  try {
    await commentPost(postId, newComment.comment);
  } catch (err) {
    console.error(err);
  }
};
function CommentInput({ postId, setPost, user }) {
  const [comment, setComment] = useState("");
  return (
    <div className="mt-8 bg-cards w-auto h-10 mr-4 rounded-xl text-secondary font-other relative">
      <div className="flex">
        <NavLink to={`/profile/${user.username}`}>
          <img
            src={`${user.avatar}`}
            alt="avatar"
            className="h-14 rounded-full mr-5"
          />
        </NavLink>
        <input
          type="text"
          className="w-full focus:outline-blue-300 rounded-xl outline-1 outline-active focus:outline-1 h-14 p-6 placeholder-gray-400 focus:placeholder-gray-300"
          placeholder="Add a comment.."
          onChange={(e) => setComment(e.target.value)}
          value={comment}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(postId, comment, setPost, setComment, user);
              e.preventDefault();
            }
          }}
        />
      </div>
      <img
        src="https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/send-white-icon.png"
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        onClick={() => handleSubmit(postId, comment, setPost, setComment, user)}
        className="absolute right-5 top-1/2 h-4 w-5 cursor-pointer"
      />
    </div>
  );
}

const CommentList = React.memo(({ comments }) => {
  comments;
  if (!comments) {
    return (
      <h2 className="font-other text-secondary mt-30 p-5 text-center">
        There are currently no comments. What about breaking the ice?
      </h2>
    );
  }

  return (
    <div className="h-96 overflow-y-scroll flex flex-col space-y-3">
      {comments.map((comment) => (
        <ShowComment key={comment.id} comment={comment} />
      ))}
    </div>
  );
});

const ShowPost = ({ post }) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  if (!post) return null;
  const [liked, setLiked] = useState(post.liked_by_me);
  const [loadAction, setLoadAction] = useState(false);
  const [time, setTime] = useState("");
  const [unit, setUnit] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialLocal = post ?? {
    id: null,
    image: "",
    avatar: "",
    username: "",
    description: "",
    likes_count: 0,
    comments_count: 0,
    comments: [],
    created_at: Date.now(),
    liked_by_me: false,
  };
  const [localPost, setLocalPost] = useState(initialLocal);

  useEffect(() => {
    const { time, unit } = calcDate(post.created_at);
    setTime(time);
    setUnit(unit);
  }, []);

  return (
    <>
      <div className="flex flex-col space-y-0 shrink-0 mb-10 w-full max-w-[520px]">
        <div className="relative">
          <div className="absolute -top-3 -right-3 flex flex-col justify-between">
            {post.username === user.username ? (
              <button
                className="bg-secondary p-3 text-text-highlight rounded-2xl shadow-lg cursor-pointer"
                onClick={async () => {
                  await deletePost(post.id);
                  navigate(`/profile/${user.username}`);
                }}
              >
                <DeleteIcon className="h-6 w-6" />
              </button>
            ) : (
              ""
            )}
          </div>
          <img
            src={`${localPost.image}`}
            alt="post_image"
            className="rounded-t-3xl w-full  object-cover aspect-[2/3] "
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        <div className="bg-cards w-full rounded-b-2xl p-6 flex flex-col lg:flex-row lg:space-x-6 space-y-4 lg:space-y-0">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col justify-center truncate">
                <NavLink to={`/profile/${post.username}`}>
                  <img
                    src={`${localPost.avatar}`}
                    alt={localPost.username}
                    className="h-25 w-25 rounded-full object-cover max-lg:h-15 max-lg:w-15 mb-3"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </NavLink>
                <NavLink
                  to={`/profile/${localPost.username}`}
                  className="space-x-3"
                >
                  <span className="font-other font-bold text-secondary text-lg truncate">
                    {localPost.username}
                  </span>
                  <span className="font-other text-secondary text-sm truncate">
                    {time}
                    {unit}
                  </span>
                </NavLink>
                <span className="font-other text-secondary text-md mt-2 truncate">
                  {localPost.description}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 justify-start ">
            <div className="flex items-center">
              <div
                className="flex flex-col items-center justify-center cursor-pointer"
                onClick={async () => {
                  if (!loadAction) {
                    setLoadAction(true);
                    await likePost(post.id);
                    setLiked(!liked);
                    const currentLikes = Number(localPost.likes_count) || 0;
                    if (!liked) localPost.likes_count = currentLikes + 1;
                    else localPost.likes_count = Math.max(currentLikes - 1, 0);
                    setLoadAction(false);
                  }
                }}
              >
                <LikeIcon
                  className={`h-10 w-10 ${
                    liked ? "text-active" : "text-secondary"
                  }`}
                />

                <h1
                  className={`font-other  text-md mt-1 ${
                    liked ? "text-active" : "text-secondary"
                  }`}
                >
                  {localPost.likes_count}
                </h1>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className="flex flex-col items-center justify-center cursor-pointer"
                onClick={() => setCommentsOpen(!commentsOpen)}
              >
                <CommentIcon className="h-10 w-10 text-secondary" />
                <h1 className="font-other text-secondary text-md mt-1">
                  {localPost.comments_count}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <div className="min-xl:ml-80 fixed inset-0 z-50 flex items-start justify-start h-full">
            <motion.div
              className="pt-30 absolute inset-0 bg-black/30 p-4 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentsOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "200%" }}
              transition={{ duration: 0.3 }}
              className="relative w-3xl max-lg:mr-7 bg-cards rounded-2xl p-4 shadow-lg left-1/2 transform -translate-x-1/2 mt-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <NavLink to={`/profile/${localPost.username}`}>
                    <img
                      src={`${localPost.avatar}`}
                      alt="profile_img"
                      className="h-15 w-15 rounded-full object-cover max-lg:h-8 max-lg:w-8"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </NavLink>
                  <div className="flex-col">
                    <h1 className="font-title tracking-widest font-bold text-secondary text-xl">
                      {localPost.username}'s post
                    </h1>
                    <h1 className="font-other text-secondary text-md">
                      {time}
                      {unit}
                    </h1>
                  </div>
                </div>
                <img
                  src="https://uxwing.com/wp-content/themes/uxwing/download/user-interface/remove-close-round-white-icon.png"
                  className="h-8 cursor-pointer pr-1"
                  onClick={() => setCommentsOpen(!commentsOpen)}
                />
              </div>

              <div className="mt-10 items-center space-x-3 space-y-3 h-128">
                <CommentList comments={localPost.comments} />
                <CommentInput
                  postId={localPost.id}
                  setPost={setLocalPost}
                  user={user}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShowPost;
