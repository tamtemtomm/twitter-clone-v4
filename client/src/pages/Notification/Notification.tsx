// Import dependencies
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Import loading spinner components
import LoadingSpinner from "../../components/Common/LoadingSpinner";

// Import Icons
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

// Import notification interface
import { NotificationInterface } from "../../interface/NotificationInterface";

const Notification = () => {

  // Initialize query client
  const queryClient = useQueryClient()

  // Get all notifications from current user
  const { data: NOTIFICATIONS, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
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

  // Get mutation function to delete all notifications
  const { mutate: deleteNotificationMutation } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", { method: "DELETE" });
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
    onSuccess: () => {
      toast.success("Notification deleted succesfully");
      
      // Invalidate notifications state to refetch the data from db and refresh the page
      queryClient.invalidateQueries({queryKey: ['notifications']})
    },
    onError: (err: {message: string}) => {
      toast.error(err.message);
    },
  });

  return (
    <>
      <div className="flex flex-col  w-1/2 mr-8 border-r border-gray-700 min-h-screen ">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotificationMutation as any}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {(NOTIFICATIONS as NotificationInterface[])?.length === 0 && (
          <div className="text-center p-4 font-bold">No NOTIFICATIONS 🤔</div>
        )}
        {(NOTIFICATIONS as NotificationInterface[])?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4">
              {notification.type === "follow" && (
                <FaUser className="w-7 h-7 text-primary" />
              )}
              {notification.type === "like" && (
                <FaHeart className="w-7 h-7 text-red-500" />
              )}
              <Link to={`/profile/${notification.from.username}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>{" "}
                  {notification.type === "follow"
                    ? "followed you"
                    : "liked your post"}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default Notification;
