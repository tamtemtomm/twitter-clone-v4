import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();
  const { mutate: followMutation, isPending } = useMutation({
    mutationFn: async (userId: string | undefined) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
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
    onSuccess: () => {
      toast.success("User followed successfully");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
    onError: (err: {message: string}) => {
      toast.error(err.message);
    },
  });

  return { followMutation, isPending };
};

export default useFollow;
