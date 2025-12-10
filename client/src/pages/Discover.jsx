import React, { useEffect, useState } from "react";
import Searchbar from "../components/Layout/Searchbar";
import { NavLink } from "react-router-dom";
import { getDiscover } from "../utils/userApi";
import { DOMAIN } from "../utils/config";

const Discover = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        const data = await getDiscover();
        setUsers(data);
      } catch {}
    };
    fetchDiscover();
  }, []);

  return (
    <>
      <h1 className="font-title mt-30 ml-7 min-lg:ml-90 text-2xl text-secondary">
        <span className="text-secondary">Connections / </span>Discover
      </h1>

      <div className="flex flex-grow justify-between h-14 pr-5 min-lg:ml-89 ml-7 mt-10 min-lg:hidden">
        <Searchbar />
      </div>

      <h1 className="font-other ml-7 mt-10 min-lg:ml-90 text-lg text-secondary tracking-tight">
        Suggested for you
      </h1>

      <div className="mt-3 grid grid-cols-1 min-xl:grid-cols-2 gap-x-10 gap-y-5 min-lg:ml-83 p-6  z-10">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-cards w-full h-35 rounded-2xl hover:transition-all hover:scale-101 hover:shadow-lg hover:duration-300"
          >
            <div className="flex p-6 items-center justify-between">
              <div className="flex items-center space-x-5">
                <NavLink to={`/profile/${user.username}`}>
                  <img
                    src={`${user.avatar}`}
                    alt="profile_img"
                    className="h-24 rounded-full object-cover"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </NavLink>
                <div className="flex-col">
                  <NavLink
                    to={`/profile/${user.username}`}
                    className="font-other text-secondary text-xl font-bold"
                  >
                    {user.username}
                  </NavLink>
                  <h1 className="font-other text-secondary text-lg">
                    {user.followers_count} followers
                  </h1>
                </div>
              </div>

              <NavLink
                to={`/profile/${user.username}`}
                className="rounded-xl h-10 w-34 bg-active/40 text-secondary font-other cursor-pointer hover:transition hover:scale-102 font-tightest flex items-center justify-center space-x-2"
              >
                <span>View profile</span>
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Discover;
