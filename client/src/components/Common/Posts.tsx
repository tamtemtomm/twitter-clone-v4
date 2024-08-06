// Import dependencies
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Import components
import Post from "./Post";
import PostSkeleton from "../Skeletons/PostSkeletons";

// Import pot interface
import { PostInterface } from "../../interface/PostInterface";

const Posts = ({
  feedType,
  username,
  userId,
}: {
  feedType: string;
  username?: string | undefined;
  userId?: string | undefined;
}) => {
  // Initialize feetype string case and its routes according to backend
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };
  const POST_ENDPOINT = getPostEndpoint();

  // Initialize POSTS query variable, this variable can be used accross projects
  const {
    data: POSTS,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
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
  });

  // Refetch the posts when feedtype change
  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  return (
    <>
      {/*Get the skeletons components when in pending state*/}
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && POSTS?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && POSTS && (
        <div>
          {POSTS.map((post: PostInterface) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
