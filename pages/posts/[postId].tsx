// import { Converter } from "showdown";
import ReactMarkdown from "react-markdown";

interface Post {
  publishedDate: number;
  markdown: string;
}

interface PageProps {
  post: Post;
}

const Page = ({ post }: PageProps) => {
  const { publishedDate, markdown } = post;

  // const converter = new Converter();

  // const postHtml = converter.makeHtml(markdown);

  return <ReactMarkdown>{markdown}</ReactMarkdown>;

  // return <section dangerouslySetInnerHTML={{ __html: postHtml }}></section>;
};
export default Page;

export async function getServerSideProps(context: any) {
  const { postId } = context.query;

  const postMarkdown = `# Best Practices with Catchy Acronyms

  ## DRY
  
  Do not Repeat Yourself
  
  ## SOLID
  
  Single Responsibility
  Open-Closed
  Liskov Substitution
  Interface Segregation
  Dependency Inversion
  
  ## Functional
  
  Pure Functions
  Immutability (Object.freeze())
  
  # Patterns and Techniques
  
  ## Guard Clauses
  
  
  ## Give Functor Methods Expressive Names
  
  ## Top Level Error Handling
  
  
  ## DAO (mongoose)
  
  ## Finite State Machine
  
  https://www.youtube.com/watch?v=Vt8aZDPzRjI
  
  ## Centralized, Tag-Based Collision Handlers (unity)
  
  ## Chain of Responsibility (express middleware)
  
  ## Containerization
  
  - Microservices
  - React Components
  
  ## Long Polling
  
  ## Observer
  
  https://refactoring.guru/design-patterns/observer
  
  ## Command
  
  https://refactoring.guru/design-patterns/command
  
  ## Semantic Commits
  
  https://www.conventionalcommits.org/en/v1.0.0/
  
  ## JSDocs
  
  https://jsdoc.app/
  
  ## Use Factory Functions Instead of Classes
  
  ## Composition Over Inheritance
  
  https://www.youtube.com/watch?v=kV06GiJgFhc
  
  ## Use Consistent (ideally CRUD) Verbs per Concept
  
  https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29
  `;

  const post: Post = {
    publishedDate: Date.now(),
    markdown: postMarkdown,
  };

  return {
    props: { post },
  };
}
