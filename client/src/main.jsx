import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Feed from "./pages/Feed";
import Discover from "./pages/Discover";
import AddPost from "./pages/AddPost";
import AddStory from "./pages/AddStory";
import Profile from "./pages/Profile";
import Story from "./pages/Story";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Layout from "./components/Layout/Layout";
import Post from "./pages/Post";
import Messages from "./pages/Messages";
import MessageContent from "./pages/MessageContent";
import Register from "./pages/Register";
import Login from "./pages/Login";
import "./index.css";
import { addStory } from "./utils/storyApi";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Feed />} />
        <Route path="discover" element={<Discover />} />
        <Route path="create" element={<AddPost />} />
        <Route path="user" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:id" element={<MessageContent />} />
        <Route path="story/:storyUserId" element={<Story />} />
        <Route path="story" element={<Story />} />
        <Route path="addstory" element={<AddStory />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="profile/:name" element={<Profile />} />
        <Route path="post/:id" element={<Post />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

const root = document.getElementById("root");
createRoot(root).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);
