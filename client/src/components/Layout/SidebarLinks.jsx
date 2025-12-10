import { NavLink } from "react-router-dom";

export const SidebarLinks = ({ to, label, icon: Icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "sidebar block max-w-full bg-highlight rounded-2xl h-14 font-bold text-black hover:cursor-pointer transition-all duration-300 "
          : "sidebar block w-full h-14 text-secondary bg-transparent hover:bg-profile hover:text-secondary hover:cursor-pointer hover:shadow-md hover:rounded-xl border-b-[0.01px] border-profile hover:border-0 transition-all duration-300"
      }
    >
      <div className="flex items-center justify-between ml-3 mr-6 pt-3">
        <div className="flex items-center space-x-5">
          <Icon className=" text-secondary h-5 w-5 " />
          <span className="text-secondary text-[0.7rem] font-other py-1.5">
            {label}
          </span>
        </div>
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
          ? "flex flex-col items-center justify-center font-bold  space-y-2 transition duration-300 shadow-2xs shadow-active text-secondary"
          : "flex flex-col items-center justify-center font-normal text-secondary space-y-2 contrast-50 hover:text-secondary/50 hover:contrast-200 transition duration-300"
      }
    >
      <Icon className="h-6 w-6" />
      <span className="text-[0.70rem]">{label}</span>
    </NavLink>
  );
};
