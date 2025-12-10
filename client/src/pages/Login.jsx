import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, throwError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [button, setButton] = useState("Login");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    throwError(null);
    if (!email || !password) return throwError("You must fill out everything");

    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);

    if (!res.success) return throwError(res.message);

    setButton("Success! Redirecting...");
    setTimeout(() => navigate("/"), 300);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-other">
      <div className="p-8 rounded-2xl shadow-lg w-full max-md:max-w-sm max-w-xl bg-cards text-secondary border-1">
        <h1 className="font-title text-secondary text-5xl text-left mb-10">
          Neonetwork <span className="text-3xl">/ Login</span>
        </h1>

        <div className="space-y-4">
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
            className="w-full bg-active text-secondary py-2.5 rounded-lg hover:scale-102 transition cursor-pointer duration-300"
            onClick={handleLogin}
          >
            {!loading ? button : <ClipLoader color="#fff" size="20px" />}
          </button>

          <p className="text-sm text-center text-red-500 mb-10">{error}</p>
          <p className="text-sm text-center mt-4 text-secondary">
            New here?{" "}
            <a href="/register" className="text-active hover:opacity-90">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
