import dayjs from "dayjs";
import Image from "next/image";

import { Post } from "../../types";
import PostSection from "./PostSection";

const insertTokenEveryN = (
  arr: any[],
  token: any,
  n: number,
  fromEnd: boolean
) => {
  const a = arr.slice(0);

  let idx = fromEnd ? a.length - n : n;

  while (fromEnd ? idx >= 1 : idx <= a.length) {
    a.splice(idx, 0, token);
    idx = fromEnd ? idx - n : idx + n + 1;
  }
  return a;
};

interface PostProps {
  post: Post | null;
  postId: any;
}

const PostC = ({ post, postId }: PostProps) => {
  if (post == null) return <div>could not find post with id "{postId}"</div>;

  const { title, desc, sections, imgUrl, createdUnix, tags } = post;

  return (
    <article className="w-full max-w-prose pl-2 pr-2 pb-5 relative">
      <h1 className="w-full text-center font-semibold text-4xl pb-8">
        {title}
      </h1>
      <div className="flex justify-center">
        {insertTokenEveryN(
          tags.map((i, idx) => <span key={idx}>{i}</span>),
          <div className="pl-2 pr-2">•</div>,
          1,
          true
        )}
      </div>
      <div className="w-full text-center text-gray-500">
        {dayjs(createdUnix).format("MMMM D, YYYY")}
      </div>
      <div className="relative w-full h-40 bg-blue-300">
        <Image src={imgUrl} alt="dings" layout="fill" objectFit="cover" />
      </div>

      {sections.map((i, idx) => (
        <PostSection section={i} key={idx} />
      ))}
      <a rel="author" href="https://bolls.dev" />
    </article>
  );
};
export default PostC;
export type { PostProps };
