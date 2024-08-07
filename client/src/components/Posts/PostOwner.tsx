import { Link } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { FaTrash } from "react-icons/fa";

export interface PostOwnerInterface {
  fullName: string;
  username: string;
  isMyPost: boolean;
  isDeletePending: boolean;
  handleDeletePost: (e:unknown) => void;
  formattedDate: string;
}

const PostOwner = ({
  fullName = "fullName",
  username = "username",
  ...props
}: PostOwnerInterface) => {
  return (
    <div className="flex gap-2 items-center">
      <Link to={`/profile/${username}`} className="font-bold">
        {fullName}
      </Link>
      <span className="text-gray-700 flex gap-1 text-sm">
        <Link to={`/profile/${username}`}>@{username}</Link>
        <span>·</span>
        <span>{props.formattedDate}</span>
      </span>

      {/* Check the post is the current user's so they can't delete other's posts */}

      {props.isMyPost && (
        <span className="flex justify-end flex-1">
          {!props.isDeletePending && (
            <FaTrash
              className="cursor-pointer hover:text-red-500"
              onClick={props.handleDeletePost}
            />
          )}
          {/* Show loading spinner in pending state*/}
          {props.isDeletePending && <LoadingSpinner size="sm" />}
        </span>
      )}
    </div>
  );
};

export default PostOwner;
