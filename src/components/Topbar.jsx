import Logout from "../auth/Logout.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSidebar } from "../redux/barSlice.js";
import { useState } from "react";
import { setNotification } from "../redux/notificationSlice.js";
import { axiosRT } from "../config/axios.js";
import { FaPencilAlt } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sbar = useSelector((state) => state.bar.sidebar);
  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const username = useSelector((state) => state.jwToken.username);
  const role = useSelector((state) => state.jwToken.role);
  const userlimaes = useSelector((state) => state.userLimaes.data);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* ================= USER DETAIL ================= */

  const findUserLimaes = async () => {
    try {
      setLoadingDetail(true);

      const bagianRes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes/${userlimaes?.bagianlimaes_id}`,
      );

      setUserDetail({
        ...userlimaes,
        bagian_limaes: bagianRes.data,
      });
    } catch (e) {
      const err =
        e?.response?.data?.error?.split(",")?.[0] || "Terjadi kesalahan";
      dispatch(setNotification({ message: err, background: "bg-red-100" }));
    } finally {
      setLoadingDetail(false);
    }
  };

  const uploadPicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append("picture", file);

      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes/${userlimaes._id}/upload-picture`,
        formData,
      );

      dispatch(
        setNotification({
          message: "Foto profil berhasil diperbarui",
          background: "bg-teal-100",
        }),
      );

      findUserLimaes();
    } catch (e) {
      const err =
        e?.response?.data?.error?.split(",")?.[0] || "Terjadi kesalahan";
      dispatch(setNotification({ message: err, background: "bg-red-100" }));
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      {/* TOPBAR */}
      <header className="fixed inset-x-0 top-0 h-16 border-b border-teal-600/40 bg-gradient-to-r from-teal-700 to-emerald-600 px-4 shadow-lg">
        <div className="flex h-full items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(setSidebar())}
              className="hidden rounded-lg p-2 text-white transition hover:bg-white/20 md:block"
            >
              <HiMenuAlt2
                className={`text-2xl transition-transform duration-300 ${
                  sbar ? "rotate-90" : ""
                }`}
              />
            </button>

            <button
              onClick={() => navigate("/")}
              className="text-xl font-extrabold tracking-wide text-white md:text-2xl"
            >
              HOUSE KEEPING
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 text-sm">
            {username ? (
              <button
                onClick={findUserLimaes}
                className="rounded-lg bg-white/20 px-3 py-1 text-white transition hover:bg-white/30"
              >
                {loadingDetail
                  ? "Loading..."
                  : `Hi, ${userlimaes?.fullname || username}`}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-lg bg-white px-3 py-1 font-semibold text-teal-700 shadow hover:bg-teal-100"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-lg bg-teal-500 px-3 py-1 font-semibold text-white shadow hover:bg-teal-600"
                >
                  Register
                </button>
              </div>
            )}

            {username && <Logout />}
          </div>
        </div>
      </header>

      {/* ================= MODAL USER DETAIL ================= */}
      {userDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setUserDetail(null)}
        >
          <div
            className="relative w-[95%] max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setUserDetail(null)}
              className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-white hover:bg-red-600"
            >
              ×
            </button>

            {/* HEADER */}
            <h2 className="mb-4 border-b border-teal-500 pb-2 text-center text-lg font-semibold text-teal-700">
              👤 {role} Profile
            </h2>

            <div className="flex flex-col items-center gap-4 md:flex-row">
              {/* PHOTO */}
              <div className="relative">
                <img
                  src={
                    userDetail.picture
                      ? `${import.meta.env.VITE_API_URL}/${userDetail.picture}`
                      : "/default.png"
                  }
                  alt="User"
                  className="h-28 w-28 rounded-full border-4 border-teal-300 object-cover shadow"
                />

                <label
                  htmlFor={`input_image${userDetail._id}`}
                  className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-teal-600 shadow hover:bg-teal-700"
                >
                  <FaPencilAlt className="text-sm text-white" />
                </label>

                <input
                  id={`input_image${userDetail._id}`}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files.length && uploadPicture(e.target.files[0])
                  }
                />
              </div>

              {/* INFO */}
              <div className="flex-1">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Fullname", userDetail.fullname],
                      ["NIP", userDetail.nip],
                      ["Unit", userDetail.bagian_limaes?.unit],
                      ["Bagian", userDetail.bagian_limaes?.area],
                      ["Jabatan", userDetail.bagian_limaes?.jabatan],
                      ["Atasan", userDetail.bagian_limaes?.atasan],
                      ["Bawahan", userDetail.bagian_limaes?.bawahan],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="py-1 font-semibold text-gray-600">
                          {label}
                        </td>
                        <td className="px-2 text-gray-500">:</td>
                        <td className="py-1 text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
