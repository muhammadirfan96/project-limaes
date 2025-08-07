import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";

const TransaksiPembelian = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  // view data
  const [transaksiPembelian, setTransaksiPembelian] = useState([]);
  const [allPage, setAllPage] = useState(0);

  const [limit, setLimit] = useState(4);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState("");
  const [search, setSearch] = useState("");
  const [searchBased, setSearchBased] = useState("tanggal_beli");

  const findTransaksiPembelian = async () => {
    try {
      const response = await axiosInterceptors.get(
        `${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/transaksi-pembelians?order=desc&limit=${limit}&page=${page}&${key}`,
      );

      const addedItemPromises = response.data.data.map(async (element) => {
        const results = await Promise.allSettled([
          axiosInterceptors.get(
            `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/barang/${element.barang_id}`,
          ),
          axiosInterceptors.get(
            `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/penjual/${element.penjual_id}`,
          ),
          axiosInterceptors.get(`/user/${element.createdBy}`),
          axiosInterceptors.get(`/user/${element.updatedBy}`),
        ]);

        return {
          nama:
            results[0].status === "fulfilled"
              ? (results[0].value.data?.nama ?? "deleted")
              : "deleted",
          penjual:
            results[1].status === "fulfilled"
              ? (results[1].value.data?.nama ?? "deleted")
              : "deleted",
          createdBy:
            results[2].status === "fulfilled"
              ? (results[2].value.data?.email ?? "deleted")
              : "deleted",
          updatedBy:
            results[3].status === "fulfilled"
              ? (results[3].value.data?.email ?? "deleted")
              : "deleted",
        };
      });

      const addedItem = await Promise.all(addedItemPromises);

      const result = response.data.data.map((item, index) => ({
        ...item,
        nama: addedItem[index].nama,
        penjual: addedItem[index].penjual,
        created_by: addedItem[index].createdBy,
        updated_by: addedItem[index].updatedBy,
      }));

      setTransaksiPembelian(result);
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

  useEffect(() => {
    findTransaksiPembelian();
  }, [limit, page, key]);

  return token ? (
    <>
      <div className="mt-2 flex flex-wrap justify-evenly gap-2">
        <div className="w-[95%]">
          {/*judul*/}
          <p className="mb-2 rounded bg-teal-300 p-1 text-center shadow">
            transaksi pembelian
          </p>

          {/*pagination*/}
          <div className="mb-2 flex flex-wrap justify-between">
            <div className="w-[30%] rounded p-1 shadow shadow-teal-100">
              <p className="border-b border-teal-300 text-xs">limit</p>
              <div>
                <input
                  type="button"
                  value="4"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${
                    limit == 4 ? "bg-teal-300" : ""
                  } mx-1 rounded border border-teal-100 px-2 text-xs`}
                />
                <input
                  type="button"
                  value="6"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${
                    limit == 6 ? "bg-teal-300" : ""
                  } mx-1 rounded border border-teal-100 px-2 text-xs`}
                />
                <input
                  type="button"
                  value="8"
                  onClick={(e) => setLimit(e.target.value)}
                  className={`${
                    limit == 8 ? "bg-teal-300" : ""
                  } mx-1 rounded border border-teal-100 px-2 text-xs`}
                />
              </div>
            </div>
            <div className="w-[30%] rounded p-1 shadow shadow-teal-100">
              <p className="mb-1 border-b border-teal-300 text-xs">page</p>
              <div className="flex overflow-auto">{pageComponents}</div>
            </div>
            <div className="w-[30%] rounded p-1 shadow shadow-teal-100">
              <p className="border-b border-teal-300 text-xs">
                <select
                  value={searchBased}
                  onChange={(e) => setSearchBased(e.target.value)}
                >
                  <option value={"tanggal_beli"}>tanggal_beli</option>
                  <option value="penjual_id">penjual</option>
                  <option value="barang_id">barang</option>
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

          {/*tabel*/}
          <div className="w-full overflow-auto rounded-md p-2 shadow-md shadow-teal-100">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-teal-700 bg-teal-300">
                  <th className="px-2">nama</th>
                  <th className="px-2">tanggal_beli</th>
                  <th className="px-2">penjual</th>
                  <th className="px-2">created_by</th>
                  <th className="px-2">updated_by</th>
                  <th className="px-2">created_at</th>
                  <th className="px-2">updated_at</th>
                </tr>
              </thead>
              <tbody>
                {transaksiPembelian.map((each) => (
                  <tr key={each._id} className="border-b border-teal-300">
                    <td className="px-2">{each.nama}</td>
                    <td className="px-2">{each.tanggal_beli}</td>
                    <td className="px-2">{each.penjual}</td>
                    <td className="px-2">{each.created_by}</td>
                    <td className="px-2">{each.updated_by}</td>
                    <td className="px-2">{each.createdAt}</td>
                    <td className="px-2">{each.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="m-4 rounded bg-red-100 p-4 text-center">unauthorized</div>
  );
};

export default TransaksiPembelian;
