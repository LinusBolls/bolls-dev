const item =
  "flex items-center justify-center h-full pl-8 pr-8 cursor-pointer hover:underline";

function Header() {
  return (
    <header className="grid grid-rows-2 grid-cols-2 row-auto h-20 md:grid-rows-1 md:grid-cols-3">
      <a className={item + " order-0"} href="/contact">
        Contact
      </a>

      <a
        className={item + " font-semibold text-xl ml-auto mr-auto order-1"}
        href="/"
      >
        Linus Bolls
      </a>

      <div className="flex order-2">
        <a className={item} href="/posts">
          Blog
        </a>
        <a className={item} href="/projects">
          Projects
        </a>
        <a className={item} href="/resume">
          Resume
        </a>
      </div>
    </header>
  );
}
export default Header;
