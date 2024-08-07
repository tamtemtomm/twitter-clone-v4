import { Link } from "react-router-dom";

export interface AvatarInterface {
  img: string;
  username: string;
  imgSize?: number;
  style?: string;
}

export interface ProfileTextInterface {
  fullName: string;
  username: string;
  style?: string;
  fullNameStyle?: string;
  usernameStyle?: string;
}

export const Avatar = ({
  imgSize = 8,
  username = "tamtemtommm",
  img = "/avatar-placeholder.png",
  ...props
}) => {
  return (
    // Add aditional style if needed
    <div className={`avatar ${props.style}`}>
      {/* Go into user profile when clicked */}
      {/* Customizable size */}
      <Link
        to={`/profile/${username}`}
        className={`w-${imgSize} h-${imgSize} rounded-full overflow-hidden`}
      >
        {/*Show the default img if the user don't have the profileImg */}
        <img src={img || "/avatar-placeholder.png"} />
      </Link>
    </div>
  );
};

export const ProfileText = ({
  fullName = "fullName",
  username = "username",
  fullNameStyle = "font-semibold tracking-tight truncate w-28",
  usernameStyle = "text-sm text-slate-500",
  style = "flex flex-col",
}: ProfileTextInterface) => {
  return (
    <Link className={`${style}`} to={`/profile/${username}`}>
      <span className={fullNameStyle}>{fullName}</span>
      <span className={usernameStyle}>@{username}</span>
    </Link>
  );
};
