import React, { useState, useEffect } from "react";
import LoadStories from "./LoadStories";
import { NavLink } from "react-router-dom";
import { storyStats, getFeed } from "../../utils/storyApi";
import { useAuth } from "../../context/AuthContext";
import { DOMAIN } from "../../utils/config";

const StoriesBar = () => {
  const { user } = useAuth();
  const [userStory, setUserStory] = useState();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const LoadUserStory = async () => {
      try {
        const data = await storyStats();
        setUserStory(data);
      } catch (e) {
        setUserStory(null);
      }
    };
    const LoadStories = async () => {
      try {
        const data = await getFeed();
        setFeed(data);
        setLoading(false);
      } catch (e) {
        setFeed([]);
      }
    };
    LoadUserStory();
    LoadStories();
  }, []);
  if (loading) {
    return <div></div>;
  }
  return (
    <div
      className="flex scrollbar-hide items-center justify-start ml-5 mt-3 space-x-8 overflow-x-auto min-lg:space-x-12 scroll-mx-36 pb-5 mr-4"
      onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
    >
      {userStory ? (
        <NavLink
          to={`/story/`}
          className="flex flex-col items-center space-y-2 shrink-0"
        >
          <div className="relative inline-block">
            <img
              src={`${user.avatar}`}
              alt="add_story"
              className={`h-17 w-17 rounded-full object-cover border-2 border-blue-300`}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          <span className="font-other text-secondary text-sm">Your story</span>
        </NavLink>
      ) : (
        <NavLink
          to="/addstory"
          className="flex flex-col items-center space-y-2 shrink-0"
        >
          <div className="relative inline-block">
            <img
              src={`${user.avatar}`}
              alt="add_story"
              className="h-16 w-16 rounded-full object-cover"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="absolute bottom-0 right-0 bg-active text-secondary rounded-full h-6 w-6 flex items-center justify-center border-2 border-[#1e1f3f] font-extrabold text-md">
              <img src="https://imgur.com/lJfdvan.png" alt="Add story" />
            </div>
          </div>
          <span className="font-other text-secondary text-sm">Add story</span>
        </NavLink>
      )}
      {feed?.map((f) => (
        <LoadStories story={f} key={f.id} />
      ))}
    </div>
  );
};

export default StoriesBar;
