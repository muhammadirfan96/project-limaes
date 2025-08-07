import React from "react";
import { IoIosPaperPlane } from "react-icons/io";
import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";

const PenjualanBarang = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const axiosInterceptors = axiosRT(token, expire, dispatch);

  // submit
  const [errForm, setErrForm] = useState(null);
  const [barang_id, setBarang_id] = useState("");
  const [tanggal_jual, setTanggal_jual] = useState("");
  const [pembeli_id, setPembeli_id] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/penjualan-barang/${barang_id}`,
        {
          tanggal_jual,
          pembeli_id,
        },
      );

      dispatch(
        setNotification({
          message: "transaksi penjualan berhasil",
          background: "bg-teal-100",
        }),
      );
      closeModal();
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      setErrForm(arrError);
    }
  };

  // modal
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setErrForm(null);
    setTanggal_jual("");
    setPembeli_id("");
  };

  // PEMBELI_ID
  // option select
  const [pembeli, setPembeli] = useState([]);
  const [keyPembeli, setKeyPembeli] = useState("");

  const findPembeli = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/pembelis?nama=${keyPembeli}`,
      );
      setPembeli(response.data.data);
    } catch (error) {
      const arrError = error.response.data.error.split(",");
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  useEffect(() => {
    findPembeli();
  }, [keyPembeli]);

  // input
  const [inputPembeli, setInputPembeli] = useState(true);
  const [namaPembeli, setNamaPembeli] = useState("");

  const handleChangeOptionSelectPembeli = (event) => {
    const selected = event.target[event.target.selectedIndex];
    setPembeli_id(selected.value);
    setInputPembeli(true);
    setNamaPembeli(selected.getAttribute("data-additional-info"));
  };

  // BARANG_ID
  // option select
  const [barang, setBarang] = useState([]);
  const [keyBarang, setKeyBarang] = useState("");

  const findBarang = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barangs?nama=${keyBarang}`,
      );
      setBarang(response.data.data);
    } catch (error) {
      const arrError = error.response.data.error.split(",");
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  useEffect(() => {
    findBarang();
  }, [keyBarang]);

  // input
  const [inputBarang, setInputBarang] = useState(true);
  const [namaBarang, setNamaBarang] = useState("");

  const handleChangeOptionSelectBarang = (event) => {
    const selected = event.target[event.target.selectedIndex];
    setBarang_id(selected.value);
    setInputBarang(true);
    setNamaBarang(selected.getAttribute("data-additional-info"));
  };

  return (
    <>
      <button
        onClick={openModal}
        className="m-2 aspect-video w-[95%] rounded bg-teal-700 p-2 shadow md:w-[45%]"
      >
        <p className="border-b border-white text-center text-white">
          penjualan barang
        </p>
        <IoIosPaperPlane className="mx-auto h-36 w-36 text-white" />
      </button>

      {/*modal*/}
      {showModal && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b-2 border-teal-700 text-center">
              penjualan barang
            </p>
            <button
              onClick={closeModal}
              className="absolute -right-1 -top-1 rounded bg-red-700 px-1 text-white"
            >
              x
            </button>
            <div className="mt-1 max-h-96 overflow-auto p-2 md:max-h-72">
              {errForm && (
                <div className="mb-2 rounded border border-red-700 p-1 text-xs italic text-red-700">
                  {errForm.map((err, index) => (
                    <p key={index}>{err}</p>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {inputBarang ? (
                  <button
                    type="button"
                    className="mb-1 w-full rounded-md border p-1 text-start"
                    onClick={() => setInputBarang(false)}
                  >
                    {namaBarang ? (
                      namaBarang
                    ) : (
                      <span className="text-slate-400">barang...</span>
                    )}
                  </button>
                ) : (
                  <div className="flex justify-between">
                    <select
                      value={barang_id}
                      onChange={handleChangeOptionSelectBarang}
                      className="mb-1 w-[50%] rounded-md rounded-r-none border p-1"
                    >
                      <option value="">list barang...</option>
                      {barang.map((each) => (
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
                      placeholder="search_barang"
                      className="mb-1 w-[50%] rounded-md rounded-l-none border p-1"
                      value={keyBarang}
                      onChange={(e) => setKeyBarang(e.target.value)}
                    />
                  </div>
                )}
                <input
                  type="datetime-local"
                  placeholder="tanggal_jual"
                  className="mb-1 w-full rounded-md border p-1"
                  value={tanggal_jual}
                  onChange={(e) => setTanggal_jual(e.target.value)}
                />
                {inputPembeli ? (
                  <button
                    type="button"
                    className="mb-1 w-full rounded-md border p-1 text-start"
                    onClick={() => setInputPembeli(false)}
                  >
                    {namaPembeli ? (
                      namaPembeli
                    ) : (
                      <span className="text-slate-400">pembeli...</span>
                    )}
                  </button>
                ) : (
                  <div className="flex justify-between">
                    <select
                      value={pembeli_id}
                      onChange={handleChangeOptionSelectPembeli}
                      className="mb-1 w-[50%] rounded-md rounded-r-none border p-1"
                    >
                      <option value="">list pembeli...</option>
                      {pembeli.map((each) => (
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
                      placeholder="search_pembeli"
                      className="mb-1 w-[50%] rounded-md rounded-l-none border p-1"
                      value={keyPembeli}
                      onChange={(e) => setKeyPembeli(e.target.value)}
                    />
                  </div>
                )}
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
      )}
    </>
  );
};

export default PenjualanBarang;
