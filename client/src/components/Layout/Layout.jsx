import Sidebar from "./Sidebar";
import AnimatedPages from "./AnimatedPages";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const hiddenRoutes = ["/login", "/register"];
  return (
    <div className="flex h-screen">
      {!hiddenRoutes.includes(location.pathname) && (
        <div className="mb-10">
          <Sidebar />
        </div>
      )}
      <div className="flex-1 relative h-full w-full">
        <AnimatedPages>
          <Outlet />
        </AnimatedPages>
      </div>
    </div>
  );
};

export default Layout;
