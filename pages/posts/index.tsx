import ProjectCard from "../../components/Cards/ProjectCard";
import Projects from "../../data/projects.data";

import Posts from "../../data/posts.data";
import PostCard from "../../components/Cards/PostCard";

function Page() {
  return (
    <div className="flex flex-row flex-wrap gap-10 mt-40 mb-10 justify-between">
      {Object.entries(Projects).map(([key, project]) => (
        <ProjectCard key={key} project={project} />
      ))}
      {Object.entries(Posts).map(([key, post]) => (
        <PostCard key={key} post={post} />
      ))}
    </div>
  );
}
export default Page;
