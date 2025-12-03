import { motion } from "framer-motion";

const PageWrapper = ({ children }) => {
  return <motion.div className="h-full w-full">{children}</motion.div>;
};

export default PageWrapper;
