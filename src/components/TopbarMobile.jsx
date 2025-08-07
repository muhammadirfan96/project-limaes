import Logout from "../auth/Logout.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const TopbarMobile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = useSelector((state) => state.jwToken.username);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 h-16 bg-teal-700 p-4 pt-3 md:hidden">
        <p className="mb-1 text-2xl font-bold text-white md:text-4xl">
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

export default TopbarMobile;
