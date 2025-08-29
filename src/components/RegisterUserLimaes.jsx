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
  const [jabatanlimaes_id, setJabatanLimaes_id] = useState("");
  const [bagianlimaes_id, setBagianLimaes_id] = useState("");

  console.log("userlimaes", userlimaes);

  const findUserLimaes = async () => {
    try {
      const user_limaes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes?user_id=${uid}`,
      );
      dispatch(setUserLimaes(user_limaes.data.data[0]));
    } catch (error) {
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
    setErrForm(null);
    setNip("");
    setFullname("");
    setJabatanLimaes_id("");
    setBagianLimaes_id("");
  };

  const addUserLimaes = async () => {
    try {
      const response = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes`,
        {
          user_id: uid,
          nip,
          fullname,
          jabatanlimaes_id,
          bagianlimaes_id,
          createdBy: uid,
        },
      );
      setUserLimaes(response.data.data);
      dispatch(
        setNotification({
          type: "success",
          message: "User registered successfully!",
        }),
      );
    } catch (error) {
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
      findBarang();
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  useEffect(() => {
    if (token) findUserLimaes();
  }, [token]);

  // jabatanlimaes_id
  // option select
  const [jabatanlimaes, setJabatanLimaes] = useState([]);
  const [keyJabatanLimaes, setKeyJabatanLimaes] = useState("");

  const findJabatanLimaes = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/jabatan-limaes?nama=${keyJabatanLimaes}`,
      );
      setJabatanLimaes(response.data.data);
    } catch (error) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      dispatch(
        setNotification({ message: arrError[0], background: "bg-red-100" }),
      );
    }
  };

  useEffect(() => {
    findJabatanLimaes();
  }, [keyJabatanLimaes]);

  // input
  const [inputJabatanLimaes, setInputJabatanLimaes] = useState(true);
  const [namaJabatanLimaes, setNamaJabatanLimaes] = useState("");

  const handleChangeOptionSelectJabatanLimaes = (event) => {
    const selected = event.target[event.target.selectedIndex];
    setJabatanLimaes_id(selected.value);
    setInputJabatanLimaes(true);
    setNamaJabatanLimaes(selected.getAttribute("data-additional-info"));
  };

  // bagianlimaes_id
  // option select

  const [bagianlimaes, setBagianLimaes] = useState([]);
  const [keyBagianLimaes, setKeyBagianLimaes] = useState("");

  const findBagianLimaes = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes?nama=${keyBagianLimaes}`,
      );
      setBagianLimaes(response.data.data);
    } catch (error) {
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
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b-2 border-teal-700 text-center">
              register user limaes
            </p>

            <div className="mt-1 max-h-[95vh] overflow-auto p-2">
              {errForm && (
                <div className="mb-2 rounded border border-red-700 p-1 text-xs italic text-red-700">
                  {errForm.map((err, index) => (
                    <p key={index}>{err}</p>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/*data yang akan di input*/}

                {/*nip, input type text*/}
                <input
                  type="text"
                  placeholder="nip"
                  className="mb-1 w-full rounded-md border p-1"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                />

                {/*fullname, input type text*/}
                <input
                  type="text"
                  placeholder="fullname"
                  className="mb-1 w-full rounded-md border p-1"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />

                {/*jabatanlimaes_id, input type select*/}
                {inputJabatanLimaes ? (
                  <button
                    type="button"
                    className="mb-1 w-full rounded-md border p-1 text-start"
                    onClick={() => setInputJabatanLimaes(false)}
                  >
                    {namaJabatanLimaes ? (
                      namaJabatanLimaes
                    ) : (
                      <span className="text-slate-400">jabatanlimaes...</span>
                    )}
                  </button>
                ) : (
                  <div className="flex justify-between">
                    <select
                      value={jabatanlimaes_id}
                      onChange={handleChangeOptionSelectJabatanLimaes}
                      className="mb-1 w-[50%] rounded-md rounded-r-none border p-1"
                    >
                      <option value="">list jabatanlimaes...</option>
                      {jabatanlimaes.map((each) => (
                        <option
                          key={each._id}
                          value={each._id}
                          data-additional-info={each.nama}
                        >
                          {each.nama}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="search_jabatanlimaes"
                      className="mb-1 w-[50%] rounded-md rounded-l-none border p-1"
                      value={keyJabatanLimaes}
                      onChange={(e) => setKeyJabatanLimaes(e.target.value)}
                    />
                  </div>
                )}

                {/*bagianlimaes_id, input type select*/}
                {inputBagianLimaes ? (
                  <button
                    type="button"
                    className="mb-1 w-full rounded-md border p-1 text-start"
                    onClick={() => setInputBagianLimaes(false)}
                  >
                    {namaBagianLimaes ? (
                      namaBagianLimaes
                    ) : (
                      <span className="text-slate-400">bagianlimaes...</span>
                    )}
                  </button>
                ) : (
                  <div className="flex justify-between">
                    <select
                      value={bagianlimaes_id}
                      onChange={handleChangeOptionSelectBagianLimaes}
                      className="mb-1 w-[50%] rounded-md rounded-r-none border p-1"
                    >
                      <option value="">list bagianlimaes...</option>
                      {bagianlimaes.map((each) => (
                        <option
                          key={each._id}
                          value={each._id}
                          data-additional-info={each.nama}
                        >
                          {each.nama}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="search_bagianlimaes"
                      className="mb-1 w-[50%] rounded-md rounded-l-none border p-1"
                      value={keyBagianLimaes}
                      onChange={(e) => setKeyBagianLimaes(e.target.value)}
                    />
                  </div>
                )}

                {/*picture*/}
                <div className="relative inline-block">
                  <img
                    src={
                      userlimaes?.picture
                        ? `${import.meta.env.VITE_API_URL}/${userlimaes.picture}`
                        : "/default.png"
                    }
                    alt="User Photo"
                    className="h-16 w-16 rounded-full border border-teal-300 object-cover"
                  />
                  <label
                    htmlFor={`input_image_picture`}
                    className="absolute bottom-0 right-0 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-teal-500 p-1 shadow-md transition-all hover:bg-teal-600 active:scale-90"
                  >
                    <FaPencilAlt className="text-xs text-white" />
                  </label>
                  <input
                    id={`input_image_picture`}
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

                {/* --- */}

                <button
                  type="submit"
                  className="mb-1 w-full rounded-md border bg-teal-300 p-1"
                >
                  submit
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
