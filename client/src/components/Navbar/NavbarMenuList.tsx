// Import Icons
import { FaHome, FaUser, FaBell, FaSearch } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoPeopleSharp } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { NavbarMenuInterface } from "./NavbarMenu";
import { UserInterface } from "../../interface/UserInterface";


export const getNavbarMenuList = (authUser: UserInterface) => {
  const NavbarMenuList: NavbarMenuInterface[] = [
    { Icon: FaHome, to: "/", label: "Home" },
    { Icon: FaSearch, to: "/", label: "Explore", },
    { Icon: FaBell, to: "/notifications", label: "Notifications" },
    { Icon: FaMessage, to: "/", label: "Message" },
    { Icon: IoPeopleSharp, to: "/", label: "Community" },
    {
      Icon: FaUser,
      to: `/profile/${(authUser as UserInterface)?.username || "username"}`,
      label: "Profile",
    },
    { Icon: BsThreeDots, to: "/", label: "Others" },
  ];

  return NavbarMenuList;
};
