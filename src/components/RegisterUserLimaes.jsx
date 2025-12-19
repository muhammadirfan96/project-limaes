import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setUserLimaes } from "../redux/userlimaesSlice.js";
import { FaPencilAlt } from "react-icons/fa";

const RegisterUserLimaes = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const username = useSelector((state) => state.jwToken.username);
  const role = useSelector((state) => state.jwToken.role);
  const uid = useSelector((state) => state.jwToken.uid);
  const userlimaes = useSelector((state) => state.userLimaes.data);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  const [errForm, setErrForm] = useState(null);

  const [nip, setNip] = useState("");
  const [fullname, setFullname] = useState("");
  const [bagianlimaes_id, setBagianLimaes_id] = useState("");
  const [nomor_hp, setNomorHp] = useState("");

  // console.log({ userlimaes });

  const findUserLimaes = async () => {
    try {
      const user_limaes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes?user_id=${uid}`,
      );
      dispatch(setUserLimaes(user_limaes.data.data[0]));
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      dispatch(
        setNotification({ message: arrError[0], background: "bg-red-100" }),
      );
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addUserLimaes();
  };

  const addUserLimaes = async () => {
    try {
      const response = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes`,
        {
          user_id: uid,
          nip,
          fullname,
          bagianlimaes_id,
          nomor_hp,
          createdBy: uid,
        },
      );
      dispatch(
        setNotification({
          message: "User registered successfully!",
          background: "bg-teal-100",
        }),
      );
      setErrForm(null);
      setNip("");
      setFullname("");
      setBagianLimaes_id("");
      setBagianLimaes([]);
      setKeyBagianLimaes("");
      setInputBagianLimaes(true);
      setNamaBagianLimaes("");

      dispatch(setUserLimaes(response.data));
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      setErrForm(arrError);
    }
  };

  const uploadPicture = async (file) => {
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

  useEffect(() => {
    if (token && uid) findUserLimaes();
  }, [token, uid]);

  // bagianlimaes_id
  // option select

  const [bagianlimaes, setBagianLimaes] = useState([]);
  const [keyBagianLimaes, setKeyBagianLimaes] = useState("");

  const findBagianLimaes = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes?area=${keyBagianLimaes}`,
      );
      setBagianLimaes(response.data.data);
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      dispatch(
        setNotification({ message: arrError[0], background: "bg-red-100" }),
      );
    }
  };

  useEffect(() => {
    findBagianLimaes();
  }, [keyBagianLimaes]);

  // input
  const [inputBagianLimaes, setInputBagianLimaes] = useState(true);
  const [namaBagianLimaes, setNamaBagianLimaes] = useState("");
  const handleChangeOptionSelectBagianLimaes = (event) => {
    const selected = event.target[event.target.selectedIndex];
    setBagianLimaes_id(selected.value);
    setInputBagianLimaes(true);
    setNamaBagianLimaes(selected.getAttribute("data-additional-info"));
  };

  return (
    token &&
    !userlimaes && (
      <>
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] max-w-md rounded-lg bg-white p-6 shadow-lg shadow-teal-100">
            {/* Header */}
            <p className="mb-4 border-b border-teal-700 pb-2 text-center text-base font-semibold text-teal-700">
              Register User Limaes
            </p>
            {/* <button
            onClick={closeModal}
            className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-sm text-white shadow hover:bg-red-700"
          >
            ✕
          </button> */}

            {/* Error */}
            {errForm && (
              <div className="mb-3 rounded border border-red-700 bg-red-50 p-2 text-xs italic text-red-700">
                {errForm.map((err, index) => (
                  <p key={index}>{err}</p>
                ))}
              </div>
            )}

            {/* Form */}
            <div className="mt-1 max-h-[80vh] overflow-auto p-2">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* NIP */}
                <input
                  type="text"
                  placeholder="NIP"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                />

                {/* Fullname */}
                <input
                  type="text"
                  placeholder="Fullname"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />

                {/* Bagian Limaes */}
                {inputBagianLimaes ? (
                  <button
                    type="button"
                    className="w-full rounded-md border border-slate-300 p-2 text-start text-sm"
                    onClick={() => setInputBagianLimaes(false)}
                  >
                    {namaBagianLimaes ? (
                      namaBagianLimaes
                    ) : (
                      <span className="text-slate-400">bagianlimaes...</span>
                    )}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={bagianlimaes_id}
                      onChange={handleChangeOptionSelectBagianLimaes}
                      className="w-1/2 rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                    >
                      <option value="">list bagianlimaes...</option>
                      {bagianlimaes.map((each) => (
                        <option
                          key={each._id}
                          value={each._id}
                          data-additional-info={`${each.unit}-${each.area}`}
                        >
                          {`${each.unit}-${each.area}`}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Search bagianlimaes"
                      className="w-1/2 rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                      value={keyBagianLimaes}
                      onChange={(e) => setKeyBagianLimaes(e.target.value)}
                    />
                  </div>
                )}

                {/* Nomor HP */}
                <input
                  type="number"
                  placeholder="Nomor HP"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  value={nomor_hp}
                  onChange={(e) => setNomorHp(e.target.value)}
                />

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-md bg-teal-500 p-2 text-sm font-semibold text-white hover:bg-teal-600"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default RegisterUserLimaes;
