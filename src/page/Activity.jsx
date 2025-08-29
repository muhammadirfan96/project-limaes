import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import RegisterUserLimaes from "../components/RegisterUserLimaes.jsx";

const Activity = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const username = useSelector((state) => state.jwToken.username);
  const role = useSelector((state) => state.jwToken.role);
  const uid = useSelector((state) => state.jwToken.uid);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  // submit
  const [pelaksana, setPelaksana] = useState("");
  const [status, setStatus] = useState(1);
  const [evidence, setEvidence] = useState([]);
  const [penilaian, setPenilaian] = useState([]);

  const [errForm, setErrForm] = useState(null);
  const [form, setForm] = useState(null);

  const handleAdd = () => {
    setForm(null);
    setModalName("add");
    openModal();
  };

  const handleUpdate = async (id) => {
    setForm({ id: id });
    setModalName("update");
    const oldData = await axiosInterceptors.get(
      `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
    );
    openModal();
    setPelaksana(oldData.data?.pelaksana);
    setStatus(oldData.data?.status);
    setEvidence(oldData.data?.evidence);
    setPenilaian(oldData.data?.penilaian);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    form ? updateData(form.id) : addData();
  };

  // const handleDelete = (id) => {
  //   dispatch(
  //     setConfirmation({
  //       message: "The selected data will be permanently deleted?",
  //       handleOke: () => deleteData(id),
  //     }),
  //   );
  // };

  const handleDetails = (id) => {
    console.log({ id });
  };

  const addData = async () => {
    try {
      await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes`,
        { pelaksana, status, evidence, penilaian },
      );
      dispatch(
        setNotification({
          message: "new data has been added",
          background: "bg-teal-100",
        }),
      );
      closeModal();
      findData();
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      setErrForm(arrError);
    }
  };

  const updateData = async (id) => {
    try {
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
        {
          pelaksana,
          status,
          evidence,
          penilaian,
        },
      );

      dispatch(
        setNotification({
          message: "selected data has been updated",
          background: "bg-teal-100",
        }),
      );
      closeModal();
      findData();
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      setErrForm(arrError);
    }
  };

  // const deleteData = async (id) => {
  //   try {
  //     await axiosInterceptors.delete(
  //       `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
  //     );
  //     dispatch(
  //       setNotification({
  //         message: "selected data has been deleted",
  //         background: "bg-teal-100",
  //       }),
  //     );
  //     findData();
  //   } catch (e) {
  //     const arrError = e.response.data.error.split(",");
  //     dispatch(
  //       setNotification({ message: arrError, background: "bg-red-100" }),
  //     );
  //   }
  // };

  // view data
  const [data, setData] = useState([]);
  const [allPage, setAllPage] = useState(0);

  const [limit, setLimit] = useState(8);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState("");
  const [search, setSearch] = useState("");
  const [searchBased, setSearchBased] = useState("fullname");

  const findData = async () => {
    try {
      // cari data userlimaes
      const user_limaes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes?user_id=${uid}`,
      );

      const pelaksanaArray = [
        user_limaes.data.data[0]._id,
        user_limaes.data.data[0]._id,
      ];

      const pelaksanaQuery = pelaksanaArray
        .map((p) => `pelaksana=${encodeURIComponent(p)}`)
        .join("&");

      const response = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes?order=desc&limit=${limit}&page=${page}&${key}`,
      );

      const result = await Promise.all(
        response.data.data.map(async (element) => {
          const [equipmentRes, bagianRes, usersRes] = await Promise.allSettled([
            axiosInterceptors.get(
              `/equipment-limaes/${element.equipmentlimaes_id}`,
            ),
            axiosInterceptors.get(`/bagian-limaes/${element.bagianlimaes_id}`),
            Promise.allSettled(
              element.pelaksana.map((userlimaes_id) =>
                axiosInterceptors.get(`/user-limaes/${userlimaes_id}`),
              ),
            ),
          ]);

          return {
            ...element,
            equipment:
              equipmentRes.status === "fulfilled"
                ? (equipmentRes.value.data?.nama ?? "deleted")
                : "deleted",
            area:
              equipmentRes.status === "fulfilled"
                ? (equipmentRes.value.data?.area ?? "deleted")
                : "deleted",
            bagian:
              bagianRes.status === "fulfilled"
                ? (bagianRes.value.data?.nama ?? "deleted")
                : "deleted",
            pelaksana:
              usersRes.status === "fulfilled"
                ? usersRes.value
                    .filter((res) => res.status === "fulfilled")
                    .map((res) => res.value.data?.fullname)
                    .filter(Boolean)
                    .join(", ")
                : "deleted",
          };
        }),
      );

      console.log({ result });

      setData(result);
      setAllPage(response.data.all_page);
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      dispatch(
        setNotification({ message: arrError[0], background: "bg-red-100" }),
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

  // modal add / update
  const [namaModal, setModalName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setErrForm(null);
    setForm(null);
    setModalName("");
    setPelaksana([]);
    setStatus(1);
    setEvidence([]);
    setPenilaian([]);
  };

  // modal details
  const [showDetails, setShowDetails] = useState(false);
  const openDetails = () => setShowDetails(true);
  const closeDetails = () => {
    setShowDetails(false);
  };

  useEffect(() => {
    findData();
  }, [limit, page, key]);

  return token ? (
    <>
      <RegisterUserLimaes />
      <div className="mt-2 flex flex-wrap justify-evenly gap-2">
        <div className="w-[95%]">
          {/*judul*/}
          <p className="mb-2 rounded bg-teal-300 p-1 text-center shadow">
            activity
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
                  <option value={"tanggal"}>tanggal</option>
                  <option value={"status"}>status</option>
                  <option value={"equipmentlimaes_id"}>equipmentlimaes</option>
                  <option value={"bagianlimaes_id"}>bagianlimaes</option>
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
          {/*btn add*/}
          <button
            onClick={handleAdd}
            className="mb-2 w-full rounded-md border bg-teal-300 p-1 text-xs"
          >
            add data
          </button>

          {/*tabel*/}
          {data == [] ? (
            <div className="w-full overflow-auto rounded-md p-2 shadow-md shadow-teal-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-teal-700 bg-teal-300">
                    <th className="px-2">tanggal</th>
                    <th className="px-2">equipment</th>
                    <th className="px-2">area</th>
                    <th className="px-2">bagian</th>
                    <th className="px-2">pelaksana</th>
                    <th className="px-2">status</th>
                    <th className="px-2">evidence</th>
                    <th className="px-2">action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((each) => (
                    <tr key={each._id} className="border-b border-teal-300">
                      <td className="px-2">{each.tanggal}</td>
                      <td className="px-2">{each.equipment}</td>
                      <td className="px-2">{each.area}</td>
                      <td className="px-2">{each.bagian}</td>
                      <td className="px-2">{each.pelaksana}</td>
                      <td className="px-2">{each.status}</td>
                      <td className="px-2">
                        {each.evidence.map((path) => {
                          /*gambar*/
                          <div className="m-1">
                            <img
                              src={
                                path
                                  ? `${import.meta.env.VITE_API_URL}/${path}`
                                  : "/default.png"
                              }
                              alt="evidence"
                              className="h-16 w-16 rounded-full border border-teal-300 object-cover"
                            />
                          </div>;
                        })}
                      </td>
                      <td className="px-2">
                        <button
                          onClick={() => handleUpdate(each._id)}
                          className="w-full rounded bg-green-700 p-1 text-xs italic text-white"
                        >
                          update
                        </button>
                        <button
                          onClick={() => handleDetails(each._id)}
                          className="w-full rounded bg-red-700 p-1 text-xs italic text-white"
                        >
                          details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="m-4 rounded bg-red-100 p-4 text-center">
              data not found
            </div>
          )}
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
                {/*data yang akan di input*/}

                {/*pelaksana, input type checkbox*/}

                {/*evidence sebelum, input type checkbox*/}
                <div className="relative inline-block">
                  <img
                    src={
                      each.photo
                        ? `${import.meta.env.VITE_API_URL}/${each.photo}`
                        : "/default.png"
                    }
                    alt="User Photo"
                    className="h-16 w-16 rounded-full border border-teal-300 object-cover"
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
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        uploadPhoto(each._id, e.target.files[0]);
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
      )}

      {/*modal details*/}
      {showDetails && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b-2 border-teal-700 text-center">
              details
            </p>
            <button
              onClick={closeDetails}
              className="absolute -right-1 -top-1 rounded bg-red-700 px-1 text-white"
            >
              x
            </button>
            <div className="mt-1 max-h-[95vh] overflow-auto p-2">
              {/* Display details here */}
              detailnya di sini
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="m-4 rounded bg-red-100 p-4 text-center">unauthorized</div>
  );
};

export default Activity;
