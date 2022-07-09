interface Technology {
  name: string;
  desc: string;
  url: string;
  icon: string;
}
const Tech = {
  TYPESCRIPT: {
    name: "Typescript",
    desc: "Typed superset of Javascript",
    url: "https://typescriptlang.org",
    icon: "/techIcons/typescript.svg",
  },
  REACT: {
    name: "ReactJs",
    desc: "",
    url: "https://reactjs.org",
    icon: "/techIcons/react.svg",
  },
  NEXT: {
    name: "NextJs",
    desc: "",
    url: "https://nextjs.org",
    icon: "/techIcons/next.svg",
  },
  MONGO: {
    name: "MongoDB",
    desc: "",
    url: "https://mongodb.com",
    icon: "/techIcons/mongo.png",
  },
  GRAPHQL: {
    name: "GraphQL",
    desc: "",
    url: "https://graphql.org",
    icon: "/techIcons/graphql.svg",
  },
  CHAKRA: {
    name: "Chakra-UI",
    desc: "",
    url: "https://chakra-ui.com/",
    icon: "/techIcons/chakra.png",
  },
  TAILWIND: {
    name: "TailwindCss",
    desc: "",
    url: "https://tailwindcss.com",
    icon: "/techIcons/tailwind.svg",
  },
  PYTHON: {
    name: "Python",
    desc: "",
    url: "https://python.org",
    icon: "/techIcons/python.svg",
  },
  GOLANG: {
    name: "Go",
    desc: "",
    url: "https://go.dev",
    icon: "/techIcons/golang.svg",
  },
  POSTGRES: {
    name: "PostgreSQL",
    desc: "",
    url: "https://postgresql.org",
    icon: "/techIcons/postgres.png",
  },
};

interface Project {
  name: string;
  desc: string;
  url: string;
  srcUrl: string;
  tags: string[];
  imgs: string[];
  stack: Technology[];
}

const Projects: { [key: string]: Project } = {
  0: {
    name: "Roomey.app",
    desc: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

    Voluptatibus quia, nulla! Maiores et perferendis eaque,
    exercitationem praesentium nihil.`,
    url: "https://roomey.app",
    srcUrl: "",
    tags: ["Frontend"],
    imgs: ["/me.jpeg"],
    stack: [Tech.TYPESCRIPT, Tech.REACT, Tech.NEXT, Tech.CHAKRA],
  },
  1: {
    name: "Code-Library",
    desc: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    Voluptatibus quia, nulla! Maiores et perferendis eaque,
    exercitationem praesentium nihil.`,
    url: "https://library.code.berlin",
    srcUrl: "",
    tags: ["Backend"],
    imgs: ["/me.jpeg"],
    stack: [Tech.TYPESCRIPT, Tech.MONGO, Tech.GRAPHQL],
  },
  2: {
    name: "blog.bolls.dev",
    desc: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    Voluptatibus quia, nulla! Maiores et perferendis eaque,
    exercitationem praesentium nihil.`,
    url: "https://blog.bolls.dev",
    srcUrl: "",
    tags: ["Frontend", "Backend"],
    imgs: ["/me.jpeg"],
    stack: [Tech.TYPESCRIPT, Tech.MONGO, Tech.REACT, Tech.NEXT, Tech.TAILWIND],
  },
  3: {
    name: "Maggus",
    desc: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    Voluptatibus quia, nulla! Maiores et perferendis eaque,
    exercitationem praesentium nihil.`,
    url: "https://npmjs.com/package/maggus",
    srcUrl: "",
    tags: ["Library"],
    imgs: ["/me.jpeg"],
    stack: [Tech.TYPESCRIPT],
  },
  4: {
    name: "Ari",
    desc: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    Voluptatibus quia, nulla! Maiores et perferendis eaque,
    exercitationem praesentium nihil.`,
    url: "",
    srcUrl: "",
    tags: ["Frontend", "Backend"],
    imgs: ["/me.jpeg"],
    stack: [Tech.TYPESCRIPT, Tech.REACT, Tech.NEXT, Tech.GOLANG],
  },
  5: {
    name: "Sonar",
    desc: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    Voluptatibus quia, nulla! Maiores et perferendis eaque,
    exercitationem praesentium nihil.`,
    url: "https://sonar.dings",
    srcUrl: "",
    tags: ["Frontend", "Backend"],
    imgs: ["/me.jpeg"],
    stack: [
      Tech.TYPESCRIPT,
      Tech.REACT,
      Tech.NEXT,
      Tech.TAILWIND,
      Tech.GRAPHQL,
      Tech.POSTGRES,
    ],
  },
};
export default Projects;
export { Tech };
export type { Technology, Project };
