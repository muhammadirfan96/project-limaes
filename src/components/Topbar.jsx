import Logout from "../auth/Logout.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSidebar } from "../redux/barSlice.js";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = useSelector((state) => state.jwToken.username);
  const sbar = useSelector((state) => state.bar.sidebar);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 hidden h-16 bg-teal-700 p-4 pt-3 md:block">
        <button
          onClick={() => dispatch(setSidebar())}
          className="absolute left-6 top-6 hidden md:inline"
        >
          <div
            className={`${
              sbar && "rotate-[35deg]"
            } mb-[5px] w-8 origin-left rounded-sm border-2 border-black bg-black transition delay-500`}
          ></div>
          <div
            className={`${
              sbar && "opacity-0"
            } mb-[5px] w-8 rounded-sm border-2 border-red-700 bg-red-700 transition delay-500`}
          ></div>
          <div
            className={`${
              sbar && "-rotate-[35deg]"
            } mb-[5px] w-8 origin-left rounded-sm border-2 border-white bg-white transition delay-500`}
          ></div>
        </button>
        <p className="mb-1 text-center text-2xl font-bold text-white md:text-4xl">
          <button onClick={() => navigate("/")} className="font-din">
            MERN STACK
          </button>
        </p>

        <div className="absolute right-2 top-2 text-xs">
          {username ? (
            <div className="text-right">
              <p className="mb-2 text-teal-300">Hi, {username}</p>
              <Logout />
            </div>
          ) : (
            <div className="flex">
              <button
                onClick={() => navigate("/login")}
                className="m-1 rounded bg-teal-300 p-1 shadow"
              >
                login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="m-1 rounded bg-teal-300 p-1 shadow"
              >
                register
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Topbar;
