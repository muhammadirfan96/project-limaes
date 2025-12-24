import { BsCaretRight } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useMenu from "../config/menu.jsx";
import BubbleBackground from "./BubbleBackground.jsx";

const Sidebar = () => {
  const menu = useMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const sbar = useSelector((state) => state.bar.sidebar);

  function potongTeks(teks, batas = 12) {
    return teks.length > batas ? teks.slice(0, batas) + "..." : teks;
  }

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={`fixed bottom-0 left-0 top-[64px] hidden w-52 overflow-hidden border-r border-teal-600/40 bg-gradient-to-b from-teal-200 via-teal-300 to-emerald-200 backdrop-blur-md transition-all duration-500 md:block ${!sbar && "-ml-52"} `}
      >
        {/* BUBBLE BACKGROUND */}
        <div className="pointer-events-none absolute inset-0">
          {menu.length === 0 && (
            <BubbleBackground count={20} direction="bottom-to-top" />
          )}
        </div>

        {/* MENU */}
        <div className="relative z-10 flex h-full flex-col gap-1 overflow-y-auto p-2">
          {menu.map((each) => {
            const isActive = location.pathname === `/${each.path}`;

            return (
              <button
                key={each.path}
                onClick={() => navigate(`/${each.path}`)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/40"
                    : "text-teal-900 hover:bg-white/60"
                } `}
              >
                {/* ACTIVE BAR */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-white" />
                )}

                {/* ICON */}
                <span
                  className={`text-lg transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"} `}
                >
                  {each.icon}
                </span>

                {/* TEXT */}
                <span className="flex-1 truncate">{potongTeks(each.name)}</span>

                {/* CARET */}
                <BsCaretRight
                  className={`text-sm transition-all duration-300 ${
                    isActive
                      ? "translate-x-1 opacity-100"
                      : "opacity-40 group-hover:translate-x-1 group-hover:opacity-80"
                  } `}
                />
              </button>
            );
          })}

          {/* EMPTY STATE */}
          {/* {menu.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-teal-700">
              Loading menu...
            </div>
          )} */}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
