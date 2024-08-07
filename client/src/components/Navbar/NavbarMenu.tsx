import { Link } from "react-router-dom";
import { IconType } from "react-icons";

export interface NavbarMenuInterface {
  Icon: IconType;
  to: string;
  label: string;
}

const NavbarMenu = ({ Icon, ...props }: NavbarMenuInterface) => {
  // Intialize icon size
  const iconSize: number = 6;

  // Initial tailwind for NavbarMenuList
  const className: string =
    "flex hover:bg-stone-900 transition-all duration-300 gap-x-3 text-lg font-normal items-center py-2 pl-2 pr-3 rounded-full max-w-fit cursor-pointer hover:font-bold";

  return (
    <Link to={props.to} className={className}>
      <Icon className={`w-${iconSize} h-${iconSize}`} />
      <span className="hidden lg:block">{props.label}</span>
    </Link>
  );
};

export default NavbarMenu;