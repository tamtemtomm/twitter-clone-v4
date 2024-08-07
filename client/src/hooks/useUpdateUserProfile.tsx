import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PORT } from "../constant";

// Set this ANNOYING interface
interface UpdateProfileFormDataInterFace {
  fullName?: string;
  username?: string;
  email?: string;
  bio?: string;
  link?: string;
  newPassword?: string;
  currentPassword?: string;
  coverImg?: string | ArrayBuffer | null;
  profileImg?: string | ArrayBuffer | null;
}

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfileMutation, isPending: isUpdatePending } =
    useMutation({
      // Send the body trough mutation function
      mutationFn: async (formData: UpdateProfileFormDataInterFace) => {
        try {
          const res = await fetch(`${PORT}/api/users/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
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
        toast.success("Profile updated successfully");
        // Invaidate the query state sequencially
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        ]);
      },
      onError: (err: { message: string }) => {
        toast.error(err.message);
      },
    });
  // return the funtion and pending state
  return { updateProfileMutation, isUpdatePending };
};

export default useUpdateUserProfile;
