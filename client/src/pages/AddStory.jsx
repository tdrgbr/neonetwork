import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadIcon from "../assets/icons/follow.svg?react";
import FinishIcon from "../assets/icons/finish.svg?react";
import api from "../utils/api";
import { storyStats } from "../utils/storyApi";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

const AddStory = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoURL, setPhotoURL] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handlePublish = async (photo) => {
    try {
      if (!photo) return alert("Please upload a photo.");
      setLoading(true);
      const formData = new FormData();
      formData.append("image", photo);
      formData.append("is_public", true);

      await api.post("/story/add", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      navigate("/");
    } catch (err) {
      Swal.fire({
        theme: "dark",
        title: "Whoops!",
        text: "We couldn't process your request",
        icon: "error",
        confirmButtonColor: "#d155e6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkStory = async () => {
      try {
        const data = await storyStats();
        if (data) navigate("/story");
      } catch {}
    };
    checkStory();
  }, []);
  const steps = [
    "Upload or take a photo.",
    "Confirm and publish your story which will be available for 24 hours.",
  ];

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
      <h1 className="font-title mt-30 ml-7 min-lg:ml-90 text-2xl text-white">
        <span className="text-secondary">Connections / </span>Add Story
      </h1>

      <div className="font-other mt-10 min-lg:ml-90 text-white">
        {/* Steps indicator */}
        <div className="flex justify-center items-center w-full">
          <div className="flex items-center gap-10 max-lg:gap-10 transition-all duration-300">
            {[UploadIcon, FinishIcon].map((Icon, idx) => (
              <div
                key={idx}
                className={`relative flex items-center h-20 max-lg:h-16 max-lg:w-16 w-20 ${
                  currentStep >= idx + 1 ? "bg-active" : "bg-cards"
                } rounded-full p-5`}
              >
                <Icon className="h-10" />
                {idx < 1 && (
                  <div
                    className={`transition-all duration-300 absolute top-1/2 left-full max-lg:w-10 w-10 h-1 ${
                      currentStep >= idx + 2 ? "bg-active" : "bg-cards"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step title */}
        <div className="flex justify-center mt-10">
          <div className="flex flex-col items-center text-lg max-lg:text-sm">
            <h1 className="text-3xl max-lg:text-xl font-title tracking-widest font-bold">
              Step {currentStep}
            </h1>
            <h1>{steps[currentStep - 1]}</h1>
          </div>
        </div>

        {/* Step content */}
        <div className="flex justify-center items-center w-full mt-10">
          <div className="flex flex-col items-center space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />

            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <div
                onClick={handleClick}
                className="mt-5 px-6 py-3 bg-cards text-white rounded-4xl shadow hover:scale-102 transition cursor-pointer w-72 h-96 flex items-center justify-center aspect-1/2"
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
                    onClick={() => {
                      handlePublish(photoFile);
                    }}
                    className="mt-5 px-6 py-3 bg-active text-white rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    {!loading ? (
                      "Publish"
                    ) : (
                      <div className="inline-flex gap-2">
                        <ClipLoader color="#fff" size="20px" />
                        Uploading story..
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-5 px-6 py-3 bg-red-400 text-white rounded-xl shadow hover:scale-102 transition cursor-pointer"
                  >
                    Cancel
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

export default AddStory;
