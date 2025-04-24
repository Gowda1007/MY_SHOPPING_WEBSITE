/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createCookie, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { useUser } from "../context/UserContext";
import API from "../api/API";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const emailRef = useRef(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAuth, setisGoogleAuth] = useState(false);
  const navigate = useNavigate();
  const { userLogin, setUser } = useUser();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const code = authResult["code"];
        const response = await API.post(
          `/auth/google`,
          { code },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.status === 200) {
          const { email, password } = response.data;
          setisGoogleAuth(true);
          setEmail(email);
          setPassword(password);
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
    emailRef.current?.focus();
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
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

    return true;
  };
  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }
      setIsLoading(true);
      const newUser = { email, password };

      try {
        if (!validateForm()) {
          setIsLoading(false);
          return;
        }

        const response = await API.post(
          `/user/login`,
          newUser
        );

        if (response.status === 200) {
          const data = response.data;
          localStorage.setItem("token", data.token);
          toast.success(data.message);
          createCookie("token", data.token);
          setTimeout(() => {
            userLogin(data.user);
            setEmail("");
            setPassword("");
            navigate("/home");
          }, 1000);
          setIsLoading(false);
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
    [email, password, navigate, userLogin]
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
        {isGoogleAuth
          ? "Continue into your account"
          : "Login into your Account"}
      </p>
      <div className="bg-background/70 border relative shadow-lg w-xl flex flex-col items-center p-5 rounded-2xl">
        <h4 className="text-xl text-primary font-semibold">Login</h4>
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3 mt-4"
        >
          <div className="relative w-full">
            <input
              type="email"
              id="email"
              ref={emailRef}
              className="w-full h-11 p-3 pt-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary peer bg-background/70"
              placeholder=" "
              disabled={isGoogleAuth}
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
          {isGoogleAuth ? null : (
            <Link
              to="/forgot-password"
              className="text-blue-600 text-xs place-items-start w-full -mt-1 -mb-3"
            >
              forgot password..?
            </Link>
          )}
          <button
            type="submit"
            className={`w-full h-11 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isGoogleAuth ? "Continue" : "Sign In"}
          </button>
        </form>
        <div className=" place-items-end w-full">
          <p className="mt-4 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600">
              Register
            </Link>
          </p>
        </div>

        {isGoogleAuth ? null : (
          <div className="w-full my-5 flex items-center justify-center">or</div>
        )}
        {isGoogleAuth ? null : (
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

export default SignIn;
