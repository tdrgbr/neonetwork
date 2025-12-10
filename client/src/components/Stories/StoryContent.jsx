import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import LikeIcon from "../../assets/icons/like.svg?react";
import {
  getFeed,
  getUserStory,
  likeStory,
  viewStory,
} from "../../utils/storyApi";
import { ClipLoader } from "react-spinners";
import { DOMAIN } from "../../utils/config";
const StoryContent = () => {
  const [progress, setProgress] = useState(0);
  const [pause, setPause] = useState(false);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState([]);
  const { storyUserId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const placeholder = "<div></div>";
  const [isFinished, setIsFinised] = useState(false);

  useEffect(() => {
    const LoadStories = async () => {
      if (mode === "single") {
        try {
          const data = await getUserStory(storyUserId);
          setFeed([data]);
          setIndex(0);
          setProgress(0);
          setLiked([!!data.liked_by_me]);
        } catch (e) {
          navigate("/");
        }
      } else if (mode === "feed") {
        try {
          const data = await getFeed();
          const idx = data.findIndex((s) => s.user_id == storyUserId);
          const reordered =
            idx > -1
              ? [data[idx], ...data.slice(0, idx), ...data.slice(idx + 1)]
              : data;

          setFeed(reordered);
          setLiked(reordered.map((s) => !!s.liked_by_me));

          data?.[0]?.user_id;
          setIndex(0);
          setProgress(0);
        } catch (e) {
          navigate("/");
        }
      } else {
        navigate("/");
      }
      setLoading(false);
    };
    LoadStories();
  }, []);

  useEffect(() => {
    if (feed.length === 0) return;

    const StoryView = async () => {
      try {
        await viewStory(feed[index].id);
      } catch {}
    };
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (pause) return prev;
        if (prev >= 100) {
          setIndex((prevIndex) => {
            if (prevIndex === feed.length - 1) {
              setIsFinised(true);
              return prevIndex;
            }
            return prevIndex + 1;
          });
          return 0;
        }
        return prev + 1;
      });
    }, 50);
    if (isFinished) {
      if (mode === "single") return navigate(`/profile/${feed[0].username}`);
      else if (mode === "feed") return navigate("/");
    }
    StoryView();
    return () => clearInterval(interval);
  }, [pause, feed.length, navigate, index, isFinished]);

  if (feed.length === 0) {
    return (
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden pt-6 pb-10 mt-15">
        <motion.div
          className="absolute inset-0 bg-cards rounded-2xl shadow-lg h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <div className="rounded-3xl h-[60vh] max-h-[60vh] aspect-[3/4] object-cover z-10" />
      </div>
    );
  }

  const curr = feed[index];
  const prevItem = index > 0 ? feed[index - 1] : null;
  const nextItem = index < feed.length - 1 ? feed[index + 1] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-secondary">
        <ClipLoader color="" size={60} />
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden pt-6 pb-10 mt-15">
      <motion.div
        className="absolute inset-0 rounded-2xl shadow-lg h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <div className="relative flex items-center justify-center w-full h-full min-lg:ml-80">
        {/* Previous story */}
        <AnimatePresence mode="wait">
          {prevItem ? (
            <motion.img
              key={`left-${index}`}
              src={prevItem?.image}
              className="rounded-3xl max-h-[60vh] aspect-[3/4] max-lg:h-[40vh] max-lg:w-30 blur-md object-cover absolute left-1/9 max-lg:left-2 top-1/2 transform -translate-y-1/2 z-0 cursor-pointer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={() => {
                if (index === 0) {
                  if (mode === "single")
                    return navigate(`/profile/${feed[0].username}`);
                  else if (mode === "feed") return navigate("/");
                }
                setDirection(0);
                setProgress(0);
                setIndex((i) => Math.max(0, i - 1));
                setPause(false);
              }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <motion.div
              className="rounded-3xl h-[60vh] max-h-[60vh] max-lg:h-[30vh] max-lg:w-20 blur-md  z-0 cursor-pointer min-lg:pl-50 bg-inactive"
              onClick={() => {
                if (mode === "single")
                  return navigate(`/profile/${feed[0].username}`);
                else if (mode === "feed") return navigate("/");
              }}
            ></motion.div>
          )}
        </AnimatePresence>

        {/* Central story */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}`}
            className="relative z-10 flex flex-col items-center"
            initial={{ x: direction !== 0 ? -300 : 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction === 0 ? 300 : -300, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={curr?.image ? `${curr.image}` : ""}
              alt="story"
              className="rounded-t-2xl aspect-[9/16] max-h-[80vh] max-lg:min-h-[70vh] object-cover cursor-pointer shrink-0"
              onClick={() => setPause((p) => !p)}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Overlay */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none">
              {/* Header */}
              <div className="flex justify-between items-center p-4 pointer-events-auto">
                <NavLink
                  to={`/profile/${curr?.username}`}
                  className="flex space-x-3 items-center bg-secondary/50 text-text-highlight font-other text-md rounded-xl px-3 py-2 max-w-[70%] truncate"
                >
                  <img
                    src={`${curr?.avatar}`}
                    alt="profile"
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="truncate">
                    <span className="font-bold truncate">
                      {curr?.username || ""}
                    </span>
                    <span className="text-text-highlight text-sm ml-1">
                      1h ago
                    </span>
                  </div>
                </NavLink>

                <button
                  className="bg-black/50 text-secondary rounded-2xl p-2 shadow-lg flex-shrink-0 ml-2"
                  onClick={() => {
                    if (mode === "single")
                      return navigate(`/profile/${curr?.username}`);
                    else if (mode === "feed") return navigate("/");
                  }}
                >
                  <img
                    src="https://uxwing.com/wp-content/themes/uxwing/download/user-interface/remove-close-round-white-icon.png"
                    className="h-8 cursor-pointer"
                    alt="close"
                  />
                </button>
              </div>

              {/* Progress bar */}
              <div
                className="bg-active w-full max-lg:w-full rounded-b-3xl h-2 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />

              {/* Like button */}
              <button
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary/50 text-text-highlight rounded-2xl p-3 shadow-lg text-xl pointer-events-auto "
                onClick={async () => {
                  try {
                    likeStory(feed[index].id);

                    setLiked((prev) => {
                      const arr = [...prev];
                      arr[index] = !arr[index];
                      return arr;
                    });
                  } catch (e) {}
                }}
              >
                <LikeIcon
                  className={`h-10 w-10 hover:scale-110 transition-transform duration-200 ${
                    liked[index]
                      ? "text-active scale-110"
                      : "text-text-highlight"
                  }`}
                />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next story */}
        <AnimatePresence mode="wait">
          {nextItem ? (
            <motion.img
              key={`right-${index}`}
              src={nextItem?.image ? `${nextItem.image}` : placeholder}
              alt="next_story"
              className="rounded-3xl max-h-[60vh] aspect-[3/4] max-lg:h[40vh] max-lg:w-30 blur-md object-cover absolute right-3 max-lg:-right-20 top-1/2 transform -translate-y-1/2 z-0 cursor-pointer"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: -100 }}
              exit={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={() => {
                setDirection(1);
                setProgress(0);
                setIndex((i) => i + 1);
                setPause(false);
              }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <motion.div
              className="rounded-3xl h-[60vh] max-h-[60vh] max-lg:h-[30vh] max-lg:w-20 blur-md  z-0 cursor-pointer min-lg:pr-50 bg-inactive"
              onClick={() => {
                if (mode === "single")
                  return navigate(`/profile/${feed[0].username}`);
                else if (mode === "feed") return navigate("/");
              }}
            ></motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryContent;
