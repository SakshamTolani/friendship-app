// SignIn.js
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../App";
import showToast from "../../Toast";

const SignIn = () => {
  const { dispatch } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const PostData = () => {
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      showToast("Invalid Email", "error");
      return;
    }
    fetch("/signin", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showToast(data.error, "error");
        } else {
          localStorage.setItem("jwt", data.token)
          localStorage.setItem("user", JSON.stringify(data.user))
          dispatch({ type: "USER", payload: data.user })
          showToast("Signed In Successfully", "success");
          navigate("/");
        }
      });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Decorative/Brand section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
        <div className="flex flex-col justify-center items-center w-full text-white p-12">
          <h1 className="font-poppins text-5xl font-bold mb-8">Instabyte</h1>
          <p className="text-xl text-center mb-6">Share your moments with the world.</p>
          <div className="space-y-4 text-center">
            <p className="text-lg">📸 Share photos with friends</p>
            <p className="text-lg">❤️ Connect with like-minded people</p>
            <p className="text-lg">🌟 Discover amazing content</p>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          {/* Logo for mobile view */}
          <div className="md:hidden text-center mb-8">
            <h1 className="font-poppins text-4xl font-bold text-blue-600">Instabyte</h1>
            <p className="mt-2 text-gray-600">Welcome back!</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <div>
              <h2 className="font-poppins text-3xl font-bold text-gray-900 text-center">
                Sign in
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                onClick={PostData}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
              >
                Sign in
              </button>
            </form>

            <div className="text-center">
              <Link
                to="/signup"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-150"
              >
                Don't have an account? <span className="underline">Sign up for free</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;