import Image from "next/image";
import { Post } from "../../types";

const Tag = ({ text }: { text: string }) => (
  <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
    {text}
  </span>
);

interface PostCardProps {
  post: Post;
}
function PostCard({ post }: PostCardProps) {
  const { createdUnix, desc, id, imgUrl, title, tags, url } = post;

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
      <div className="relative h-40">
        <Image src={imgUrl} layout="fill" alt="Sunset in the mountains" />
      </div>
      <div className="px-6 py-4">
        <h2 className="font-bold text-xl mb-2">{title}</h2>
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
    </div>
  );
}
export default PostCard;
export type { PostCardProps };
