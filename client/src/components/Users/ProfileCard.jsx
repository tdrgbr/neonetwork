import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DOMAIN } from "../../utils/config";

const ProfileCard = () => {
  const { user } = useAuth();
  return (
    <NavLink
      to={`/profile/${user.username}`}
      className={({ isActive }) =>
        !isActive
          ? "mt-8 bg-profile h-auto rounded-xl text-secondary font-other p-3 flex justify-between hover:bg-profile/30 hover:cursor-pointer hover:shadow-lg hover:scale-105 hover:transition hover:duration-300 scale-105 transition duration-300"
          : "mt-8 bg-profile/30 h-auto rounded-xl text-secondary font-other p-3 flex justify-between hover:scale-100 hover:transition hover:duration-300 duration-300"
      }
    >
      <div className="flex items-center">
        <img
          src={`${user.avatar}`}
          alt={user.username}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="h-13 w-13 rounded-full shrink-0 p-0"
        />
        <div className="ml-3 p-1.5">
          <h2 className="font-bold text-[0.9rem]">{user.username}</h2>
          <h2 className="text-secondary text-[0.8rem]">
            {user.accounttype ? "Public account" : "Private account"}
          </h2>
        </div>
      </div>
    </NavLink>
  );
};

export default ProfileCard;
