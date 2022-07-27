import { Post } from "../../types";
import posts from "../../data/posts.data";
import PostD from "../../components/Post";
import Head from "next/head";

interface PageProps {
  post: Post | null;
  postId: any;
}

const Page = ({ post, postId }: PageProps) => {
  return (
    <>
      <Head>
        <title>{post?.title ?? "Failed to find post"}</title>
        <meta
          name="description"
          content={post?.title ?? "Failed to find post"}
        />
      </Head>
      <main className="flex flex-row justify-center w-screen">
        <PostD post={post} postId={postId} />
      </main>
    </>
  );
};
export default Page;

export async function getServerSideProps(
  ctx: any
): Promise<{ props: PageProps }> {
  const { postId } = ctx.query;

  const post: Post | null = posts[postId as keyof typeof posts];

  return {
    props: { post, postId },
  };
}
