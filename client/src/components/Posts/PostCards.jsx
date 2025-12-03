import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ClipLoader } from "react-spinners";
import ShowPost from "./ShowPost";
import { getFeed } from "../../utils/postsApi";

const LIMIT = 10;

const PostCards = () => {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const isFetchingRef = useRef(false);
  const didInit = useRef(false);

  const mergeUnique = (prev, next) => {
    const seen = new Set(prev.map((x) => x.id));
    return [...prev, ...next.filter((x) => !seen.has(x.id))];
  };

  const fetchPage = async (p) => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    try {
      const offset = p * LIMIT;
      const data = await getFeed(LIMIT, offset);
      setFeed((prev) => mergeUnique(prev, data));
      if (!data || data.length < LIMIT) setHasMore(false);
      setPage((prev) => prev + 1);
    } catch {
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchPage(0);
  }, []);

  if (initialLoading && feed.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#b15af5" size={60} />
      </div>
    );
  }

  return (
    <>
      <h1 className="font-title mt-10 ml-7 mb-6 text-2xl text-white">
        <span className="text-secondary">Feed / </span>Latest posts
      </h1>

      <InfiniteScroll
        dataLength={feed.length}
        next={() => fetchPage(page)}
        hasMore={hasMore}
        loader={
          <div className="py-6 flex justify-center">
            <ClipLoader size={28} color="#b15af5" />
          </div>
        }
        endMessage={
          <div className="py-6 text-sm text-white font-other text-center">
            You've reached the end!
          </div>
        }
        style={{ overflow: "visible" }}
      >
        <div className="flex flex-col space-y-10 pr-4 items-center min-xl:grid min-xl:grid-cols-[repeat(auto-fit,minmax(510px,1fr))] rounded-2xl shrink-0 min-xl:gap-y-10 min-xl:gap-x-10 ml-4">
          {feed.map((p) => (
            <ShowPost key={p.id} post={p} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
};

export default PostCards;
