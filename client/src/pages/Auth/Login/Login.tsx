// Import dependecies
import { useState } from "react";
import { Link} from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Import Icons
import XLogo from "../../../components/XLogo";
import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { PORT } from "../../../constant";

// Setup Login Form Types
interface LoginFormInterface {
  username: string;
  password: string;
}

const LoginPage = () => {
  // Initialize navigate hook
  const queryClient = useQueryClient()

  // Make Login Form Data State
  const [formData, setFormData] = useState<LoginFormInterface>({
    username: "",
    password: "",
  });

  // Initialize tanstasck mutation
  const {
    mutate: loginMutation,
    isError,
    isPending,
    error,
  } = useMutation({
    // Make post request using Tanstack
    mutationFn: async ({ username, password }: LoginFormInterface) => {
      try {
        const res = await fetch(
          `${PORT}/api/auth/login`, // {Proxy/api/auth/login}
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username, password: password }),
          }
        );

        // Get the respons back
        const data = await res.json();

        // If the request failed, make a toast alert
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (err: unknown) {
        console.log(err);
        throw err;
      }
    },
    // Make a succes alert
    onSuccess: () => {
      toast.success("Login succesfully")
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  // Handle form submit to trigger mutationFn
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    loginMutation(formData);
  };

  // Handle form state onchange
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XLogo className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <XLogo className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading ..." : "Login"}
          </button>
          {isError && (
            <p className="text-red-500">
              {error.message || "Something went wrong"}
            </p>
          )}
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
