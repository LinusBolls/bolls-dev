import ReactMarkdown from "react-markdown";

import { PostComponent } from "../../types";

interface PostComponentProps {
  component: PostComponent;
}

function PostComponentC({ component }: PostComponentProps) {
  const { type } = component;

  if (type === "md")
    return (
      <div className="markdown">
        <ReactMarkdown>{component.markdown}</ReactMarkdown>
      </div>
    );
  return null;
}
export default PostComponentC;
export type { PostComponentProps };
