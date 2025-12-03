import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../../assets/icons/search.svg?react";
import { useDebounce } from "use-debounce";
import { searchUser } from "../../utils/userApi";
import { DOMAIN } from "../../utils/config";
const Searchbar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [results, setResults] = useState([]);
  const [debounced] = useDebounce(query.trim(), 300);
  useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      return;
    }
    const run = async () => {
      const r = await searchUser(debounced);
      r;
      setResults(r);
    };

    run();
  }, [debounced]);

  return (
    <div className="relative bg-cards w-full mr-4 rounded-xl text-white font-other z-[999]">
      <input
        type="search"
        className="w-full h-14 p-6 rounded-xl focus:outline-1 focus:outline-active placeholder-gray-400 focus:placeholder-gray-300"
        placeholder="Search someone or something.."
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onFocus={() => setOpen(true)}
      />

      <SearchIcon className="absolute right-5 top-1/2 transform -translate-y-1/2 h-4 w-5" />

      <AnimatePresence>
        {open && query && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full mt-3 bg-cards rounded-xl shadow-lg z-[999] max-h-60 overflow-auto scrollbar-hide"
          >
            {results.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 px-4 py-3 text-white font-other font-light cursor-pointer hover:bg-[#9746b9] transition duration-300 z-[999]"
                onMouseDown={() => {
                  setOpen(false);
                  navigate(`/profile/${item.username}`);
                }}
              >
                <img
                  src={`${item.avatar}`}
                  alt="profile_img"
                  className="h-9 w-9 rounded-full object-cover max-lg:h-8 max-lg:w-8"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <h6>{item.username}</h6>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Searchbar;
