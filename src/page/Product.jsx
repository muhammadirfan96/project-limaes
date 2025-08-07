import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaPencilAlt } from "react-icons/fa";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const Product = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  const [nama, setNama] = useState("");
  const [spesifikasi, setSpesifikasi] = useState("");
  const [harga_jual, setHargaJual] = useState("");
  const [diskon, setDiskon] = useState("");
  const [catatan, setCatatan] = useState("");
  const [photo, setPhoto] = useState(null);

  // view data
  const [barang, setBarang] = useState([]);
  const [allPage, setAllPage] = useState(0);

  const [limit, setLimit] = useState(18);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState("");
  const [search, setSearch] = useState("");
  const [searchBased, setSearchBased] = useState("nama");
  const [order, setOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("harga_jual");

  const showBarang = async (id) => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barang/${id}`,
      );
      setNama(response.data.nama);
      setSpesifikasi(response.data.spesifikasi);
      setHargaJual(response.data.harga_jual);
      setDiskon(response.data.diskon);
      setCatatan(response.data.catatan);
      setPhoto(response.data.photo);
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  const findBarang = async () => {
    try {
      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barangs?order=${order}&sortBy=${sortBy}&limit=${limit}&page=${page}&${key}&status=1`,
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
  //   const [namaModal, setNamaModal] = useState("detail");
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setNama("");
    setSpesifikasi("");
    setHargaJual("");
    setDiskon("");
    setCatatan("");
    setPhoto(null);
  };

  useEffect(() => {
    findBarang();
  }, [limit, page, key, order, sortBy]);

  return token ? (
    <>
      <div className="mt-2 flex flex-wrap justify-evenly gap-2">
        <div className="w-[95%]">
          {/* Judul */}
          <p className="mb-2 rounded bg-teal-300 p-1 text-center shadow">
            katalog
          </p>

          {/* Pagination */}
          <div className="mb-2 flex flex-wrap justify-between">
            {/* Limit */}
            <div className="w-[48%] rounded p-1 shadow shadow-teal-100 lg:w-[24%]">
              <p className="border-b border-teal-300 text-xs">Limit</p>
              <div>
                <input
                  type="button"
                  value="18"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${limit == 18 ? "bg-teal-300" : ""} mx-1 cursor-pointer rounded border border-teal-100 px-2 text-xs`}
                />
                <input
                  type="button"
                  value="12"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${limit == 12 ? "bg-teal-300" : ""} mx-1 cursor-pointer rounded border border-teal-100 px-2 text-xs`}
                />
                <input
                  type="button"
                  value="6"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${limit == 6 ? "bg-teal-300" : ""} mx-1 cursor-pointer rounded border border-teal-100 px-2 text-xs`}
                />
              </div>
            </div>

            {/* Page */}
            <div className="w-[48%] rounded p-1 shadow shadow-teal-100 lg:w-[24%]">
              <p className="mb-1 border-b border-teal-300 text-xs">Page</p>
              <div className="flex overflow-auto">{pageComponents}</div>
            </div>

            {/* Search */}
            <div className="w-[48%] rounded p-1 shadow shadow-teal-100 lg:w-[24%]">
              <p className="border-b border-teal-300 text-xs">
                <select
                  value={searchBased}
                  onChange={(e) => setSearchBased(e.target.value)}
                >
                  <option value="nama">Nama</option>
                  <option value="spesifikasi">Spesifikasi</option>
                  <option value="harga_beli">Harga Beli</option>
                  <option value="harga_jual">Harga Jual</option>
                  <option value="diskon">Diskon</option>
                  <option value="catatan">Catatan</option>
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

            {/* Sort */}
            <div className="w-[48%] rounded p-1 shadow shadow-teal-100 lg:w-[24%]">
              <p className="border-b border-teal-300 text-xs">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="harga_jual">Harga Jual</option>
                  <option value="harga_beli">Harga Beli</option>
                  <option value="diskon">Diskon</option>
                  <option value="_id">id</option>
                </select>
              </p>

              <div>
                <input
                  type="button"
                  value="&darr;"
                  onClick={(e) => setOrder("asc")}
                  className={`${order == "asc" ? "bg-teal-300" : ""} mx-1 cursor-pointer rounded border border-teal-100 px-2 text-xs`}
                />

                <input
                  type="button"
                  value="&uarr;"
                  onClick={(e) => setOrder("desc")}
                  className={`${order == "desc" ? "bg-teal-300" : ""} mx-1 cursor-pointer rounded border border-teal-100 px-2 text-xs`}
                />
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="flex flex-wrap justify-evenly gap-2">
            {barang.map((each) => (
              <div
                key={each._id}
                onClick={() => {
                  showBarang(each._id);
                  openModal();
                }}
                className="w-[48%] cursor-pointer rounded-md border border-teal-300 p-2 shadow-md shadow-teal-100 md:w-[24%] xl:w-[15%]"
              >
                {/* Image */}
                <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={
                      each.photo
                        ? `${import.meta.env.VITE_API_URL}/${each.photo}`
                        : "/default.png"
                    }
                    alt="product"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="mt-2 text-xs">
                  <p className="line-clamp-2 text-sm font-bold text-teal-700">
                    {each.nama}
                  </p>
                  <p className="font-semibold text-gray-800">
                    {each.harga_jual - each.harga_jual * each.diskon}
                  </p>
                  <p className="text-gray-400 line-through">
                    {each.harga_jual}
                  </p>
                  <p className="font-semibold text-teal-700">
                    {each.diskon * 100}%
                  </p>
                  <p className="line-clamp-2 text-gray-600">
                    {each.spesifikasi}
                  </p>
                </div>

                {/* Button */}
                <button
                  onClick={(event) => {
                    // event.stopPropagation();
                    // alert("masukkan ke keranjang");
                    showBarang(each._id);
                    openModal();
                  }}
                  className="mt-2 w-full rounded-md bg-teal-600 py-1 text-xs text-white transition hover:bg-teal-700"
                >
                  detail
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*modal add/update*/}
      {showModal && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            {/* <p className="mb-2 border-b-2 border-teal-700 text-center">
              {namaModal}
            </p> */}
            <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-md bg-gray-100">
              <img
                src={
                  photo
                    ? `${import.meta.env.VITE_API_URL}/${photo}`
                    : "/default.png"
                }
                alt="product"
                className="h-full w-full"
              />
            </div>
            <button
              onClick={closeModal}
              className="absolute -right-1 -top-1 rounded bg-red-700 px-1 text-white"
            >
              x
            </button>
            {/* detail */}
            <div className="mt-1 max-h-[95vh] overflow-auto p-2">
              <div className="mb-1">
                <p className="font-semibold">Nama</p>
                <p>{nama}</p>
              </div>
              <div className="mb-1">
                <p className="font-semibold">Harga Jual</p>
                <p>{harga_jual * (1 - diskon)}</p>
              </div>
              <div className="mb-1">
                <p className="font-semibold">Harga Normal</p>
                <p>{harga_jual}</p>
              </div>
              <div className="mb-1">
                <p className="font-semibold">Diskon</p>
                <p>{diskon * 100}%</p>
              </div>
              <div className="mb-1">
                <p className="font-semibold">Spesifikasi</p>
                <p>{spesifikasi}</p>
              </div>
              <div className="mb-1">
                <p className="font-semibold">Catatan</p>
                <p>{catatan}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="m-4 rounded bg-red-100 p-4 text-center">unauthorized</div>
  );
};

export default Product;
