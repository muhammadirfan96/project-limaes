import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setBottombar, setBottombarBackward } from "../redux/barSlice.js";
import useMenu from "../config/menu.jsx";
import BubbleBackground from "./BubbleBackground.jsx";

const Bottombar = () => {
  const menu = useMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const bbar = useSelector((state) => state.bar.bottombar);
  const bbarBackward = useSelector((state) => state.bar.bottombarBackward);

  function potongTeks(teks, batas = 12) {
    return teks.length > batas ? teks.slice(0, batas) + "..." : teks;
  }

  return (
    <>
      {/* CONTAINER */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-16 ${bbarBackward && "-z-10"} border-t border-teal-500/40 bg-gradient-to-r from-teal-200 via-teal-300 to-emerald-200 backdrop-blur-md transition-all duration-500 md:hidden ${bbar && "-mb-[62px]"} `}
      >
        {/* TOGGLE BUTTON */}
        <button
          onClick={() => dispatch(setBottombar())}
          className="absolute -top-[28px] right-0 rounded-tl-xl bg-teal-700 px-3 pt-1 shadow-lg"
        >
          <span
            className={`mr-0.5 inline-block h-4 rotate-45 rounded-sm border-2 border-white bg-white transition duration-500 ${!bbar && "translate-x-2"} `}
          />
          <span
            className={`ml-0.5 inline-block h-4 -rotate-45 rounded-sm border-2 border-black bg-black transition duration-500 ${!bbar && "-translate-x-2"} `}
          />
        </button>

        {/* MENU */}
        <div className="flex h-full w-full justify-evenly gap-1 overflow-x-auto px-1 py-1">
          {menu.map((each) => {
            const isActive = location.pathname === `/${each.path}`;

            return (
              <button
                key={each.path}
                onClick={() => navigate(`/${each.path}`)}
                className={`group relative flex min-w-[72px] flex-col items-center justify-center rounded-xl px-3 py-2 text-[10px] font-medium transition-all duration-300 ${
                  isActive
                    ? "scale-105 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/50"
                    : "bg-white/70 text-teal-900 hover:scale-105 hover:bg-teal-100"
                } `}
              >
                {/* ACTIVE GLOW */}
                {isActive && (
                  <span className="absolute inset-0 -z-10 rounded-xl bg-teal-400 opacity-50 blur-md" />
                )}

                {/* ICON */}
                <div
                  className={`mb-0.5 text-lg transition-transform duration-300 ${isActive ? "-translate-y-0.5" : "group-hover:-translate-y-0.5"} `}
                >
                  {each.icon}
                </div>

                {/* TEXT */}
                <span className="truncate leading-tight">
                  {potongTeks(each.name)}
                </span>
              </button>
            );
          })}

          {/* EMPTY STATE */}
          {menu.length === 0 && (
            <BubbleBackground count={5} direction="left-to-right" />
          )}
        </div>
      </div>
    </>
  );
};

export default Bottombar;
