import { NavLink } from "react-router-dom";

export const SidebarLinks = ({ to, label, icon: Icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "sidebar block max-w-full bg-active rounded-2xl h-14 font-bold text-white hover:cursor-pointer transition-all duration-300"
          : "sidebar block w-full h-14 text-secondary bg-transparent hover:bg-[rgba(0,0,0,0.4)] hover:text-white hover:cursor-pointer hover:shadow-2xl hover:rounded-xl hover:border-0 transition-all duration-300"
      }
    >
      <div className="flex items-center justify-between ml-3 mr-6 pt-3">
        <div className="flex items-center space-x-5">
          <Icon className="h-6 rounded-full" />
          <span className="text-white text-[0.8rem] font-other py-1.5">
            {label}
          </span>
        </div>
        <span className="text-white text-xl font-other">➤</span>
      </div>
    </NavLink>
  );
};

export const MobileLinks = ({ to, label, icon: Icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "flex flex-col items-center justify-center font-bold text-white space-y-2 transition duration-300 shadow-2xs shadow-active"
          : "flex flex-col items-center justify-center font-normal text-secondary space-y-2 contrast-50 hover:text-white hover:contrast-200 transition duration-300"
      }
    >
      <Icon className="h-8 rounded-full text-white" />
      <span className="text-[0.8rem]">{label}</span>
    </NavLink>
  );
};
