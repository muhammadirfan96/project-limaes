import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaPencilAlt } from "react-icons/fa";

const Barang = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  // submit
  // const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [spesifikasi, setSpesifikasi] = useState("");
  const [harga_beli, setHargaBeli] = useState("");
  const [harga_jual, setHargaJual] = useState("");
  const [diskon, setDiskon] = useState("");
  const [catatan, setCatatan] = useState("");
  const [status, setStatus] = useState("");
  // const [photo, setPhoto] = useState(null);
  const [errForm, setErrForm] = useState(null);
  const [form, setForm] = useState(null);

  const handleUpdate = async (id) => {
    setForm({ id: id });
    setNamaModal("update barang");
    const oldData = await axiosInterceptors.get(
      `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barang/${id}`,
    );
    openModal();
    // setKode(oldData.data?.kode);
    setNama(oldData.data?.nama);
    setSpesifikasi(oldData.data?.spesifikasi);
    setHargaBeli(oldData.data?.harga_beli);
    setHargaJual(oldData.data?.harga_jual);
    setDiskon(oldData.data?.diskon);
    setCatatan(oldData.data?.catatan);
    setStatus(oldData.data?.status);
    // setPhoto(oldData.data?.photo);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    form ? updateData(form.id) : false;
  };

  const handleDelete = (id) => {
    dispatch(
      setConfirmation({
        message: "The selected data will be permanently deleted?",
        handleOke: () => deleteData(id),
      }),
    );
  };

  const updateData = async (id) => {
    try {
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barang/${id}`,
        {
          // kode,
          nama,
          spesifikasi,
          harga_beli,
          harga_jual,
          diskon,
          catatan,
          status,
        },
      );

      dispatch(
        setNotification({
          message: "selected data has been updated",
          background: "bg-teal-100",
        }),
      );
      closeModal();
      findBarang();
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      setErrForm(arrError);
    }
  };

  const deleteData = async (id) => {
    try {
      await axiosInterceptors.delete(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barang/${id}`,
      );
      dispatch(
        setNotification({
          message: "selected data has been deleted",
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

  // view data
  const [barang, setBarang] = useState([]);
  const [allPage, setAllPage] = useState(0);

  const [limit, setLimit] = useState(4);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState("");
  const [search, setSearch] = useState("");
  const [searchBased, setSearchBased] = useState("nama");

  const findBarang = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barangs?order=desc&limit=${limit}&page=${page}&${key}`,
      );

      const addedItemPromises = response.data.data.map(async (element) => {
        const results = await Promise.allSettled([
          axiosInterceptors.get(`/user/${element.createdBy}`),
          axiosInterceptors.get(`/user/${element.updatedBy}`),
        ]);
        return {
          createdBy:
            results[0].status === "fulfilled"
              ? (results[0].value.data?.email ?? "deleted")
              : "deleted",
          updatedBy:
            results[1].status === "fulfilled"
              ? (results[1].value.data?.email ?? "deleted")
              : "deleted",
        };
      });

      const addedItem = await Promise.all(addedItemPromises);

      const result = response.data.data.map((item, index) => ({
        ...item,
        created_by: addedItem[index].createdBy,
        updated_by: addedItem[index].updatedBy,
      }));

      setBarang(result);
      setAllPage(response.data.all_page);
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  const pageComponents = [];
  for (let i = 1; i <= allPage; i++) {
    pageComponents.push(
      <button
        key={i}
        onClick={() => setPage(i)}
        className={`${
          i == page ? "bg-teal-300" : ""
        } mx-1 rounded border border-teal-100 px-1 text-xs`}
      >
        {i}
      </button>,
    );
  }

  // modal
  const [namaModal, setNamaModal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setErrForm(null);
    // setKode("");
    setNama("");
    setSpesifikasi("");
    setHargaBeli("");
    setHargaJual("");
    setDiskon("");
    setCatatan("");
    setStatus("");
  };

  const uploadPhoto = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barang/${id}/photo`,
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
    findBarang();
  }, [limit, page, key]);

  return token ? (
    <>
      <div className="mt-2 flex flex-wrap justify-evenly gap-2">
        <div className="w-[95%]">
          {/* Judul */}
          <p className="mb-2 rounded bg-teal-300 p-1 text-center shadow">
            Barang
          </p>

          {/* Pagination */}
          <div className="mb-2 flex flex-wrap justify-between">
            {/* Limit */}
            <div className="w-[30%] rounded p-1 shadow shadow-teal-100">
              <p className="border-b border-teal-300 text-xs">Limit</p>
              <div>
                <input
                  type="button"
                  value="4"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${limit == 4 ? "bg-teal-300" : ""} mx-1 rounded border border-teal-100 px-2 text-xs`}
                />
                <input
                  type="button"
                  value="6"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${limit == 6 ? "bg-teal-300" : ""} mx-1 rounded border border-teal-100 px-2 text-xs`}
                />
                <input
                  type="button"
                  value="8"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${limit == 8 ? "bg-teal-300" : ""} mx-1 rounded border border-teal-100 px-2 text-xs`}
                />
              </div>
            </div>

            {/* Page */}
            <div className="w-[30%] rounded p-1 shadow shadow-teal-100">
              <p className="mb-1 border-b border-teal-300 text-xs">Page</p>
              <div className="flex overflow-auto">{pageComponents}</div>
            </div>

            {/* Search */}
            <div className="w-[30%] rounded p-1 shadow shadow-teal-100">
              <p className="border-b border-teal-300 text-xs">
                <select
                  value={searchBased}
                  onChange={(e) => setSearchBased(e.target.value)}
                >
                  <option value="nama">Nama</option>
                  <option value="kode">Kode</option>
                  <option value="spesifikasi">Spesifikasi</option>
                  <option value="harga_beli">Harga Beli</option>
                  <option value="harga_jual">Harga Jual</option>
                  <option value="diskon">Diskon</option>
                  <option value="catatan">Catatan</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setKey(`${searchBased}=${search}`)}
                  className="ml-1 rounded bg-green-700 p-1 text-xs italic text-white"
                >
                  <HiMiniMagnifyingGlass />
                </button>
              </p>
              <div className="overflow-auto">
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="..."
                  className="rounded border border-teal-100"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-auto rounded-md p-2 shadow-md shadow-teal-100">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-teal-700 bg-teal-300">
                  <th className="px-2">Foto</th>
                  <th className="px-2">Kode</th>
                  <th className="px-2">Nama</th>
                  <th className="px-2">Spesifikasi</th>
                  <th className="px-2">Harga Beli</th>
                  <th className="px-2">Harga Jual</th>
                  <th className="px-2">Diskon</th>
                  <th className="px-2">Catatan</th>
                  <th className="px-2">Status</th>
                  <th className="px-2">Created By</th>
                  <th className="px-2">Updated By</th>
                  <th className="px-2">Created At</th>
                  <th className="px-2">Updated At</th>
                  <th className="px-2">action</th>
                </tr>
              </thead>
              <tbody>
                {barang.map((each) => (
                  <tr key={each._id} className="border-b border-teal-300">
                    <td>
                      <div className="relative inline-block">
                        <img
                          src={
                            each.photo
                              ? `${import.meta.env.VITE_API_URL}/${each.photo}`
                              : "/default.png"
                          }
                          alt="User Photo"
                          className="h-12 w-12 rounded-full border border-teal-300 object-cover"
                        />
                        <label
                          htmlFor={`input_image${each._id}`}
                          className="absolute bottom-0 right-0 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-teal-500 p-1 shadow-md transition-all hover:bg-teal-600 active:scale-90"
                        >
                          <FaPencilAlt className="text-xs text-white" />
                        </label>
                        <input
                          id={`input_image${each._id}`}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          // onChange={(e) => {
                          //   setPhoto(e.target.files[0]);
                          //   uploadPhoto(each._id);
                          // }}
                          onChange={(e) => {
                            if (e.target.files.length > 0) {
                              uploadPhoto(each._id, e.target.files[0]); // Kirim file langsung
                            }
                          }}
                        />
                      </div>
                    </td>

                    <td className="px-2">{each.kode}</td>
                    <td className="px-2">{each.nama}</td>
                    <td className="px-2">{each.spesifikasi}</td>
                    <td className="px-2">{each.harga_beli}</td>
                    <td className="px-2">{each.harga_jual}</td>
                    <td className="px-2">{each.diskon}</td>
                    <td className="px-2">{each.catatan}</td>
                    <td className="px-2">{each.status}</td>
                    <td className="px-2">{each.created_by}</td>
                    <td className="px-2">{each.updated_by}</td>
                    <td className="px-2">{each.createdAt}</td>
                    <td className="px-2">{each.updatedAt}</td>
                    <td className="px-2">
                      <button
                        onClick={() => handleUpdate(each._id)}
                        className="w-full rounded bg-green-700 p-1 text-xs italic text-white"
                      >
                        update
                      </button>
                      <button
                        onClick={() => handleDelete(each._id)}
                        className="w-full rounded bg-red-700 p-1 text-xs italic text-white"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/*modal add/update*/}
      {showModal && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b-2 border-teal-700 text-center">
              {namaModal}
            </p>
            <button
              onClick={closeModal}
              className="absolute -right-1 -top-1 rounded bg-red-700 px-1 text-white"
            >
              x
            </button>
            <div className="mt-1 max-h-[95vh] overflow-auto p-2">
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
                  placeholder="nama"
                  className="mb-1 w-full rounded-md border p-1"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="spesifikasi"
                  className="mb-1 w-full rounded-md border p-1"
                  value={spesifikasi}
                  onChange={(e) => setSpesifikasi(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="harga_beli"
                  className="mb-1 w-full rounded-md border p-1"
                  value={harga_beli}
                  onChange={(e) => setHargaBeli(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="harga_jual"
                  className="mb-1 w-full rounded-md border p-1"
                  value={harga_jual}
                  onChange={(e) => setHargaJual(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="diskon"
                  className="mb-1 w-full rounded-md border p-1"
                  value={diskon}
                  onChange={(e) => setDiskon(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="catatan"
                  className="mb-1 w-full rounded-md border p-1"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="status"
                  className="mb-1 w-full rounded-md border p-1"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
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
  ) : (
    <div className="m-4 rounded bg-red-100 p-4 text-center">unauthorized</div>
  );
};

export default Barang;
