import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { useUser } from "../context/UserContext";
import API from "../api/API";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const usernameRef = useRef(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAuth, setisGoogleAuth] = useState(false);
  const navigate = useNavigate();
  const { userLogin } = useUser();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const code = authResult["code"];
        const response = await API.post(
          "/auth/google",
          { code },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.status === 200) {
          const { email, name, password, picture } = response.data;
          setisGoogleAuth(true);
          setEmail(email);
          setUsername(name);
          setPassword(password);
          setConfirmPassword(password);
          setProfilePic(picture);
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setisGoogleAuth(false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword || !phone) {
      toast.error("Please fill in all fields.");
      return false;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (!validateForm()) {
          setIsLoading(false);
          return;
        }

        const newUser = {
          username,
          email,
          password,
          phone,
          picture: profilePic,
        };

        const response = await API.post("/user/register", newUser);

        if (response.status === 200) {
          const data = response.data;
          localStorage.setItem("token", data.token);
          toast.success(data.message);
          setTimeout(() => {
            userLogin(data.user);
            setUsername("");
            setEmail("");
            setPhone("");
            setPassword("");
            setConfirmPassword("");
            navigate("/home");
          }, 1000);
        }
        if (response.status === 500 || response.status === 404) {
          toast.error(response?.data?.message);
        }
        if (response.status === 400) {
          response?.data?.errors.map((error) => toast.error(error));
        }
      } catch (error) {
        console.error("Error during login:", error);
        if (error.response) {
          const { status, data } = error.response;
          if (status === 500 || status === 404) {
            toast.error(data.message || "Login failed.");
          }
          if (status === 400) {
            data?.errors.forEach((error) => {
              toast.error(error);
            });
          } else {
            toast.error("Login failed. Please try later");
          }
        } else if (error.request) {
          toast.error("No response from server. Please check your connection.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [email, phone, username, confirmPassword, password, navigate, userLogin]
  );
  useEffect(() => {
    if (isGoogleAuth) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isGoogleAuth, handleSubmit]);

  return (
    <div className="w-screen transition-all ease-in-out h-screen flex-col flex items-center bg-primary-foreground justify-center">
      <Link to="/"><img className="w-10" src="/logo.png" alt="" /></Link>
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="mb-2 text-blue-800 font-semibold">
        {isGoogleAuth ? "Continue into your account" : "Create your Account "}
      </p>
      <div className="bg-background/70 border relative shadow-lg w-xl flex flex-col items-center p-5 rounded-2xl">
        <h4 className="text-xl text-primary font-semibold">Register</h4>
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3 mt-4"
        >
          <div className="relative w-full">
            <input
              type="text"
              id="username"
              disabled={isGoogleAuth ? true : false}
              className="w-full h-11 p-3 pt-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary peer bg-background/70"
              placeholder=" "
              ref={usernameRef}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label
              htmlFor="username"
              className={`absolute left-3 text-blue-500 text-base transition-all transform z-40 bg-background px-0.5 ${
                username
                  ? "top-[-10px] text-sm text-blue-500"
                  : "top-3 text-base text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-blue-500"
              }`}
            >
              Fullname
            </label>
          </div>
          <div className="relative w-full">
            <input
              type="email"
              id="email"
              className="w-full h-11 p-3 pt-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary peer bg-background/70"
              placeholder=" "
              disabled={isGoogleAuth ? true : false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label
              htmlFor="email"
              className={`absolute left-3 text-blue-500 text-base transition-all transform z-40 bg-background px-0.5 ${
                email
                  ? "top-[-10px] text-sm text-blue-500"
                  : "top-3 text-base text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-blue-500"
              }`}
            >
              Email
            </label>
          </div>
          <div className="relative w-full">
            <input
              type="text"
              id="phone"
              className="w-full h-11 p-3 pt-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary peer bg-background/70"
              placeholder=" "
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <label
              htmlFor="phone"
              className={`absolute left-3 text-blue-500 text-base transition-all transform z-40 bg-background px-0.5 ${
                phone
                  ? "top-[-10px] text-sm text-blue-500"
                  : "top-3 text-base text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-blue-500"
              }`}
            >
              Phone
            </label>
          </div>
          {isGoogleAuth ? (
            ""
          ) : (
            <div className="relative w-full">
              <input
                type="password"
                id="password"
                className="w-full h-11 p-3 pt-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary peer bg-background/70"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label
                htmlFor="password"
                className={`absolute left-3 text-blue-500 text-base transition-all transform z-40 bg-background px-0.5 ${
                  password
                    ? "top-[-10px] text-sm text-blue-500"
                    : "top-3 text-base text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-blue-500"
                }`}
              >
                Password
              </label>
            </div>
          )}
          {isGoogleAuth ? (
            ""
          ) : (
            <div className="relative w-full">
              <input
                type="password"
                id="confirmPassword"
                className="w-full h-11 p-3 pt-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary peer bg-background/70"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-3 text-blue-500 text-base transition-all transform z-40 bg-background px-0.5 ${
                  confirmPassword
                    ? "top-[-10px] text-sm text-blue-500"
                    : "top-3 text-base text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-blue-500"
                }`}
              >
                Confirm Password
              </label>
            </div>
          )}
          <button
            type="submit"
            className={`w-full h-11 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isGoogleAuth ? "Continue " : "Signup"}
          </button>
        </form>
        <div className=" place-items-end w-full">
        <p className="mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600">
              Log in
            </Link>
          </p>
        </div>
          
        

        {isGoogleAuth ? (
          ""
        ) : (
          <div className="w-full my-5 flex items-center justify-center">or</div>
        )}
        {isGoogleAuth ? (
          ""
        ) : (
          <button
            onClick={() => login()}
            className="w-full border-2 py-2 active:border-black active:bg-gray-100 cursor-pointer flex items-center justify-center gap-3 text-base rounded"
          >
            <FcGoogle className="text-xl" /> <p>Continue with Google</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUp;
