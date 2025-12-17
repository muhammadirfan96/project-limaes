import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaPencilAlt, FaTrash, FaPrint } from "react-icons/fa";

const Activity = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const username = useSelector((state) => state.jwToken.username);
  const role = useSelector((state) => state.jwToken.role);
  const uid = useSelector((state) => state.jwToken.uid);
  const userlimaes = useSelector((state) => state.userLimaes.data);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  // form states
  const [tanggal, setTanggal] = useState("");
  const [lokasilimaes_id, setLokasilimaes_id] = useState("");
  const [pelaksana, setPelaksana] = useState([userlimaes?._id]);
  const [status, setStatus] = useState("");
  const [penilaian, setPenilaian] = useState([]);
  const [errForm, setErrForm] = useState(null);
  const [form_id, setForm_id] = useState(null);

  // modal states
  const [namaModal, setModalName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setErrForm(null);
    setForm_id(null);
    setModalName("");
    setTanggal("");
    setLokasilimaes_id("");
    setPelaksana([userlimaes._id]);
    setStatus(1);
    setPenilaian([]);
  };

  // data states
  const [data, setData] = useState([]);
  const [allPage, setAllPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchBased, setSearchBased] = useState("tanggal");
  const [key, setKey] = useState({ searchBased: search });

  // handle update
  const handleUpdate = async (id) => {
    try {
      setForm_id({ id });
      const oldData = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
      );
      const d = oldData.data;
      setModalName("input pelaksana");
      openModal();
      setTanggal(d.tanggal);
      setLokasilimaes_id(d.lokasilimaes_id);
      !d.pelaksana.includes(userlimaes._id)
        ? setPelaksana([...d.pelaksana, userlimaes._id])
        : setPelaksana(d.pelaksana);
      setStatus(1);
      setPenilaian(d.penilaian);
    } catch (e) {
      const msg = e?.response?.data?.error ?? "Failed to fetch data";
      dispatch(setNotification({ message: msg, background: "bg-red-100" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData(form_id.id);
  };

  const updateData = async (id) => {
    try {
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
        {
          tanggal,
          lokasilimaes_id,
          pelaksana,
          status,
          penilaian,
        },
      );
      dispatch(
        setNotification({ message: "Data updated", background: "bg-teal-100" }),
      );
      closeModal();
      findData();
      // findDataStatus0();
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      setErrForm(arrError);
    }
  };

  // handle delete
  const handleDelete = (id) => {
    dispatch(
      setConfirmation({
        message: "The selected data will be permanently deleted?",
        handleOke: () => deleteData(id),
      }),
    );
  };

  const deleteData = async (id) => {
    try {
      await axiosInterceptors.delete(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
      );
      dispatch(
        setNotification({ message: "Data deleted", background: "bg-teal-100" }),
      );
      findData();
    } catch (e) {
      const msg = e?.response?.data?.error ?? "Failed to delete data";
      dispatch(setNotification({ message: msg, background: "bg-red-100" }));
    }
  };

  // get data
  const findData = async () => {
    try {
      let pelaksana = [];

      // role admin → semua pelaksana
      if (role === "admin") {
        pelaksana = [];
      }

      // role user → hanya user bersangkutan (duplikasi sesuai kebutuhan API)
      if (role === "user") {
        pelaksana = [userlimaes._id];
      }

      // role admin-unit → hanya pelaksana dari unit yang sama
      if (role.includes("admin-")) {
        const unit = role.split("-")[1];

        // dapatkan bagianlimaes berdasarkan unit
        const bagianlimaesRes = await axiosInterceptors.get(
          `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes?unit=${unit}&limit=10000`,
        );

        if (bagianlimaesRes.data.data.length === 0) {
          setData([]);
          setDataStatus0([]);
          setAllPage(0);
          return;
        }

        // ambil semua user-limaes berdasarkan tiap bagianlimaes_id
        const userlimaesRes = await Promise.all(
          bagianlimaesRes.data.data.map(async (each) => {
            try {
              const result = await axiosInterceptors.get(
                `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes?bagianlimaes_id=${each._id}`,
              );
              return result.data.data || [];
            } catch (error) {
              console.error(error);
              return [];
            }
          }),
        );

        // gabungkan semua hasil jadi satu array flat
        const allUserLimaes = userlimaesRes.flat();

        // ambil id unik
        const userlimaesRes_id = [
          ...new Set(allUserLimaes.map((ul) => ul._id)),
        ];

        pelaksana = userlimaesRes_id;
      }

      // ambil schedule
      const filter = {
        order: "desc",
        limit,
        page,
        key,
        pelaksana,
        sortBy: "tanggal",
        status: ["1", "2"],
      };

      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes`,
        filter,
      );

      const result = await Promise.all(
        scheduleRes.data.data.map(async (item) => {
          const [usersRes, lokasiResArr] = await Promise.allSettled([
            // ambil semua pelaksana
            Promise.allSettled(
              item.pelaksana.map((id) =>
                axiosInterceptors.get(
                  `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/user-limaes/${id}`,
                ),
              ),
            ),
            // ambil semua lokasi (karena lokasilimaes_id adalah array)
            Promise.allSettled(
              item.lokasilimaes_id.map((id) =>
                axiosInterceptors.get(
                  `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/lokasi-limaes/${id}`,
                ),
              ),
            ),
          ]);

          // helper untuk ambil fullname pelaksana
          const extractUsers = () => {
            if (usersRes.status !== "fulfilled") return "deleted";
            return (
              usersRes.value
                .filter((u) => u.status === "fulfilled")
                .map((u) => u.value.data?.fullname)
                .filter(Boolean)
                .join(", ") || "deleted"
            );
          };

          // helper untuk ambil field dari semua lokasi
          const extractLokasiField = (resArr, key) =>
            resArr
              .filter((r) => r.status === "fulfilled")
              .map((r) => r.value.data?.[key] ?? "deleted")
              .join(", ") || "deleted";

          return {
            ...item,
            unit:
              lokasiResArr.status === "fulfilled"
                ? extractLokasiField(lokasiResArr.value, "unit")
                : "deleted",
            area:
              lokasiResArr.status === "fulfilled"
                ? extractLokasiField(lokasiResArr.value, "area")
                : "deleted",
            equipment:
              lokasiResArr.status === "fulfilled"
                ? extractLokasiField(lokasiResArr.value, "equipment")
                : "deleted",
            pelaksana: extractUsers(),
          };
        }),
      );

      setData(result);
      setAllPage(scheduleRes.data.all_page);
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.error ?? e.message;
      dispatch(setNotification({ message: msg, background: "bg-red-100" }));
    }
  };

  useEffect(() => {
    userlimaes && userlimaes._id && findData();
  }, [token, userlimaes, limit, page, key]);

  const pageComponents = [];
  for (let i = 1; i <= allPage; i++) {
    const isActive = i === page;
    pageComponents.push(
      <button
        key={i}
        onClick={() => setPage(i)}
        className={`mx-1 rounded border px-3 py-1 text-xs font-medium transition-all duration-200 ${
          isActive
            ? "border-teal-600 bg-teal-600 text-white shadow-sm"
            : "border-teal-300 bg-white text-teal-700 hover:bg-teal-100"
        }`}
      >
        {i}
      </button>,
    );
  }

  // data with status 0
  const [dataStatus0, setDataStatus0] = useState([]);

  const findDataStatus0 = async () => {
    if (!token || !userlimaes || !userlimaes.bagianlimaes_id) return;

    try {
      let lokasilimaes_id = [];
      let unit = "";
      let area = "";

      // role admin → semua lokasi
      if (role === "admin") {
        unit = "";
        area = "";
        lokasilimaes_id = [];
      }

      // role user → ambil unit & area dari bagian user
      if (role === "user") {
        const bagianRes = await axiosInterceptors.get(
          `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes/${userlimaes.bagianlimaes_id}`,
        );
        unit = bagianRes.data.unit;
        area = bagianRes.data.area;
      }

      // role admin-unit → ambil unit dari role
      if (role.includes("admin-")) {
        unit = role.split("-")[1];
        area = "";
      }

      // ambil lokasi berdasarkan unit + area
      const lokasiRes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/lokasi-limaes?unit=${unit}&area=${area}&limit=10000`,
      );

      const lokasilimaes_ids = [
        ...new Set(lokasiRes.data.data.map((ll) => ll._id)),
      ];

      if (role === "user" || role.includes("admin-")) {
        lokasilimaes_id = lokasilimaes_ids;
      }

      // ambil schedule sesuai lokasi
      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes`,
        {
          sortBy: "tanggal",
          limit: 10,
          lokasilimaes_id,
          status: ["0"],
        },
      );

      // console.log({ scheduleRes });

      // filter: hanya tampilkan schedule dengan tanggal <= hari ini
      const filteredSchedules = scheduleRes.data.data.filter((sch) => {
        const schDate = new Date(sch.tanggal);
        const today = new Date();
        return schDate <= today;
      });

      // merge dengan data lokasi (handle array lokasilimaes_id)
      const mergedData = await Promise.all(
        filteredSchedules.map(async (item) => {
          try {
            const lokasiResArr = await Promise.allSettled(
              item.lokasilimaes_id.map((id) =>
                axiosInterceptors.get(
                  `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/lokasi-limaes/${id}`,
                ),
              ),
            );

            // helper untuk ambil field dari semua lokasi
            const extractLokasiField = (resArr, key) =>
              resArr
                .filter((r) => r.status === "fulfilled")
                .map((r) => r.value.data?.[key] ?? "deleted")
                .join(", ") || "deleted";

            return {
              ...item,
              unit: extractLokasiField(lokasiResArr, "unit"),
              area: extractLokasiField(lokasiResArr, "area"),
              equipment: extractLokasiField(lokasiResArr, "equipment"),
            };
          } catch {
            return { ...item };
          }
        }),
      );

      setDataStatus0(mergedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    findDataStatus0();
  }, [token, userlimaes]);

  // const listPelaksana = ["Andi", "Budi", "Citra", "Dewi"];
  const [listPelaksana, setListPelaksana] = useState([]);
  const [searchListPelaksana, setSearchListPelaksana] = useState("");
  const [searchBasedListPelaksana, setSearchBasedListPelaksana] =
    useState("fullname");
  const [keyListPelaksana, setKeyListPelaksana] = useState("");

  const fetchListPelaksana = async () => {
    const keyPelaksana = keyListPelaksana && `&${keyListPelaksana}`;
    try {
      // fetch all userlimaes where bagianlimaes_id = userlimaes.bagianlimaes_id
      const usersRes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${
          import.meta.env.VITE_APP_VERSION
        }/user-limaes?bagianlimaes_id=${userlimaes.bagianlimaes_id}${keyPelaksana}`,
      );
      // const names = usersRes.data.data.map((u) => u.fullname);
      setListPelaksana(usersRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (userlimaes && userlimaes.bagianlimaes_id) {
      fetchListPelaksana();
    }
  }, [keyListPelaksana, userlimaes, token]);

  // upload evidence function
  const uploadEvidence = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("evidence", file);
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}/upload-evidence`,
        formData,
      );
      dispatch(
        setNotification({
          message: "selected data has been updated",
          background: "bg-teal-100",
        }),
      );
      // findBarang();
      findData();
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      dispatch(
        setNotification({ message: arrError, background: "bg-red-100" }),
      );
    }
  };

  // delete evidence function
  const deleteEvidence = async (id, filename) => {
    try {
      await axiosInterceptors.delete(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}/delete-evidence?filename=${encodeURIComponent(filename)}`,
      );
      dispatch(
        setNotification({
          message: "selected evidence has been deleted",
          background: "bg-teal-100",
        }),
      );
      findData();
    } catch (e) {
      const msg = e?.response?.data?.error ?? "Failed to delete evidence";
      dispatch(setNotification({ message: msg, background: "bg-red-100" }));
    }
  };

  return token && userlimaes ? (
    <>
      <div className="mt-2 flex flex-wrap justify-evenly gap-2">
        <div className="w-[95%]">
          <p className="mb-4 rounded-md bg-teal-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm">
            Activity
          </p>

          {/* box untuk multi card schedule limaes, overflow-x scroll. di box ini terdapat multi card nya */}
          <div className="mb-4 flex gap-4 overflow-x-auto rounded-lg border border-teal-700 bg-teal-50 p-4">
            {dataStatus0.length > 0 ? (
              dataStatus0.map((schedule) => (
                <div
                  key={`${schedule._id}-${schedule.createdAt}`}
                  onClick={() => handleUpdate(schedule._id)}
                  className="min-w-[280px] cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
                >
                  {/* HEADER */}
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">
                      {schedule.equipment}
                    </h3>
                    <span
                      className={`rounded-full ${schedule.status === 0 && "bg-yellow-100 text-yellow-700"} ${schedule.status === 1 && "bg-green-100 text-green-700"} ${schedule.status === 2 && "bg-blue-100 text-blue-700"} px-3 py-1 text-xs font-medium`}
                    >
                      {schedule.status === 0 && "Terjadwal"}
                      {schedule.status === 1 && "Terlaksana"}
                      {schedule.status === 2 && "Terapprove"}
                    </span>
                  </div>

                  {/* BODY */}
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-700">
                        Unit :{" "}
                      </span>
                      {schedule.unit.split(",")[0]}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">
                        Area :{" "}
                      </span>
                      {schedule.area.split(",")[0]}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">
                        Equipment :{" "}
                      </span>
                      {schedule.equipment}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">
                        Tanggal :{" "}
                      </span>
                      {new Date(schedule.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full mt-10 w-full text-center text-lg text-slate-500">
                semua schedule sudah dilaksanakan
              </p>
            )}
          </div>

          {/* pagination */}
          <div className="mb-4 flex flex-wrap justify-between gap-4">
            {/* Limit Selector */}
            <div className="min-w-[200px] flex-1 rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
              <p className="mb-2 border-b border-teal-300 pb-1 text-sm font-medium text-teal-700">
                Limit
              </p>
              <div className="flex gap-2">
                {[10, 15, 20].map((val) => (
                  <button
                    key={val}
                    onClick={() => setLimit(val)}
                    className={`rounded border px-3 py-1 text-xs font-medium ${
                      limit === val
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-teal-300 bg-white text-teal-700 hover:bg-teal-100"
                    } transition-all duration-200`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Selector */}
            <div className="min-w-[200px] flex-1 rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
              <p className="mb-2 border-b border-teal-300 pb-1 text-sm font-medium text-teal-700">
                Page
              </p>
              <div className="flex gap-1 overflow-x-auto">{pageComponents}</div>
            </div>

            {/* Search Filter */}
            <div className="min-w-[200px] flex-1 rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
              <p className="relative mb-2 border-b border-teal-300 pb-1 text-sm font-medium text-teal-700">
                Search
                <select
                  value={searchBased}
                  onChange={(e) => setSearchBased(e.target.value)}
                  className="absolute right-0 text-teal-700"
                >
                  <option value="tanggal">tanggal</option>
                </select>
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Masukkan kata kunci..."
                  className="w-full rounded border border-teal-300 px-2 py-1 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  onClick={() => setKey({ searchBased: search })}
                  className="rounded bg-green-600 p-2 text-white hover:bg-green-700"
                >
                  <HiMiniMagnifyingGlass />
                </button>
              </div>
            </div>
          </div>

          {/* table */}
          {data.length > 0 ? (
            <div className="w-full overflow-auto rounded-md border border-teal-200 bg-white p-2 shadow-sm">
              <table className="w-full text-sm text-slate-700">
                <thead>
                  <tr className="bg-teal-500 text-white">
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Tanggal
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Unit
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Area
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Equipment
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Pelaksana
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Evidence
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((each, i) => (
                    <tr
                      key={`${i}-${each._id}`}
                      className="border-b border-teal-100 hover:bg-teal-50"
                    >
                      <td className="px-3 py-2">
                        {new Date(each.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-3 py-2">{each.unit.split(",")[0]}</td>
                      <td className="px-3 py-2">{each.area.split(",")[0]}</td>
                      <td className="px-3 py-2">{each.equipment}</td>
                      <td className="px-3 py-2">{each.pelaksana}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${each.status === 0 && "bg-yellow-100 text-yellow-700"} ${each.status === 1 && "bg-green-100 text-green-700"} ${each.status === 2 && "bg-blue-100 text-blue-700"}`}
                        >
                          {each.status === 0 && "Terjadwal"}
                          {each.status === 1 && "Terlaksana"}
                          {each.status === 2 && "Terapprove"}
                        </span>
                      </td>
                      {/* evidence */}
                      <td className="px-4 py-2">
                        {each.evidence && each.evidence.length > 0 ? (
                          <div className="flex items-center gap-3">
                            {each.evidence.map((path, idx) => (
                              <div
                                key={`${each._id}-${idx}`}
                                className="relative inline-block"
                              >
                                {/* Klik gambar buka tab baru */}
                                <a
                                  href={`${import.meta.env.VITE_API_URL}/${path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={`${import.meta.env.VITE_API_URL}/${path}`}
                                    alt={`Evidence ${idx + 1}`}
                                    className="h-12 w-12 cursor-pointer rounded border border-teal-300 object-cover"
                                  />
                                </a>

                                {/* Tombol delete */}
                                {each.status === 1 && (
                                  <button
                                    onClick={() =>
                                      deleteEvidence(each._id, path)
                                    }
                                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600 active:scale-90"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}

                            {/* Tombol upload tambahan */}
                            {each.status === 1 && (
                              <>
                                <label
                                  htmlFor={`upload_${each._id}`}
                                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded border border-dashed border-teal-400 text-teal-500 hover:bg-teal-50"
                                >
                                  +
                                </label>
                                <input
                                  id={`upload_${each._id}`}
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                      uploadEvidence(
                                        each._id,
                                        e.target.files[0],
                                      );
                                    }
                                  }}
                                />
                              </>
                            )}
                          </div>
                        ) : (
                          // Jika array kosong → tampilkan tombol upload saja
                          <div>
                            {each.status === 1 && (
                              <>
                                <label
                                  htmlFor={`upload_${each._id}`}
                                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded border border-dashed border-teal-400 text-teal-500 hover:bg-teal-50"
                                >
                                  +
                                </label>
                                <input
                                  id={`upload_${each._id}`}
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                      uploadEvidence(
                                        each._id,
                                        e.target.files[0],
                                      );
                                    }
                                  }}
                                />
                              </>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            disabled={each.status === 2}
                            onClick={() => handleUpdate(each._id)}
                            className={`rounded border p-2 text-xs transition-colors duration-200 ${
                              each.status === 1
                                ? "border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                                : "bg-green-600 text-white"
                            } disabled:opacity-50`}
                          >
                            <FaPencilAlt />
                          </button>
                          {role === "admin" && (
                            <button
                              disabled={each.status === 2}
                              onClick={() => handleDelete(each._id)}
                              className={`rounded border p-2 text-xs transition-colors duration-200 ${
                                each.status === 1
                                  ? "border-red-600 text-red-700 hover:bg-red-600 hover:text-white"
                                  : "bg-red-600 text-white"
                              } disabled:opacity-50`}
                            >
                              <FaTrash />
                            </button>
                          )}
                          <button
                            disabled={each.status !== 2}
                            onClick={() =>
                              window.open(
                                `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/pdf/${each._id}`,
                                "_blank",
                              )
                            }
                            className={`rounded border p-2 text-xs transition-colors duration-200 ${
                              each.status === 1
                                ? "border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white"
                                : "bg-blue-600 text-white"
                            } disabled:opacity-50`}
                          >
                            <FaPrint />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="m-4 rounded bg-red-100 p-4 text-center text-sm text-red-700">
              Data tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* modal add/update */}
      {showModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-lg bg-white shadow-lg shadow-teal-100 md:w-[80%] lg:w-[50%]">
            {/* Header */}
            <p className="mb-2 border-b-2 border-teal-700 py-2 text-center text-base font-semibold text-teal-700">
              {namaModal}
            </p>
            <button
              onClick={closeModal}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-sm text-white shadow hover:bg-red-700"
            >
              ✕
            </button>

            {/* Body */}
            <div className="mt-1 max-h-[95vh] overflow-auto p-4">
              {errForm && (
                <div className="mb-3 rounded border border-red-700 bg-red-50 p-2 text-xs italic text-red-700">
                  {errForm.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pelaksana */}
                <div className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
                  <p className="relative mb-3 border-b border-teal-300 pb-1 text-sm font-medium text-teal-700">
                    Pelaksana
                    <select
                      value={searchBasedListPelaksana}
                      onChange={(e) =>
                        setSearchBasedListPelaksana(e.target.value)
                      }
                      className="absolute right-0 rounded border border-teal-300 px-2 py-1 text-xs text-teal-700"
                    >
                      <option value="fullname">fullname</option>
                    </select>
                  </p>

                  {/* Search bar */}
                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kata kunci..."
                      className="w-full rounded border border-teal-300 px-2 py-1 text-sm"
                      value={searchListPelaksana}
                      onChange={(e) => setSearchListPelaksana(e.target.value)}
                    />
                    <button
                      onClick={() =>
                        setKeyListPelaksana(
                          `${searchBasedListPelaksana}=${searchListPelaksana}`,
                        )
                      }
                      className="rounded bg-green-600 p-2 text-white hover:bg-green-700"
                      type="button"
                    >
                      <HiMiniMagnifyingGlass />
                    </button>
                  </div>

                  {/* Checkbox list */}
                  <div className="grid grid-cols-2 gap-2">
                    {listPelaksana.map((eachUserLimaes, index) => (
                      <label
                        key={`${eachUserLimaes._id}-${index}`}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <input
                          type="checkbox"
                          value={eachUserLimaes._id}
                          checked={
                            pelaksana.includes(eachUserLimaes._id) ||
                            eachUserLimaes._id === userlimaes._id
                          }
                          disabled={eachUserLimaes._id === userlimaes._id}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setPelaksana((prev) =>
                              checked
                                ? [...prev, eachUserLimaes._id]
                                : prev.filter((p) => p !== eachUserLimaes._id),
                            );
                          }}
                          className="accent-teal-600"
                        />
                        {eachUserLimaes.fullname}
                      </label>
                    ))}
                  </div>
                </div>

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
      )}
    </>
  ) : (
    <div className="m-4 rounded bg-red-100 p-4 text-center">unauthorized</div>
  );
};

export default Activity;
