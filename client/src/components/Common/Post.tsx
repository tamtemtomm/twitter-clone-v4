// Import Dependencies
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Import Loading spinner components
import LoadingSpinner from "./LoadingSpinner";

// Import Icons from react-icons
import { FaRegComment } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";

// Import all interfaces
import { PostsInterface, PostInterface } from "../../interface/PostInterface";
import { UserInterface } from "../../interface/UserInterface";

// Import format date function
import { formatPostDate } from "../../utils/date";

const Post = ({ post }: PostsInterface) => {
  // Initial query clients state
  const queryClient = useQueryClient();

  // Get the current authenticated user
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Get the post owners
  const postOwner = post.user;

  // Check if it is the current user's posts
  const isMyPost = (authUser as UserInterface)._id === post.user._id;

  // Set the state for input comment
  const [comment, setComment] = useState("");

  // Set the initial state of liked
  const isLiked = post.likes?.includes((authUser as UserInterface)._id);

  // Get the post formatted date
  const formattedDate = formatPostDate(post.createdAt);

  // Initialize state mutation function for like the post
  const { mutate: likePostMutation, isPending: isLikePending } = useMutation({
    mutationFn: async () => {
      try {
        // Make a post req using tanstack to like the post
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (err: unknown) {
        console.log(err);
        throw err;
      }
    },
    onSuccess: (updatedLikes) => {
      toast.success(`Post ${isLiked ? "unliked" : "liked"} succesfully`);

      // This is not the optimal UX, because the page will be reloaded
      // queryClient.invalidateQueries({ queryKey: ["posts"] });

      // So we update the cache instead
      queryClient.setQueryData(["posts"], (oldData: PostInterface[]) => {
        return oldData.map((p: PostInterface) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error: {message:string}) => {
      toast.error(error.message);
    },
  });

  // Initialize state mutation function for delete post
  const { mutate: commentPostMutation, isPending: isCommentPending } =
    useMutation({
      mutationFn: async () => {
        try {
          const res = await fetch(`/api/posts/comment/${post._id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: comment }),
          });
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
        toast.success("Comment posted successfully");

        // invalidate the queries so it can fetch the posts again and refresh the page
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
      onError: (err: {message:string}) => {
        toast.error(err.message);
      },
    });

  // Initialize state mutation function for delete post
  const { mutate: deletePostMutation, isPending: isDeletePending } =
    useMutation({
      mutationFn: async () => {
        try {
          const res = await fetch(`/api/posts/${post._id}`, {
            method: "DELETE",
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Something went wrong");

          return data;
        } catch (err: unknown) {
          console.log(err);
          throw err;
        }
      },

      onSuccess: () => {
        toast.success("Post deleted successfully");

        /// invalidate the queries so it can fetch the posts again and refresh the page
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    });

  // Function if to handle delete trash icon,
  const handleDeletePost = (
    e: any
  ) => {
    e.preventDefault();
    deletePostMutation();
  };

  // Function if to handle post comment icon
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommentPending) return;
    commentPostMutation();
  };

  // Function if to handle like icon
  const handleLikePost = () => {
    if (isLikePending) return;
    likePostMutation();
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            {/*Show the default img if the user don't have the profileImg */}
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {/* Check the post is the current user's so they can't delete
              other's posts */}
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeletePending && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}
                {/* Show loading spinner in pending state*/}
                {isDeletePending && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  (
                    document.getElementById("comments_modal" + post._id) as HTMLDialogElement
                  ).showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments?.length || 0}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
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
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>
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
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {/*Check is it pending */}
                {!isLiked && !isLikePending && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLikePending && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}
                {isLikePending && <LoadingSpinner size="sm" />}
                <span
                  className={`text-sm  group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes?.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
