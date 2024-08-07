import { IconType } from "react-icons";
import LoadingSpinner from "../LoadingSpinner";
import { PostInterface } from "../../interface/PostInterface";

export interface PostMenu {
  Icon: IconType;
  onClick?: () => void;
  label: number;
  iconSize?:number;
}

export interface PostCommentModalInterface {
  post: PostInterface;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  isCommentPending: boolean;
  handlePostComment: (e: React.FormEvent) => void;
}


export const PostMenu = ({ Icon, iconSize=4, ...props }: PostMenu) => {
  return (
    <div
      className="flex gap-1 items-center cursor-pointer group"
      onClick={props.onClick}
    >
      <Icon className={`w-${iconSize} h-${iconSize}  text-slate-500 group-hover:text-sky-400`} />
      <span className="text-sm text-slate-500 group-hover:text-sky-400">
        {props.label}
      </span>
    </div>
  );
};

export const PostCommentModal = ({
  post,
  comment,
  setComment,
  isCommentPending,
  handlePostComment,
}: PostCommentModalInterface) => {
  return (
    <dialog
      id={`comments_modal${post._id}`}
      className="modal border-none outline-none"
    >
      <div className="modal-box rounded border border-gray-600">
        <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
        <div className="flex flex-col gap-3 max-h-60 overflow-auto">
          {post.comments?.length === 0 && (
            <p className="text-sm text-slate-500">
              No comments yet 🤔 Be the first one 😉
            </p>
          )}
          {post.comments?.map((comment: PostInterface) => (
            <div key={comment._id} className="flex gap-2 items-start">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={comment.user.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{comment.user.fullName}</span>
                  <span className="text-gray-700 text-sm">
                    @{comment.user.username}
                  </span>
                </div>
                <div className="text-sm">{comment.text}</div>
              </div>
            </div>
          ))}
        </div>
        <form
          className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
          onSubmit={handlePostComment}
        >
          <textarea
            className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isCommentPending ? <LoadingSpinner size="md" /> : "Post"}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="outline-none">close</button>
      </form>
    </dialog>
  );
};

export default PostMenu;
