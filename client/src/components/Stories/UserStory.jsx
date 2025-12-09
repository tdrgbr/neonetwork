import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import LikeIcon from "../../assets/icons/like.svg?react";
import ViewIcon from "../../assets/icons/view.svg?react";
import DeleteIcon from "../../assets/icons/delete.svg?react";
import { deleteStory, storyStats } from "../../utils/storyApi";
import { calcDate } from "../../utils/calculateDate";
import { ClipLoader } from "react-spinners";

const StoryStats = ({ story, likers, viewers }) => {
  return (
    <div className="bg-cards w-md rounded-3xl p-5 max-h-[30rem]">
      <div className="flex items-center space-x-2 p-3">
        <ViewIcon className="h-9" />
        <h1 className="font-other font-light text-white text-lg">
          {story.views_count}
        </h1>
        <LikeIcon className="h-12 max-lg:h-6 w-6 text-active" />
        <h1 className="font-other font-light text-white text-lg">
          {story.likes_count}
        </h1>
      </div>

      <div className="flex-col mt-4 p-3 space-y-1.2 max-h-[20rem] overflow-auto">
        {viewers.map((v) => {
          const liked = likers.some((l) => l.id === v.id);
          return (
            <NavLink
              to={`/profile/${v.username}`}
              className="flex justify-start items-center space-x-2 pb-3"
            >
              <img
                src={`${v.avatar}`}
                alt="profile_img"
                className="h-7 w-7 rounded-full object-cover max-lg:h-8 max-lg:w-8"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="flex items-center justify-between w-full">
                <h1 className="font-other text-white font-normal">
                  {v.username}
                </h1>
                <LikeIcon
                  className={`h-12 max-lg:h-6 w-6 ${
                    liked ? "text-active" : "text-secondary"
                  }`}
                />
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
const UserStory = () => {
  const [viewsOpen, setViewsOpen] = useState(false);
  const [story, setStory] = useState([]);
  const [likers, setLikers] = useState([]);
  const [viewers, setViewers] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const StoryDelete = async (storyId) => {
    try {
      await deleteStory(storyId);
    } catch (e) {}
  };
  useEffect(() => {
    const getUseStoryStats = async () => {
      try {
        const data = await storyStats();
        setStory(data);
        setViewers(data.viewers);
        setLikers(data.likers);
        setLoading(false);
      } catch {
        navigate("/addstory");
      }
    };
    getUseStoryStats();
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen min-lg:ml-80">
        <ClipLoader color="#b15af5" size={60} />
      </div>
    );
  }
  return (
    <>
      <div className="flex w-full justify-center mt-30 items-stretch min-xl:space-x-10">
        <div className="relative min-lg:ml-90 max-xl:overflow-hidden">
          <img
            src={`${story.image}`}
            alt="story"
            className="rounded-3xl w-md min-lg:h-[40rem] h-full shrink-0 max-xl:cursor-pointer pointer-events-auto min-xl:pointer-events-none object-cover"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => setViewsOpen(!viewsOpen)}
          />

          {/* Top overlay */}
          <div className="absolute top-0 left-0 w-full flex flex-col justify-between">
            <div className="flex justify-between items-center p-4">
              <div className="flex space-x-3 items-center bg-black/50 text-white font-other text-md rounded-xl px-2 py-1">
                <img
                  src={`${story.avatar}`}
                  alt="profile"
                  className="h-8 w-8 rounded-full"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div>
                  {story.username}{" "}
                  <span className="text-secondary text-sm">
                    {calcDate(story.created_at).time}
                    {calcDate(story.created_at).unit}
                  </span>
                </div>
              </div>

              <button
                className="bg-black/50 text-white rounded-2xl shadow-lg cursor-pointer"
                onClick={() => {
                  StoryDelete(story.id);
                  navigate("/");
                }}
              >
                <DeleteIcon className="h-12 w-12 p-3" />
              </button>
            </div>
          </div>

          <div className="min-lg:hidden absolute bottom-0 left-0 w-full border-white bg-black/50 p-3 rounded-b-3xl">
            <div className="flex items-center space-x-12 ml-3">
              <div className="flex items-center space-x-1">
                <ViewIcon className="h-9" />
                <h1 className="font-other text-white font-bold">
                  {story.views_count}
                </h1>
              </div>
              <h1 className="font-other text-white font-normal text-sm">
                Tap the image to see your viewers & likes
              </h1>
            </div>
          </div>
        </div>

        <div className="hidden min-xl:flex">
          <StoryStats story={story} likers={likers} viewers={viewers} />
        </div>
      </div>

      {/* Modal for viewers */}
      <AnimatePresence>
        {viewsOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center h-full justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewsOpen(false)}
          >
            <motion.div
              className="bg-cards max-h-[30rem] rounded-3xl p-5 min-lg:ml-80"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <StoryStats story={story} likers={likers} viewers={viewers} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserStory;
