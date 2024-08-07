// Import Dependencies
import { Link } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Import navbar menu
import NavbarMenu from "./NavbarMenu";
import { getNavbarMenuList } from "./NavbarMenuList";

// Import Icon
import XLogo from "../XLogo";
import { Avatar, ProfileText } from "../ProfileComponent";
import { BiLogOut } from "react-icons/bi";

// Import user interface
import { UserInterface } from "../../interface/UserInterface";
import { PORT } from "../../constant";

const Navbar = () => {
  // Initialize queryClient Hook
  const queryClient = useQueryClient();

  // Fetch data from query key
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const NavbarMenuList = getNavbarMenuList(authUser as UserInterface);

  // Add logout mutation state
  const { mutate: logoutMutate, error } = useMutation({
    mutationFn: async () => {
      try {
        // Send logout post req using tanstack
        const res = await fetch(`${PORT}api/auth/logout`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (err: unknown) {
        console.log(err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Logout successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error(`Error : ${error}`);
    },
  });

  return (
    <nav className="flex flex-col py-3 pl-12 pr-6 w-1/4 min-w-24 h-screen border-r border-gray-700 sticky top-0 left-0 justify-between">
      <div className="flex flex-col gap-y-3 ">
        <Link to="/">
          <XLogo className="px-2 w-10 h-10 rounded-full fill-white hover:bg-stone-900" />
        </Link>

        {NavbarMenuList.map((menu) => (
          <NavbarMenu Icon={menu.Icon} to={menu.to} label={menu.label} />
        ))}
      </div>

      <Link
        to="/"
        className="flex flex-row justify-between gap-x-2 pt-2 py-2 pl-2 pr-3 rounded-full  hover:bg-stone-900 transition-all duration-300 max-w-fit"
      >
        <Avatar
          img={(authUser as UserInterface)?.profileImg}
          style={"hidden md:inline-flex"}
          username={(authUser as UserInterface)?.username}
        />
        <div className="flex justify-start flex-1 gap-x-4">
          <ProfileText
            fullName={(authUser as UserInterface)?.fullName || "fullName"}
            username={(authUser as UserInterface)?.username || "username"}
            style="hidden flex-col lg:flex"
            fullNameStyle="text-white font-bold text-xs w-20 truncate"
          />
          <BiLogOut
            className="w-5 h-5 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              logoutMutate();
            }}
          />
        </div>
      </Link>
    </nav>
  );
};

export default Navbar;
