import { PostSection } from "../../types";
import PostComponent from "./PostComponent";

interface PostSectionProps {
  section: PostSection;
}

function PostSection({ section }: PostSectionProps) {
  const { id, title, components } = section;

  return (
    <>
      {components.map((i, idx) => (
        <PostComponent component={i} key={idx} />
      ))}
    </>
  );
}
export default PostSection;
export type { PostSectionProps };
