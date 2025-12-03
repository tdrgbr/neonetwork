import { useState, useEffect } from "react";
import { calcDate } from "../../utils/calculateDate";
import { NavLink } from "react-router";
import { DOMAIN } from "../../utils/config";

const ShowComment = ({ comment }) => {
  const [time, setTime] = useState("");
  const [unit, setUnit] = useState("");
  useEffect(() => {
    const { time, unit } = calcDate(comment.created_at);
    setTime(time);
    setUnit(unit);
  }, []);
  return (
    <div className="flex flex-col p-3">
      <div className="flex items-center space-x-2">
        <NavLink to={`/profile/${comment.username}`}>
          <img
            src={`${comment.avatar}`}
            alt="profile_img"
            className="h-7 w-7 rounded-full object-cover max-lg:h-8 max-lg:w-8"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </NavLink>
        <NavLink to={`/profile/${comment.username}`}>
          <h1 className="font-other text-white font-bold">
            {comment.username}{" "}
            <span className="text-sm text-secondary font-normal ml-1">
              {time}
              {unit}
            </span>
          </h1>
        </NavLink>
      </div>
      <p className="font-other text-white mt-2">{comment.comment}</p>
    </div>
  );
};

export default ShowComment;
