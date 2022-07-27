interface MarkdownComponent {
  type: "md";

  markdown: string;
}

interface CodeComponent {
  type: "code";

  lang: string;
  code: string;
}
interface ImgComponent {
  type: "img";

  assetDesc: string;
  assetUrl: string;
  assetAlt: string;
}
interface VidComponent {
  type: "vid";

  assetDesc: string;
  assetUrl: string;
  assetAlt: string;
}
type PostComponent =
  | MarkdownComponent
  | CodeComponent
  | ImgComponent
  | VidComponent;

interface PostSection {
  id: string;
  title: string;

  components: PostComponent[];
}
interface Post {
  id: string;
  createdUnix: number;
  version: number;

  title: string;
  desc: string;
  url: string;
  imgUrl: string;
  tags: string[];

  sections: PostSection[];
}

export type {
  MarkdownComponent,
  CodeComponent,
  ImgComponent,
  VidComponent,
  PostComponent,
  PostSection,
  Post,
};
