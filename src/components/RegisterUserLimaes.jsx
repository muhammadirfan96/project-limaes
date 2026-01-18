import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setUserLimaes } from "../redux/userlimaesSlice.js";
import { setBottombarBackward } from "../redux/barSlice.js";

const RegisterUserLimaes = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const username = useSelector((state) => state.jwToken.username);
  const role = useSelector((state) => state.jwToken.role);
  const uid = useSelector((state) => state.jwToken.uid);
  const userlimaes = useSelector((state) => state.userLimaes.data);

  const bbarBackward = useSelector((state) => state.bar.bottombarBackward);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  const [errForm, setErrForm] = useState(null);

  const [nip, setNip] = useState("");
  const [fullname, setFullname] = useState("");
  const [bagianlimaes_id, setBagianLimaes_id] = useState("");
  const [nomor_hp, setNomorHp] = useState("");

  const [listBagianUnit, setListBagianUnit] = useState([]);
  const [listBagianArea, setListBagianArea] = useState([]);
  const [bagianUnit, setBagianUnit] = useState("");
  const [bagianArea, setBagianArea] = useState("");

  const bagianResult = async () => {
    try {
      const res = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagians-limaes/distinct`,
      );

      setListBagianUnit(res.data.unit);
      setListBagianArea(res.data.area);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    bagianResult();
  }, [userlimaes]);

  const findUserLimaes = async () => {
    try {
      const user_limaes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/users-limaes/aggregate`,
        {
          users_email: username,
        },
      );
      dispatch(setUserLimaes(user_limaes.data.data[0]));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (username) findUserLimaes();
  }, [username]);

  const handleSubmit = (event) => {
    event.preventDefault();
    addUserLimaes();
  };

  const addUserLimaes = async () => {
    try {
      const response = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes`,
        {
          user_id: username,
          nip,
          fullname,
          bagianlimaes_id,
          nomor_hp,
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
      setNomorHp("");

      dispatch(setBottombarBackward(false));
      dispatch(setUserLimaes(response.data));
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      setErrForm(arrError);
    }
  };

  const [bagianlimaes, setBagianLimaes] = useState([]);

  const findBagian = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes?unit=${bagianUnit}&area=${bagianArea}`,
      );
      setBagianLimaes(response.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (bagianUnit && bagianArea) findBagian();
  }, [username, bagianUnit, bagianArea]);

  useEffect(() => {
    token &&
      username &&
      !userlimaes &&
      !bbarBackward &&
      dispatch(setBottombarBackward(true));
  }, [bbarBackward]);

  return (
    token &&
    username &&
    !userlimaes && (
      <>
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] max-w-md rounded-lg bg-white p-6 shadow-lg shadow-teal-100">
            {/* Header */}
            <p className="mb-4 border-b border-teal-700 pb-2 text-center text-base font-semibold text-teal-700">
              Register User Limaes
            </p>

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
                <div className="flex">
                  {/* Unit Filter */}
                  <select
                    value={bagianUnit}
                    onChange={(e) => setBagianUnit(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  >
                    <option value="">Select Unit</option>
                    {listBagianUnit.map((each, i) => (
                      <option key={i} value={each}>
                        {each}
                      </option>
                    ))}
                  </select>

                  {/* Area Filter */}
                  <select
                    value={bagianArea}
                    onChange={(e) => setBagianArea(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  >
                    <option value="">Select Area</option>
                    {listBagianArea.map((each, i) => (
                      <option key={i} value={each}>
                        {each}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bagian Limaes */}
                {bagianUnit && bagianArea && (
                  <div className="flex gap-2">
                    <select
                      value={bagianlimaes_id}
                      onChange={(e) => setBagianLimaes_id(e.target.value)}
                      className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                    >
                      <option value="">list bagianlimaes...</option>
                      {bagianlimaes.map((each) => (
                        <option key={each._id} value={each._id}>
                          {`${each.unit}-${each.area}-${each.jabatan}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nomor HP */}
                <input
                  type="text"
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
