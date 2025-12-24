import { axiosDefault } from "../config/axios.js";
import { useDispatch } from "react-redux";
import {
  setToken,
  setExpire,
  setUsername,
  setRole,
  setUid,
} from "../redux/tokenSlice.js";
import { setNotification } from "../redux/notificationSlice.js";
import { useNavigate } from "react-router-dom";
import { setUserLimaes } from "../redux/userlimaesSlice.js";
import { FiLogOut } from "react-icons/fi";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axiosDefault.delete("/logout");

      dispatch(setToken(""));
      dispatch(setExpire(""));
      dispatch(setUsername(""));
      dispatch(setRole(""));
      dispatch(setUid(""));
      dispatch(setUserLimaes(null));

      dispatch(
        setNotification({
          message: response.data?.message || "Logout berhasil",
          background: "bg-teal-100",
        }),
      );

      navigate("/");
    } catch (e) {
      const err = e?.response?.data?.error?.split(",")?.[0] || "Logout gagal";
      dispatch(
        setNotification({
          message: err,
          background: "bg-red-100",
        }),
      );
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 rounded-lg bg-red-500/90 px-3 py-1 text-xs font-semibold text-white shadow transition-all hover:bg-red-600 hover:shadow-md active:scale-95"
      title="Logout"
    >
      <FiLogOut className="text-sm" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
};

export default Logout;
