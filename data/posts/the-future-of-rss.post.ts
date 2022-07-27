import type { Post } from "../../types";

const post: Post = {
  id: "lwkejr",
  createdUnix: Date.now(),
  version: 0,

  title: "The future of RSS",
  desc: "wlekrjwer",
  url: "the-future-of-rss",
  imgUrl: "/rss.jpg",
  tags: ["Technologies", "Rss"],

  sections: [
    {
      id: "intro",
      title: "The History of RSS",
      components: [
        {
          type: "md",
          markdown: `## The future of RSS\n### hier test`,
        },
      ],
    },
    {
      id: "current-situation",
      title: "Who even uses RSS?",
      components: [
        { type: "md", markdown: `## Header\n* dotted lists *\n [url](/doc)` },
      ],
    },
    {
      id: "alternatives",
      title: "Alternatives to RSS",
      components: [{ type: "md", markdown: "" }],
    },
    {
      id: "how-to",
      title: "How to create a feed in NodeJs",
      components: [{ type: "md", markdown: "" }],
    },
  ],
};
export default post;
