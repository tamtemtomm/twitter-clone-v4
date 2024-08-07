// Import dependencies
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Import components
import { Avatar, ProfileText } from "../ProfileComponent";
import ExploreSkeleton from "../Skeletons/ExploreSkeleton";
import LoadingSpinner from "../LoadingSpinner";

// Import usFollow costum hooks
import useFollow from "../../hooks/useFollow";

// Import user interface
import { UserInterface } from "../../interface/UserInterface";

const Explore = () => {
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested");
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

  const { followMutation, isPending } = useFollow();

  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

  return (
    <div className=" hidden flex-col align-center justify-center lg:block my-4 mx-2">
      <div className=" p-4 rounded-md sticky top-2">
        <p className="font-bold mb-4 text-2xl">Who to follow</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoading && (
            <>
              <ExploreSkeleton />
              <ExploreSkeleton />
              <ExploreSkeleton />
              <ExploreSkeleton />
            </>
          )}
          {!isLoading &&
            suggestedUsers?.map((user: UserInterface) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <Avatar img={user.profileImg} username={user.username} />
                  <ProfileText
                    fullName={user.fullName}
                    username={user.username}
                  />
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      followMutation(user._id);
                    }}
                  >
                    {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default Explore;
