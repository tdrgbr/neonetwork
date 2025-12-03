import StoryContent from "../components/Stories/StoryContent";
import UserStory from "../components/Stories/UserStory";
import { useParams } from "react-router-dom";

const Story = () => {
  const { storyUserId } = useParams();
  return <>{storyUserId ? <StoryContent /> : <UserStory />}</>;
};

export default Story;
