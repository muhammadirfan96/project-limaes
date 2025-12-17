import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import defaultPenilaian from "../config/defaultPenilaian.js";

const Approval = () => {
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
  const [catatan, setCatatan] = useState([""]);

  // console.log(defaultPenilaian);

  const [penilaian, setPenilaian] = useState(defaultPenilaian);
  const [newItem, setNewItem] = useState("");
  const [newDeskripsi, setNewDeskripsi] = useState("");

  const handleChangeNilai = (index, newValue) => {
    const updated = [...penilaian];
    updated[index].nilai = parseInt(newValue, 10);
    setPenilaian(updated);
  };

  const handleDeleteItem = (index) => {
    const updated = penilaian.filter((_, i) => i !== index);
    setPenilaian(updated);
  };

  const handleAddItem = () => {
    if (newItem.trim() === "" || newDeskripsi.trim() === "") return;
    setPenilaian([
      ...penilaian,
      { item: newItem.trim(), deskripsi: newDeskripsi.trim(), nilai: 5 },
    ]);
    setNewItem("");
    setNewDeskripsi("");
  };

  // ====================

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
    setStatus(2);
    setPenilaian(defaultPenilaian);
    setCatatan([""]);
  };

  // dataStatus2 states
  const [dataStatus2, setDataStatus2] = useState([]);
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
      setModalName("catatan + penilaian");
      openModal();
      setTanggal(d.tanggal);
      setLokasilimaes_id(d.lokasilimaes_id);
      setPelaksana(d.pelaksana);
      setStatus(2);
      // console.log({ penilaian });
      d.penilaian.length === 0
        ? setPenilaian(defaultPenilaian)
        : setPenilaian(d.penilaian);
      d.catatan.length === 0 ? setCatatan([""]) : setCatatan(d.catatan);
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
    console.log({ tanggal, lokasilimaes_id, pelaksana, status, penilaian });
    try {
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
        {
          tanggal,
          lokasilimaes_id,
          pelaksana,
          status,
          penilaian,
          catatan: catatan.filter((c) => c.trim() !== ""),
        },
      );
      dispatch(
        setNotification({ message: "Data updated", background: "bg-teal-100" }),
      );
      closeModal();
      findDataStatus(2);
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
      findDataStatus(2);
    } catch (e) {
      const msg = e?.response?.data?.error ?? "Failed to delete data";
      dispatch(setNotification({ message: msg, background: "bg-red-100" }));
    }
  };

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
  const [dataStatus1, setDataStatus1] = useState([]);

  const findDataStatus = async (status) => {
    if (!token || !userlimaes || !userlimaes.bagianlimaes_id) return;

    try {
      // const searchQuery = key && `&${key}`;

      let pelaksana = [];
      role === "admin" && (pelaksana = []);

      if (role === "user") {
        const bagianlimaesResult = await axiosInterceptors.get(
          `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes/${userlimaes.bagianlimaes_id}`,
        );

        const bagianlimaesRes = await axiosInterceptors.get(
          `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes?limit=10000&atasan=${bagianlimaesResult.data.jabatan}`,
        );

        if (bagianlimaesRes.data.data.length === 0) {
          setDataStatus2([]);
          setDataStatus1([]);
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

      // role admin-unit → hanya pelaksana dari unit yang sama
      if (role.includes("admin-")) {
        const unit = role.split("-")[1];

        // dapatkan bagianlimaes berdasarkan unit
        const bagianlimaesRes = await axiosInterceptors.get(
          `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/bagian-limaes?unit=${unit}&limit=10000`,
        );

        if (bagianlimaesRes.data.data.length === 0) {
          setDataStatus2([]);
          setDataStatus1([]);
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

      const filter = {
        order: "desc",
        ...(status === 2 && { limit }),
        ...(status === 2 && { page }),
        ...(status === 2 && { key }),
        pelaksana,
        status: [`${status}`],
      };

      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes`,
        filter,
      );

      console.log({ scheduleRes });

      // hanya jadwal yang punya evidence
      const filteredSchedules = scheduleRes.data.data.filter(
        (sch) => Array.isArray(sch.evidence) && sch.evidence.length > 0,
      );

      // 🔥 merge Lokasi + User (pelaksana)
      const mergedData = await Promise.all(
        filteredSchedules.map(async (item) => {
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

      // status 1 = data selesai → disimpan ke setDataStatus1
      if (status === 1) setDataStatus1(mergedData);

      // status 2 = masih berjalan → disimpan ke setDataStatus2
      if (status === 2) {
        setDataStatus2(mergedData);
        setAllPage(scheduleRes.data.all_page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    userlimaes && userlimaes._id && findDataStatus(1);
  }, [token, userlimaes]);

  useEffect(() => {
    userlimaes && userlimaes._id && findDataStatus(2);
  }, [token, userlimaes, limit, page, key]);

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
      findDataStatus(2);
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
      findDataStatus(2);
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
            {dataStatus1.length > 0 ? (
              dataStatus1.map((schedule) => (
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
                belum ada data yang perlu diapprove
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
          {dataStatus2.length > 0 ? (
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
                      Catatan
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataStatus2.map((each, i) => (
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
                                {/* {role === "admin" && (
                                  <button
                                    onClick={() =>
                                      deleteEvidence(each._id, path)
                                    }
                                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600 active:scale-90"
                                  >
                                    ✕
                                  </button>
                                )} */}
                              </div>
                            ))}

                            {/* Tombol upload tambahan */}
                            {role === "admin" && (
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
                            {role === "admin" && (
                              <>
                                {/* <label
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
                                /> */}
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
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            disabled={role !== "admin"}
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
                              disabled={role !== "admin"}
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

              <form onSubmit={handleSubmit} className="mx-auto space-y-4">
                {/* catatan */}
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

                <div className="custom-scrollbar max-h-[300px] space-y-3 overflow-y-auto pr-2">
                  {penilaian.map((entry, index) => (
                    <div
                      key={`${entry.item}-${index}`}
                      className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm"
                    >
                      {/* Header Item: Nama & Tombol Hapus */}
                      <div className="relative mb-2 flex items-center justify-between border-b border-teal-100 pb-1">
                        <p className="text-sm font-bold text-teal-800">
                          {entry.item}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                          className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </div>

                      {/* Deskripsi */}
                      <p className="mb-3 text-xs leading-relaxed text-slate-600">
                        {entry.deskripsi}
                      </p>

                      {/* Radio Nilai: Dibuat lebih bersih */}
                      <div className="flex items-center gap-4 rounded-md bg-teal-50/50 p-2">
                        <span className="text-[10px] font-bold uppercase text-teal-600">
                          Skor:
                        </span>
                        <div className="flex gap-4">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <label
                              key={val}
                              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-teal-700"
                            >
                              <input
                                type="radio"
                                name={`nilai-${index}`}
                                value={val}
                                checked={entry.nilai === val}
                                onChange={(e) =>
                                  handleChangeNilai(index, e.target.value)
                                }
                                className="h-4 w-4 accent-teal-600"
                              />
                              <span>{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tambah item baru */}
                <div className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
                  {/* Header Tambah Item */}
                  <div className="relative mb-3 flex items-center justify-between border-b border-teal-300 pb-1">
                    <p className="text-sm font-medium text-teal-700">
                      Tambah Item Penilaian
                    </p>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-teal-600 hover:text-teal-800"
                    >
                      + Tambah ke List
                    </button>
                  </div>

                  {/* Form Input Item Baru */}
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Nama item baru (contoh: Kualitas Kerja)"
                        className="w-full rounded border border-teal-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                      />

                      <textarea
                        placeholder="Deskripsi item penilaian..."
                        className="w-full rounded border border-teal-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        rows="2"
                        value={newDeskripsi}
                        onChange={(e) => setNewDeskripsi(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Approve */}
                <button
                  type="submit"
                  className="w-full rounded-md bg-teal-500 p-2 text-sm font-semibold text-white hover:bg-teal-600"
                >
                  Approve
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

export default Approval;
