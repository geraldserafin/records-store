import Sidebar from "./Sidebar";

export default function Layout(props) {
  return (
    <div class="container mx-auto flex items-start">
      <aside class="border sticky top-8 flex flex-col gap-4">
        <Sidebar />
      </aside>
      <main class="border bg-white -ml-px">{props.children}</main>
    </div>
  );
}
