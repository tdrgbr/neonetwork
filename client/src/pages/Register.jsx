import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ClipLoader } from "react-spinners";
import api from "../utils/api";

const submitRegister = async ({
  username,
  email,
  password,
  throwError,
  setLoading,
  setButton,
  navigate,
}) => {
  throwError(null);
  setLoading(false);
  if (!username || !email || !password)
    return throwError("You must fill out everything");
  if (username.length < 4 || username.length > 15)
    return throwError("Your username must be between 4 and 15 characters.");
  if (password.length < 8)
    return throwError("Your password must have minimum 8 characters.");
  if (!email.includes("@")) return throwError("Invalid e-mail format.");

  setLoading(true);
  try {
    await api.post("/auth/create", { username, email, password });
    setButton("Success! Redirecting...");
    setTimeout(() => navigate("/login"), 300);
  } catch (err) {
    if (err.response && err.response.data?.message) {
      return throwError(err.response.data.message);
    } else {
      return throwError("Server error. Try again later.");
    }
  } finally {
    setLoading(false);
  }
};
const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, throwError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [button, setButton] = useState("Register");

  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen font-other">
      <div className="p-8 rounded-2xl shadow-lg w-full max-md:max-w-sm max-w-xl bg-highlight text-secondary">
        <h1 className="font-title text-secondary text-4xl text-left mb-1">
          Neonetwork
        </h1>
        <h1 className="font-other text-secondary mb-10">Sign Up</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Username</label>
            <input
              type="text"
              className="w-full border-1 focus:border-none rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-active"
              placeholder="ex: john_1234"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">E-mail</label>
            <input
              type="email"
              className="w-full border-1 focus:border-none rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-active"
              placeholder="ex: user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-12">
            <label className="block text-sm font-medium mb-3">Password</label>
            <input
              type="password"
              className="w-full border-1 focus:border-none rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-active"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-active text-text-highlight py-2.5 rounded-lg hover:scale-102 transition cursor-pointer duration-300"
            onClick={() =>
              submitRegister({
                username,
                email,
                password,
                throwError,
                setLoading,
                setButton,
                navigate,
              })
            }
          >
            {!loading ? button : <ClipLoader color="#fff" size="20px" />}
          </button>
          <p className="text-sm text-center text-red-500 mb-10">{error}</p>
          <p className="text-sm text-center mt-4 text-secondary">
            Already have an account?{" "}
            <a href="/login" className="text-active hover:opacity-90">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
