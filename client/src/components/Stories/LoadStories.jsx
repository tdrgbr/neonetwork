import React from "react";
import { NavLink } from "react-router-dom";
import { DOMAIN } from "../../utils/config";

const LoadStories = ({ story }) => {
  return (
    <NavLink
      to={`/story/${story.user_id}?mode=feed`}
      className="flex flex-col items-center space-y-2 shrink-0"
    >
      <div className="relative inline-block">
        <img
          src={`${story.avatar}`}
          alt="add_story"
          className={`h-17 w-17 rounded-full object-cover border-3 ${
            story.viewed ? "border-gray-400" : "border-fuchsia-500"
          }`}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <span className="font-other text-secondary text-sm">
        {story.username}
      </span>
    </NavLink>
  );
};

export default LoadStories;
