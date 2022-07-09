import Image from "next/image";

import { Project } from "../data/projects.data";

const Tag = ({ text }: { text: string }) => (
  <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
    {text}
  </span>
);

interface ProjectCardProps {
  project: Project;
}
function ProjectCard({ project }: ProjectCardProps) {
  const { name, desc, url, srcUrl, tags, imgs, stack } = project;

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
      <div className="relative h-40">
        {imgs.map((i, idx) => (
          <Image
            src={i}
            layout="fill"
            alt="Sunset in the mountains"
            key={idx}
          />
        ))}
      </div>
      <div className="px-6 py-4">
        <h2 className="font-bold text-xl mb-2">{name}</h2>
        <a href={url} className="font-bold text-blue-400">
          {url}
        </a>
        <p className="text-gray-700 text-base">{desc}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        {tags.map((i, idx) => (
          <Tag text={i} key={idx} />
        ))}
      </div>
      <div className="flex flex-row gap-6 px-6 py-4 pt-0">
        {stack.map((i, idx) => (
          <div className="relative w-5 h-5" key={idx}>
            <Image
              src={i.icon}
              layout="fill"
              alt={i.name + " logo"}
              title={i.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
export default ProjectCard;
export type { ProjectCardProps };
