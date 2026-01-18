import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaPencilAlt, FaTrash, FaPrint } from "react-icons/fa";
import { setBottombarBackward } from "../redux/barSlice.js";

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
  const [waktu, setWaktu] = useState("");
  const [lokasilimaes_id, setLokasilimaes_id] = useState("");
  const [pelaksana, setPelaksana] = useState([userlimaes?._id]);
  const [status, setStatus] = useState("");
  const [penilaian, setPenilaian] = useState([]);
  const [catatan, setCatatan] = useState([""]);
  const [sasaran, setSasaran] = useState([""]);
  const [tujuan, setTujuan] = useState([""]);

  const [errForm, setErrForm] = useState(null);
  const [form_id, setForm_id] = useState(null);

  // modal states
  const [namaModal, setModalName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const openModal = () => {
    setShowModal(true);
    dispatch(setBottombarBackward(true));
  };
  const closeModal = () => {
    setShowModal(false);
    setErrForm(null);
    setForm_id(null);
    setModalName("");
    setTanggal("");
    setWaktu("");
    setLokasilimaes_id("");
    setPelaksana([userlimaes._id]);
    setStatus(1);
    setPenilaian([]);
    setCatatan([""]);
    setSasaran([""]);
    setTujuan([""]);
    dispatch(setBottombarBackward(false));
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
      setWaktu(d.waktu);
      setLokasilimaes_id(d.lokasilimaes_id);
      !d.pelaksana.includes(userlimaes._id)
        ? setPelaksana([...d.pelaksana, userlimaes._id])
        : setPelaksana(d.pelaksana);
      setStatus(1);
      setPenilaian(d.penilaian);
      setCatatan(d.catatan.length > 0 ? d.catatan : [""]);
      setSasaran(d.sasaran.length > 0 ? d.sasaran : [""]);
      setTujuan(d.tujuan.length > 0 ? d.tujuan : [""]);
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
          waktu,
          lokasilimaes_id,
          pelaksana,
          status,
          penilaian,
          catatan: catatan.filter((c) => c.trim() !== ""),
          sasaran: sasaran.filter((s) => s.trim() !== ""),
          tujuan: tujuan.filter((t) => t.trim() !== ""),
        },
      );
      dispatch(
        setNotification({ message: "Data updated", background: "bg-teal-100" }),
      );
      closeModal();
      findData();
      findDataStatus0();
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
      const filter = {
        // ...(role === "user" && {
        pelaksana_fullname: userlimaes.fullname,
        pelaksana_nip: userlimaes.nip,
        // }),
        // ...(role.includes("-") && {
        //   bidang_unit: role.split("-")[1],
        // }),
        status: [1, 2],
        limit,
        page,
        key,
      };

      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes/aggregate`,
        filter,
      );

      setData(scheduleRes.data.data);
      setAllPage(scheduleRes.data.all_page);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (userlimaes) findData();
  }, [userlimaes, limit, page, key]);

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
    try {
      const filter = {
        // ...(role === "user" && {
        lokasi_unit: [userlimaes.bagianlimaes.unit],
        lokasi_area: [userlimaes.bagianlimaes.area],
        // }),
        // ...(role === "user" &&
        //   userlimaes.bagianlimaes.jabatan.startsWith("tl ") && {
        //     lokasi_unit: userlimaes.bagianlimaes.unit,
        //   }),
        // ...(role.includes("-") && {
        //   lokasi_unit: role.split("-")[1],
        // }),
        tanggal: `1970-01-01@${new Date().toISOString().split("T")[0]}`,
        sortBy: "tanggal",
        status: [0],
        limit: 3,
      };

      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes/aggregate`,
        filter,
      );

      setDataStatus0(scheduleRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userlimaes) findDataStatus0();
  }, [userlimaes]);

  const [listPelaksana, setListPelaksana] = useState([]);
  const [searchListPelaksana, setSearchListPelaksana] = useState("");
  const [searchBasedListPelaksana, setSearchBasedListPelaksana] =
    useState("fullname");

  const fetchListPelaksana = async () => {
    try {
      const usersRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${
          import.meta.env.VITE_APP_VERSION
        }/users-limaes/aggregate`,
        {
          bagianlimaes_jabatan: userlimaes.bagianlimaes.jabatan,
          bagianlimaes_atasan: userlimaes.bagianlimaes.atasan,
          bagianlimaes_bawahan: userlimaes.bagianlimaes.bawahan,
          bagianlimaes_unit: userlimaes.bagianlimaes.unit,
          bagianlimaes_area: userlimaes.bagianlimaes.area,
          fullname: searchListPelaksana,
        },
      );

      setListPelaksana(usersRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (userlimaes) {
      fetchListPelaksana();
    }
  }, [userlimaes]);

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

  if (!token || !userlimaes)
    return (
      <div className="m-4 flex items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl">⛔</span>
          </div>

          <h3 className="text-sm font-semibold text-red-800">
            Unauthorized Access
          </h3>

          <p className="mt-1 text-xs text-red-700">
            Anda tidak memiliki akses. Silakan login terlebih dahulu.
          </p>
        </div>
      </div>
    );

  return (
    <>
      <div className="mt-2 flex flex-wrap justify-evenly gap-2">
        <div className="w-[95%]">
          <p className="mb-4 rounded-md bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-500 px-4 py-2 text-center text-sm font-semibold shadow-lg">
            Activity
          </p>

          {/* box untuk multi card schedule limaes, overflow-x scroll. di box ini terdapat multi card nya */}
          <div className="mb-4 flex gap-4 overflow-x-auto rounded-lg border border-teal-700 bg-teal-50 p-4">
            {dataStatus0.length > 0 ? (
              dataStatus0.map((schedule) => (
                <div
                  key={`${schedule._id}-${schedule.createdAt}`}
                  onClick={() => handleUpdate(schedule._id)}
                  className="min-w-[280px] cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:shadow-lg"
                >
                  {/* HEADER */}
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">
                      {schedule.lokasi.map((l) => l.equipment).join(", ")}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${schedule.status === 0 && "bg-yellow-100 text-yellow-700"} ${schedule.status === 1 && "bg-green-100 text-green-700"} ${schedule.status === 2 && "bg-blue-100 text-blue-700"}`}
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
                      {schedule.lokasi[0].unit}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">
                        Area :{" "}
                      </span>
                      {schedule.lokasi[0].area}
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
                    <p>
                      <span className="font-medium text-slate-700">
                        Waktu :{" "}
                      </span>
                      {schedule.waktu === 1 && "shift pagi"}
                      {schedule.waktu === 2 && "shift sore"}
                      {schedule.waktu === 3 && "shift malam"}
                    </p>
                    <div>
                      <span className="font-medium text-slate-700">
                        Sasaran :{" "}
                      </span>
                      {schedule.sasaran && schedule.sasaran.length > 0 && (
                        <ul className="list-disc pl-5 text-xs">
                          {schedule.sasaran.map((sch, idx) => (
                            <li key={`${schedule._id}-sasaran-${idx}`}>
                              {sch}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Tujuan :{" "}
                      </span>
                      {schedule.tujuan && schedule.tujuan.length > 0 && (
                        <ul className="list-disc pl-5 text-xs">
                          {schedule.tujuan.map((tuj, idx) => (
                            <li key={`${schedule._id}-tujuan-${idx}`}>{tuj}</li>
                          ))}
                        </ul>
                      )}
                    </div>
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
                  <tr className="bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-500">
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Tanggal
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Waktu
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
                      Catatan
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
                      <td className="px-3 py-2">
                        {each.waktu === 1 && "shift pagi"}
                        {each.waktu === 2 && "shift sore"}
                        {each.waktu === 3 && "shift malam"}
                      </td>
                      <td className="px-3 py-2">{each.lokasi[0].unit}</td>
                      <td className="px-3 py-2">{each.lokasi[0].area}</td>
                      <td className="px-3 py-2">
                        {each.lokasi.map((l) => l.equipment).join(", ")}
                      </td>
                      <td className="px-3 py-2">
                        {each.pelaksana.map((p) => p.fullname).join(", ")}
                      </td>
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
                      {/* catatan is an array */}
                      <td className="px-3 py-2">
                        {each.catatan && each.catatan.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {each.catatan.map((cat, idx) => (
                              <li key={`${each._id}-catatan-${idx}`}>{cat}</li>
                            ))}
                          </ul>
                        ) : (
                          "-"
                        )}
                      </td>
                      {/* action */}
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900 bg-opacity-80">
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
                    {/* <button
                      onClick={() =>
                        setKeyListPelaksana(
                          `${searchBasedListPelaksana}=${searchListPelaksana}`,
                        )
                      }
                      className="rounded bg-green-600 p-2 text-white hover:bg-green-700"
                      type="button"
                    >
                      <HiMiniMagnifyingGlass />
                    </button> */}
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

                {/* Section Catatan */}
                <div className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
                  <div className="relative mb-3 flex items-center justify-between border-b border-teal-300 pb-1">
                    <p className="text-sm font-medium text-teal-700">Catatan</p>
                    <button
                      type="button"
                      onClick={() => setCatatan([...catatan, ""])}
                      className="text-xs font-bold text-teal-600 hover:text-teal-800"
                    >
                      + Tambah Baris
                    </button>
                  </div>

                  <div className="space-y-2">
                    {catatan.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <textarea
                          value={item}
                          onChange={(e) => {
                            const newCatatan = [...catatan];
                            newCatatan[index] = e.target.value;
                            setCatatan(newCatatan);
                          }}
                          placeholder={`Catatan ke-${index + 1}`}
                          className="w-full rounded border border-teal-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          rows="2"
                        />

                        {/* Tombol Hapus: Hanya muncul jika list lebih dari 1 */}
                        {catatan.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newCatatan = catatan.filter(
                                (_, i) => i !== index,
                              );
                              setCatatan(newCatatan);
                            }}
                            className="flex items-center justify-center rounded border border-red-200 bg-red-50 px-2 text-red-500 hover:bg-red-100"
                          >
                            ✕
                          </button>
                        )}
                      </div>
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
  );
};

export default Activity;
