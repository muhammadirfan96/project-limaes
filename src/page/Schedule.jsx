import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { setBottombarBackward } from "../redux/barSlice.js";

const Schedule = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const username = useSelector((state) => state.jwToken.username);
  const role = useSelector((state) => state.jwToken.role);
  const uid = useSelector((state) => state.jwToken.uid);
  const userlimaes = useSelector((state) => state.userLimaes.data);
  const axiosInterceptors = axiosRT(token, expire, dispatch);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [limaesData, setLimaesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // FORM STATE
  const [errForm, setErrForm] = useState(null);
  const [form_id, setForm_id] = useState(null);
  const [tanggal, setTanggal] = useState("");
  // const [lokasilimaes_id, setLokasilimaes_id] = useState("");
  const [pelaksana, setPelaksana] = useState([]);
  const [status, setStatus] = useState("");
  const [penilaian, setPenilaian] = useState([]);

  // ==========================
  // 🔹 UTIL & FETCH DATA
  // ==========================
  const daysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const [keylokasilimaes_id, setKeylokasilimaes_id] = useState([]);

  // ============
  const [schedule, setSchedule] = useState([]);

  const findLimaes = async () => {
    if (!keylokasilimaes_id.length) {
      setSchedule([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = [];
    const monthString = month.toString().padStart(2, "0");
    const totalDays = daysInMonth(month, year);
    const tanggal = `${year}-${monthString}-01@${year}-${monthString}-${totalDays}`;

    const lokasilimaes_id = keylokasilimaes_id;

    // ambil schedule
    const filter = {
      limit: 31,
      lokasilimaes_id,
      tanggal,
    };

    const res = await axiosInterceptors.post(
      `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes`,
      filter,
    );

    for (let i = 1; i <= totalDays; i++) {
      const dayString = i.toString().padStart(2, "0");
      const dateKey = `${year}-${monthString}-${dayString}`;

      // cari semua data dengan tanggal yang sama (bukan push null dalam map)
      const filtered = res.data.data.filter(
        (each) => each.tanggal.split("T")[0] === dateKey,
      );

      result.push({
        day: i,
        data: filtered.length ? filtered : [],
      });
    }

    setSchedule(result);
    setLoading(false);
  };

  useEffect(() => {
    findLimaes();
  }, [year, month, keylokasilimaes_id]);

  const toLocalDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // ==========================
  // 🔹 MODAL HANDLING
  // ==========================
  const [namaModal, setNamaModal] = useState("");
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
    dispatch(setBottombarBackward(true));
  };

  const closeModal = () => {
    setShowModal(false);
    setErrForm(null);
    setTanggal("");
    setLokasilimaes_id("");
    setKeyEquipmentLokasiLimaes("");
    setPelaksana([]);
    setStatus("");
    setPenilaian([]);
    dispatch(setBottombarBackward(false));
  };

  // ==========================
  // 🔹 ADD & UPDATE DATA
  // ==========================
  const handleAdd = (day) => {
    const dayString = day.toString().padStart(2, "0");
    const monthString = month.toString().padStart(2, "0");
    setTanggal(`${year}-${monthString}-${dayString}`);

    setForm_id(null);
    setNamaModal("add data");
    openModal();
  };

  const handleUpdate = async (id) => {
    try {
      setForm_id({ id });
      setNamaModal("update data");

      const oldDataRes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
      );
      const oldData = oldDataRes.data;

      openModal();
      setTanggal(oldData.tanggal);
      setLokasilimaes_id(oldData.lokasilimaes_id);
      setPelaksana(oldData.pelaksana);
      setStatus(oldData.status);
      setPenilaian(oldData.penilaian);
    } catch (err) {
      dispatch(
        setNotification({
          message: "Failed to load data",
          background: "bg-red-100",
        }),
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    form_id ? updateData(form_id.id) : addData();
  };

  const addData = async () => {
    try {
      await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes`,
        { tanggal, lokasilimaes_id },
      );
      dispatch(
        setNotification({
          message: "new data added",
          background: "bg-teal-100",
        }),
      );
      closeModal();
      findLimaes();
    } catch (e) {
      setErrForm(e?.response?.data?.error?.split(",") ?? ["Terjadi kesalahan"]);
    }
  };

  const updateData = async (id) => {
    try {
      await axiosInterceptors.patch(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
        { tanggal, lokasilimaes_id, pelaksana, status, penilaian },
      );
      dispatch(
        setNotification({
          message: "data updated",
          background: "bg-teal-100",
        }),
      );
      closeModal();
      findLimaes();
    } catch (e) {
      setErrForm(e?.response?.data?.error?.split(",") ?? ["Error"]);
    }
  };

  // ==========================
  // 🔹 LOKASI LIMAES
  // ==========================
  const [listLokasiLimaes, setListLokasilimaes] = useState([]);
  const [keyEquipmentLokasiLimaes, setKeyEquipmentLokasiLimaes] = useState("");
  const [keyUnitLokasiLimaes, setKeyUnitLokasiLimaes] = useState("");
  const [keyAreaLokasiLimaes, setKeyAreaLokasiLimaes] = useState("");

  const [lokasilimaes_id, setLokasilimaes_id] = useState([]); // menjadi array

  useEffect(() => {
    if (role.includes("-")) {
      setKeyUnitLokasiLimaes(role.split("-")[1]);
    }
  }, []);

  const findLokasiLimaes = async () => {
    try {
      const res = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/lokasi-limaes?unit=${keyUnitLokasiLimaes}&area=${keyAreaLokasiLimaes}&equipment=${keyEquipmentLokasiLimaes}&limit=10000`,
      );

      const lokasilimaes_ids = [
        ...new Set(res.data.data.map((item) => item._id)),
      ];

      !keyUnitLokasiLimaes || !keyAreaLokasiLimaes
        ? setKeylokasilimaes_id([])
        : setKeylokasilimaes_id(lokasilimaes_ids);

      setListLokasilimaes(res.data.data);
    } catch (error) {
      dispatch(
        setNotification({
          message:
            error?.response?.data?.error?.split(",")?.[0] ??
            "Error loading lokasi",
          background: "bg-red-100",
        }),
      );
    }
  };

  useEffect(() => {
    findLokasiLimaes();
  }, [keyUnitLokasiLimaes, keyAreaLokasiLimaes, keyEquipmentLokasiLimaes]);

  // ==========================
  // 🔹 RENDER
  // ==========================
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
          {/* Header */}
          <p className="mb-4 rounded-md bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-500 px-4 py-2 text-center text-sm font-semibold shadow-lg">
            Schedule
          </p>

          {/* Filter Controls */}
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <select
              value={keyUnitLokasiLimaes}
              onChange={(e) => setKeyUnitLokasiLimaes(e.target.value)}
              className="rounded border border-teal-300 px-2 py-1 text-sm"
            >
              <option value="">All Unit</option>
              {[...new Set(listLokasiLimaes.map((item) => item.unit))].map(
                (each, i) => (
                  <option key={i} value={each}>
                    {each}
                  </option>
                ),
              )}
            </select>

            <select
              value={keyAreaLokasiLimaes}
              onChange={(e) => setKeyAreaLokasiLimaes(e.target.value)}
              className="rounded border border-teal-300 px-2 py-1 text-sm"
            >
              <option value="">All Area</option>
              {[...new Set(listLokasiLimaes.map((item) => item.area))].map(
                (each, i) => (
                  <option key={i} value={each}>
                    {each}
                  </option>
                ),
              )}
            </select>

            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="rounded border border-teal-300 px-2 py-1 text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="rounded border border-teal-300 px-2 py-1 text-sm"
            >
              {[...Array(11)].map((_, i) => (
                <option key={2025 + i} value={2025 + i}>
                  {2025 + i}
                </option>
              ))}
            </select>
          </div>

          {/* Kalender Grid */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {schedule.map((item) => (
                <button
                  key={item.day}
                  onClick={() =>
                    item.data.length > 0
                      ? handleUpdate(item.data[0]._id)
                      : handleAdd(item.day)
                  }
                  className={`flex h-24 items-center justify-center rounded-lg border text-lg font-bold transition-all duration-300 hover:scale-[1.05] ${
                    item.data.length > 0
                      ? (item.data[0].status === 0 &&
                          "bg-yellow-100 text-yellow-700 shadow hover:shadow-yellow-400") ||
                        (item.data[0].status === 1 &&
                          "bg-green-100 text-green-700 shadow hover:shadow-green-400") ||
                        (item.data[0].status === 2 &&
                          "bg-blue-100 text-blue-700 shadow hover:shadow-blue-400")
                      : "bg-white text-slate-500 shadow hover:shadow-slate-400"
                  }`}
                >
                  {item.day}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white shadow-lg md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b-2 border-teal-700 py-2 text-center text-base font-semibold text-teal-700">
              {namaModal}
            </p>
            <button
              onClick={closeModal}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-sm text-white shadow hover:bg-red-700"
            >
              ✕
            </button>
            <div className="mt-1 max-h-[95vh] overflow-auto p-2">
              {errForm && (
                <div className="mb-2 rounded border border-red-700 p-1 text-xs italic text-red-700">
                  {errForm.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <p className="mb-2 rounded-lg border border-teal-200 bg-white p-2 shadow-sm">
                  {tanggal.split("T")[0]}
                </p>

                {/* Lokasi */}
                <div className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
                  <p className="relative mb-3 border-b border-teal-300 pb-1 text-sm font-medium text-teal-700">
                    Lokasi / Equipment
                    <select className="absolute right-0 rounded border border-teal-300 px-2 py-1 text-xs text-teal-700">
                      <option value="equipment">equipment</option>
                    </select>
                  </p>

                  {/* Search bar */}
                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kata kunci..."
                      className="w-full rounded border border-teal-300 px-2 py-1 text-sm"
                      value={keyEquipmentLokasiLimaes}
                      onChange={(e) =>
                        setKeyEquipmentLokasiLimaes(e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="rounded bg-green-600 p-2 text-white hover:bg-green-700"
                    >
                      <HiMiniMagnifyingGlass />
                    </button>
                  </div>

                  {/* Checkbox list (scrollable) */}
                  <div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto pr-2">
                    {listLokasiLimaes.map((eachLokasi, index) => (
                      <label
                        key={`${eachLokasi._id}-${index}`}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <input
                          type="checkbox"
                          value={eachLokasi._id}
                          checked={lokasilimaes_id.includes(eachLokasi._id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setLokasilimaes_id((prev) =>
                              checked
                                ? [...prev, eachLokasi._id]
                                : prev.filter((id) => id !== eachLokasi._id),
                            );
                          }}
                          className="accent-teal-600"
                        />
                        {eachLokasi.equipment}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-md bg-teal-500 p-2 text-sm font-semibold text-white hover:bg-teal-600"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* If no data */}
      {!loading && schedule.length === 0 && (
        <div className="m-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-xl">⚠️</span>
            </div>

            <h3 className="text-sm font-semibold text-yellow-800">
              Data Tidak Ditemukan
            </h3>

            <p className="mt-1 text-xs text-yellow-700">
              Tidak ada data yang sesuai. Silakan sesuaikan filter unit atau
              area.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Schedule;
