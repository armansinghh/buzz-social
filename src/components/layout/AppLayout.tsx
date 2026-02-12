import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="border-b px-6 flex items-center bg-white">
        <Navbar />
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-72 border-r p-6 hidden lg:block bg-white">
          <LeftSidebar />
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-2xl mx-auto">
            <Outlet />
          </div>
        </main>

        <aside className="w-72 border-l p-6 hidden xl:block bg-white">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
