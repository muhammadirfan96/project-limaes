import React from "react";
import { IoReceiptOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";

const PembelianBarang = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const axiosInterceptors = axiosRT(token, expire, dispatch);

  // submit
  const [errForm, setErrForm] = useState(null);
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [tanggal_beli, setTanggal_beli] = useState("");
  const [penjual_id, setPenjual_id] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/pembelian-barang`,
        {
          kode,
          nama,
          tanggal_beli,
          penjual_id,
        },
      );

      dispatch(
        setNotification({
          message: "transaksi pembelian berhasil",
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
    setKode("");
    setNama("");
    setTanggal_beli("");
    setPenjual_id("");
  };

  // PENJUAL_ID
  // option select
  const [penjual, setPenjual] = useState([]);
  const [keyPenjual, setKeyPenjual] = useState("");

  const findPenjual = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/penjuals?nama=${keyPenjual}`,
      );
      setPenjual(response.data.data);
    } catch (error) {
      const arrError = error.response.data.error.split(",");
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  useEffect(() => {
    findPenjual();
  }, [keyPenjual]);

  // input
  const [inputPenjual, setInputPenjual] = useState(true);
  const [namaPenjual, setNamaPenjual] = useState("");

  const handleChangeOptionSelectPenjual = (event) => {
    const selected = event.target[event.target.selectedIndex];
    setPenjual_id(selected.value);
    setInputPenjual(true);
    setNamaPenjual(selected.getAttribute("data-additional-info"));
  };

  return (
    <>
      <button
        onClick={openModal}
        className="m-2 aspect-video w-[95%] rounded bg-teal-700 p-2 shadow md:w-[45%]"
      >
        <p className="border-b border-white text-center text-white">
          pembelian barang
        </p>
        <IoReceiptOutline className="mx-auto h-36 w-36 text-white" />
      </button>

      {/*modal*/}
      {showModal && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b-2 border-teal-700 text-center">
              pembelian barang
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
                <input
                  type="text"
                  placeholder="kode"
                  className="mb-1 w-full rounded-md border p-1"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="nama"
                  className="mb-1 w-full rounded-md border p-1"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
                <input
                  type="datetime-local"
                  placeholder="tanggal_beli"
                  className="mb-1 w-full rounded-md border p-1"
                  value={tanggal_beli}
                  onChange={(e) => setTanggal_beli(e.target.value)}
                />
                {inputPenjual ? (
                  <button
                    type="button"
                    className="mb-1 w-full rounded-md border p-1 text-start"
                    onClick={() => setInputPenjual(false)}
                  >
                    {namaPenjual ? (
                      namaPenjual
                    ) : (
                      <span className="text-slate-400">penjual...</span>
                    )}
                  </button>
                ) : (
                  <div className="flex justify-between">
                    <select
                      value={penjual_id}
                      onChange={handleChangeOptionSelectPenjual}
                      className="mb-1 w-[50%] rounded-md rounded-r-none border p-1"
                    >
                      <option value="">list penjual...</option>
                      {penjual.map((each) => (
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
                      placeholder="search_penjual"
                      className="mb-1 w-[50%] rounded-md rounded-l-none border p-1"
                      value={keyPenjual}
                      onChange={(e) => setKeyPenjual(e.target.value)}
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

export default PembelianBarang;
