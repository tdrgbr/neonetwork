import React from "react";

import StoriesBar from "../components/Stories/StoriesBar";
import PostCards from "../components/Posts/PostCards";

const Feed = () => {
  return (
    <>
      <main className="flex-1 min-lg:ml-85 mt-30 p-0 min-h-screen">
        <StoriesBar />
        <PostCards />
      </main>
    </>
  );
};

export default Feed;
