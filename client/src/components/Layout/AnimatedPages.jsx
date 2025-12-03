import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import PageWrapper from "./PageWrapper";

const AnimatedPages = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageWrapper key={location.pathname}>{children}</PageWrapper>
    </AnimatePresence>
  );
};

export default AnimatedPages;
