import Logout from "../auth/Logout.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSidebar } from "../redux/barSlice.js";
import { useState } from "react";
import { setNotification } from "../redux/notificationSlice.js";
import { axiosRT } from "../config/axios.js";
import { FaPencilAlt } from "react-icons/fa";

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

  const findUserLimaes = async () => {
    try {
      setLoadingDetail(true);

      const bagianRes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes/${userlimaes?.bagianlimaes_id}`,
      );

      // const jabatanRes = await axiosInterceptors.get(
      //   `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/jabatan-limaes/${userlimaes?.jabatanlimaes_id}`,
      // );

      setUserDetail({
        ...userlimaes,
        bagian_limaes: bagianRes.data,
        // jabatan_limaes: jabatanRes.data,
      });
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      dispatch(
        setNotification({ message: arrError[0], background: "bg-red-100" }),
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const uploadPicture = async (file) => {
    console.log(userlimaes._id);
    try {
      const formData = new FormData();
      formData.append("picture", file);
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes/${userlimaes._id}/upload-picture`,
        formData,
      );
      dispatch(
        setNotification({
          message: "selected data has been updated",
          background: "bg-teal-100",
        }),
      );
      findUserLimaes();
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      dispatch(
        setNotification({ message: arrError[0], background: "bg-red-100" }),
      );
      console.error(e);
    }
  };

  const uploadTtd = async (file) => {
    try {
      const formData = new FormData();
      formData.append("picture", file);
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes/${userlimaes.id}/upload-picture`,
        formData,
      );
      dispatch(
        setNotification({
          message: "selected data has been updated",
          background: "bg-teal-100",
        }),
      );
      findUserLimaes();
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  return (
    <>
      <div className="fixed left-0 right-0 top-0 h-16 bg-teal-700 p-4 pt-3">
        {/* Tombol Sidebar */}
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

        {/* Judul */}
        <p className="mb-1 text-start text-2xl font-bold text-white md:text-center md:text-4xl">
          <button onClick={() => navigate("/")} className="font-din">
            HOUSE KEEPING
          </button>
        </p>

        {/* Login / Logout */}
        <div className="absolute right-2 top-2 text-xs">
          {username ? (
            <div className="text-right">
              <p
                className="mb-2 cursor-pointer text-teal-300 hover:text-white"
                onClick={findUserLimaes}
              >
                {loadingDetail
                  ? "Loading..."
                  : `Hi, ${userlimaes?.fullname || username}`}
              </p>
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

      {/* Modal User Detail */}
      {userDetail && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80"
          onClick={() => setUserDetail(null)}
        >
          <div
            className="relative w-[95%] max-w-lg rounded-2xl bg-white p-5 shadow-xl transition-all duration-300 hover:shadow-2xl md:w-[80%]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setUserDetail(null)}
              className="absolute right-3 top-3 rounded-full bg-red-600 px-2 py-1 text-white hover:bg-red-700"
            >
              ×
            </button>

            {/* Header */}
            <h2 className="mb-4 border-b border-teal-600 pb-2 text-center text-lg font-semibold capitalize text-teal-700">
              👤 {role} detail
            </h2>

            {/* Konten */}
            <div className="flex flex-col items-center gap-4 md:flex-row">
              {/* Foto Profil */}
              {/* <div className="flex justify-center md:w-1/3">
                <img
                  src={userDetail.picture || "/default.png"}
                  alt="User Photo"
                  className="h-28 w-28 rounded-full border-4 border-teal-300 object-cover shadow-md"
                />
              </div> */}

              <div className="relative inline-block">
                <img
                  src={
                    userDetail.picture
                      ? `${import.meta.env.VITE_API_URL}/${userDetail.picture}`
                      : "/default.png"
                  }
                  alt="User Photo"
                  className="h-28 w-28 rounded-full border-4 border-teal-300 object-cover shadow-md"
                />
                <label
                  htmlFor={`input_image${userDetail._id}`}
                  className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-teal-500 p-1 shadow-md transition-all hover:bg-teal-600 active:scale-90"
                >
                  <span className="text-xl">
                    <FaPencilAlt className="text-white" />
                  </span>
                </label>
                <input
                  id={`input_image${userDetail._id}`}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      uploadPicture(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Informasi User (Tanpa Border) */}
              <div className="md:w-2/3">
                <table className="w-full table-auto text-sm">
                  <tbody className="space-y-1">
                    {/* Row Component (tanpa border, tetap rapi) */}
                    {[
                      ["Fullname", userDetail.fullname],
                      ["NIP", userDetail.nip],
                      ["Unit", userDetail.bagian_limaes?.unit],
                      ["Bagian", userDetail.bagian_limaes?.area],
                      ["Jabatan", userDetail.bagian_limaes?.jabatan],
                      ["Atasan", userDetail.bagian_limaes?.atasan],
                      ["Bawahan", userDetail.bagian_limaes?.bawahan],
                    ].map(([label, value]) => (
                      <tr key={label} className="align-top">
                        <td className="w-1/3 py-1 font-semibold text-gray-600">
                          {label}
                        </td>
                        <td className="w-[1px] px-2 text-gray-600">:</td>
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
