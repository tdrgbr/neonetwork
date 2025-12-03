import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { ClipLoader } from "react-spinners";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../utils/socket";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        setLoading(false);
        if (!["/login", "/register"].includes(location.pathname))
          navigate("/login");
        return;
      }

      try {
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
        socket.emit("joinUserRoom", data.user.id);

        if (["/login", "/register"].includes(location.pathname)) navigate("/");
      } catch (err) {
        localStorage.removeItem("accessToken");
        setUser(null);
        if (!["/login", "/register"].includes(location.pathname))
          navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  const login = async ({ email, password }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: "Login failed. Check your credentials!",
      };
    }
  };

  const register = async ({ username, email, password }) => {
    try {
      const { data } = await api.post("/auth/create", {
        username,
        email,
        password,
      });
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Register failed! Try again later" };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#b15af5" size={60} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
