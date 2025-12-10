import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LikeIcon from "../assets/icons/like.svg?react";
import UploadIcon from "../assets/icons/follow.svg?react";
import PreviewIcon from "../assets/icons/view.svg?react";
import DescriptionIcon from "../assets/icons/description.svg?react";
import SubmitIcon from "../assets/icons/checked.svg?react";
import CommentIcon from "../assets/icons/comment.svg?react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

const AddPost = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [description, setDescription] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const steps = [
    "Upload or take a photo.",
    "Your photo preview.",
    "Add a description!",
    "Submit post.",
  ];

  const handlePublish = async (photo, description, user, navigate) => {
    try {
      if (!photo) return alert("Please upload a photo.");
      setLoading(true);
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("description", description);
      formData.append("is_public", true);

      await api.post("/posts/add", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      navigate(`/profile/${user.username}`);
    } catch (err) {
      Swal.fire({
        theme: "dark",
        title: "Whoops!",
        text: "We couldn't process your request.",
        icon: "error",
        confirmButtonColor: "#d155e6",
      });
    } finally {
      setLoading(true);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          theme: "dark",
          title: "Whoops!",
          text: "Please select an image.",
          icon: "error",
          confirmButtonColor: "#d155e6",
        });
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          theme: "dark",
          title: "Whoops!",
          text: "Max 5MB",
          icon: "error",
          confirmButtonColor: "#d155e6",
        });
        e.target.value = "";
        return;
      }
      setPhotoURL(URL.createObjectURL(file));
      setPhotoFile(file);
      setCurrentStep(2);
    }
  };

  const handleClick = () => inputRef.current.click();

  return (
    <>
      <h1 className="font-title mt-30 ml-7 min-lg:ml-90 text-2xl text-secondary">
        <span className="text-secondary">Connections / </span>New post
      </h1>

      <div className="font-other mt-10 min-lg:ml-90 text-secondary">
        <div className="flex justify-center items-center w-full">
          <div className="flex items-center gap-20 max-lg:gap-10 transition-all duration-300">
            {[UploadIcon, PreviewIcon, DescriptionIcon, SubmitIcon].map(
              (Icon, idx) => (
                <div
                  key={idx}
                  className={`relative flex items-center h-20 w-20 max-lg:h-16 max-lg:w-16 ${
                    currentStep >= idx + 1
                      ? "bg-active text-text-highlight"
                      : "bg-cards text-secondary"
                  } rounded-full p-5`}
                >
                  <Icon className="h-10" />
                  {idx < 3 && (
                    <div
                      className={`transition-all duration-300 absolute top-1/2 left-full max-lg:w-10 w-20 h-1 ${
                        currentStep >= idx + 2 ? "bg-active" : "bg-cards"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <div className="flex flex-col items-center text-lg max-lg:text-sm">
            <h1 className="text-3xl max-lg:text-xl font-title tracking-widest font-bold">
              Step {currentStep}
            </h1>
            <h1>{steps[currentStep - 1]}</h1>
          </div>
        </div>

        <div className="flex justify-center items-center w-full mt-10">
          <div className="flex flex-col items-center space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />

            {currentStep === 1 && (
              <div
                onClick={handleClick}
                className="mt-5 px-6 py-3 bg-cards text-secondary rounded-4xl shadow hover:scale-102 transition cursor-pointer w-72 h-96 flex items-center justify-center aspect-1/2"
              >
                <div className="flex flex-col justify-center items-center gap-5">
                  <h5>Tap to proceed</h5>
                  <UploadIcon className="h-15 " />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <>
                <img
                  src={photoURL}
                  alt="posted_photo"
                  className="rounded-3xl w-60 min-lg:w-100 object-cover aspect-[2/3]"
                />
                <div className="flex space-x-3 mb-10">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="mt-5 px-6 py-3 bg-active text-text-highlight rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    Next step
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-5 px-6 py-3 bg-red-500 text-text-highlight rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="bg-cards p-3 w-100 rounded-lg font-other relative border-[#630ec4] border-1 hover:border-active">
                  <input
                    type="input"
                    className="w-full focus:outline-0 p-1 placeholder-secondary focus:placeholder-secondary/55"
                    placeholder="Ex: A sunny day at the beach 🌊"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3 mb-10">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="mt-5 px-6 py-3 bg-active text-text-highlight rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    Save & next step
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="mt-5 px-6 py-3 bg-red-500 text-text-highlight rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className="flex flex-col pr-4 items-center w-auto rounded-2xl shrink-0 ml-4">
                  <div className="flex flex-col space-y-0 shrink-0 mb-10 w-full max-w-[520px]">
                    <img
                      src={photoURL}
                      alt="post_image"
                      className="rounded-t-3xl w-full object-cover aspect-[2/3]"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <div className="bg-cards w-full rounded-b-2xl p-6 flex flex-col lg:flex-row lg:space-x-6 space-y-4 lg:space-y-0">
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col justify-center truncate">
                            <div>
                              <img
                                src={`${user.avatar}`}
                                alt="profile image"
                                className="h-25 w-25 rounded-full object-cover max-lg:h-15 max-lg:w-15 mb-3"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                              />
                            </div>
                            <div className="space-x-3">
                              <span className="font-other font-bold text-secondary text-lg truncate">
                                {user.username}
                              </span>
                              <span className="font-other text-secondary text-sm truncate">
                                just now
                              </span>
                            </div>
                            <span className="font-other text-secondary text-md mt-2 truncate">
                              {description}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 justify-start">
                        <div className="flex flex-col items-center justify-center cursor-pointer">
                          <LikeIcon className="h-10 w-10 text-secondary" />
                          <h1 className="font-other text-secondary text-md mt-1">
                            0
                          </h1>
                        </div>
                        <div className="flex flex-col items-center justify-center cursor-pointer">
                          <CommentIcon className="h-10 w-10" />
                          <h1 className="font-other text-secondary text-md mt-1">
                            0
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mb-5">
                  <button
                    onClick={() =>
                      handlePublish(photoFile, description, user, navigate)
                    }
                    className="mt-5 px-6 py-3 bg-active text-text-highlight rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    {!loading ? (
                      "Publish"
                    ) : (
                      <div className="inline-flex gap-2">
                        <ClipLoader color="text-text-highlight" size="20px" />
                        Uploading post..
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="mt-5 px-6 py-3 bg-red-500 text-text-highlight rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPost;
