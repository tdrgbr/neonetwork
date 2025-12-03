import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost } from "../utils/postsApi";
import ShowPost from "../components/Posts/ShowPost";

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    id;
    if (!id) {
      navigate("/");
      return;
    }

    const checkPost = async () => {
      try {
        const data = await getPost(id);
        if (data) {
          setPost(data);
          post;
        } else navigate("/");
      } catch {
        navigate("/");
      } finally {
      }
    };

    checkPost();
  }, [id, navigate]);

  if (!post) return null;
  return (
    <div className="mt-25 flex justify-center min-lg:ml-83 p-6">
      <ShowPost post={post} />
    </div>
  );
};

export default Post;
