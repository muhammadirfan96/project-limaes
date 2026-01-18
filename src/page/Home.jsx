import { FiSettings } from "react-icons/fi";
import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";

// ============================
// Komponen jam real-time
// ============================
const Time = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time.toLocaleTimeString()}</span>;
};

const Home = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const role = useSelector((state) => state.jwToken.role);
  const uid = useSelector((state) => state.jwToken.uid);
  const userlimaes = useSelector((state) => state.userLimaes.data);
  const axiosInterceptors = axiosRT(token, expire, dispatch);

  const [month] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());
  const [day] = useState(new Date().getDate());

  const [scheduleData, setScheduleData] = useState([]);
  const [allUnit, setAllunit] = useState([]);
  const [unitView, setUnitView] = useState("punagaya");
  const [allArea, setAllArea] = useState([]);
  const [areaView, setAreaView] = useState("boiler");

  const getAllLokasi = async () => {
    try {
      const res = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/lokasies-limaes/distinct`,
      );
      setAllunit(res.data.unit);
      setAllArea(res.data.area);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllLokasi();
  }, [userlimaes]);

  // ============================
  // FETCH SCHEDULE
  // ============================
  const fetchScheduleLimaes = async () => {
    try {
      const dayString = day.toString().padStart(2, "0");
      const monthString = month.toString().padStart(2, "0");
      const keytanggal = `${year}-${monthString}-${dayString}@${year}-${monthString}-${dayString}`;

      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes/aggregate`,
        {
          ...(role === "user" && {
            lokasi_unit: [userlimaes.bagianlimaes.unit],
          }),
          ...(role === "user" &&
          userlimaes.bagianlimaes.jabatan.startsWith("tl ")
            ? { lokasi_area: [areaView] }
            : { lokasi_area: [userlimaes.bagianlimaes.area] }),
          ...(role.includes("-") && {
            lokasi_unit: [role.split("-")[1]],
            lokasi_area: [areaView],
          }),
          ...(role === "admin" && {
            lokasi_unit: [unitView],
            lokasi_area: [areaView],
          }),
          tanggal: keytanggal,
        },
      );

      setScheduleData(scheduleRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userlimaes && unitView && areaView) fetchScheduleLimaes();
  }, [userlimaes, unitView, areaView]);

  // ============================
  // VIEW JIKA BELUM LOGIN
  // ============================
  if (!token || !userlimaes)
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="mx-auto flex h-full max-w-7xl items-center px-8">
          {/* Left Content */}
          <div className="w-full space-y-6 md:w-1/2">
            <h1 className="text-5xl font-bold leading-tight text-slate-800">
              Sistem Monitoring
              <br />
              <span className="text-teal-600">House Keeping</span>
            </h1>

            <p className="max-w-lg text-lg text-slate-600">
              Platform terintegrasi untuk penjadwalan, pelaksanaan, dan
              monitoring kegiatan House Keeping secara real-time.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
                Real-time Monitoring
              </span>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
                Terintegrasi Unit
              </span>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
                Laporan Digital
              </span>
            </div>

            <p className="text-sm text-slate-500">
              Silakan login melalui menu di kanan atas untuk mengakses fitur
              lengkap aplikasi.
            </p>
          </div>

          {/* Right Visual */}
          <div className="relative hidden w-1/2 md:block">
            <div className="absolute right-0 top-1/2 w-[420px] -translate-y-1/2 space-y-4">
              <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-teal-700">
                  Penjadwalan Terstruktur
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Perencanaan kegiatan House Keeping yang tersusun rapi,
                  terjadwal jelas, dan terdokumentasi secara sistematis.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-teal-700">
                  Monitoring Lapangan
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Pemantauan pelaksanaan House Keeping secara aktual untuk
                  memastikan kegiatan berjalan sesuai rencana.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-teal-700">
                  Laporan & Evaluasi
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Penyajian laporan digital sebagai dasar evaluasi dan
                  peningkatan kinerja House Keeping secara berkelanjutan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 p-4">
      {/* HEADER */}
      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
        {/* Left: Title */}
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-slate-800">
            {unitView}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Right: Time */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 ring-1 ring-slate-200">
          <span className="text-sm font-semibold text-slate-600">Waktu:</span>
          <span className="font-semibold text-teal-700">
            <Time />
          </span>
        </div>

        {/* absolute: left-top */}
        {role === "admin" && (
          <div className="absolute left-2 top-2 text-xs text-slate-400">
            {/* Select transparan, menutupi area icon */}
            <select
              value={unitView}
              onChange={(e) => setUnitView(e.target.value)}
              className="absolute inset-0 cursor-pointer appearance-none opacity-0"
            >
              {allUnit.map((unit, i) => (
                <option key={i} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            {/* Icon visual, klik tetap tembus ke select */}
            <FiSettings className="pointer-events-none text-slate-600" />
          </div>
        )}

        <div
          className={`${role === "user" && !userlimaes.bagianlimaes.jabatan.startsWith("tl") && "hidden"} absolute left-6 top-2 text-xs text-slate-400`}
        >
          {/* Select transparan, menutupi area icon */}
          <select
            value={areaView}
            onChange={(e) => setAreaView(e.target.value)}
            className="absolute inset-0 cursor-pointer appearance-none opacity-0"
          >
            {allArea.map((area, i) => (
              <option key={i} value={area}>
                {area}
              </option>
            ))}
          </select>

          {/* Icon visual, klik tetap tembus ke select */}
          <FiSettings className="pointer-events-none text-slate-600" />
        </div>
      </div>

      {/* CARD SCHEDULE */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {scheduleData.length > 0 ? (
          scheduleData.map((schedule) => {
            return (
              <div
                key={schedule._id}
                className={`rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${schedule.status === 0 && "shadow-yellow-300"} ${schedule.status === 1 && "shadow-green-300"} ${schedule.status === 2 && "shadow-blue-300"}`}
              >
                {/* TITLE */}
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    {schedule.lokasi.map((l) => l.equipment).join(", ")}
                  </h3>

                  {/* BADGE STATUS */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${schedule.status === 0 && "bg-yellow-100 text-yellow-700"} ${schedule.status === 1 && "bg-green-100 text-green-700"} ${schedule.status === 2 && "bg-blue-100 text-blue-700"}`}
                  >
                    {schedule.status === 0 && "Terjadwal"}
                    {schedule.status === 1 && "Terlaksana"}
                    {schedule.status === 2 && "Terapprove"}
                  </span>
                </div>

                {/* DETAIL */}
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    <strong className="text-slate-800">Unit :</strong>{" "}
                    {schedule.lokasi[0].unit}
                  </p>
                  <p>
                    <strong className="text-slate-800">Area :</strong>{" "}
                    {schedule.lokasi[0].area}
                  </p>
                  {/* <p>
                    <strong className="text-slate-800">Equipment:</strong>{" "}
                    {schedule.equipment}
                  </p> */}
                  <p>
                    <strong className="text-slate-800">Tanggal :</strong>{" "}
                    {new Date(schedule.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <strong className="text-slate-800">Waktu :</strong>{" "}
                    {schedule.waktu === 1 && "shift pagi"}
                    {schedule.waktu === 2 && "shift sore"}
                    {schedule.waktu === 3 && "shift malam"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="col-span-full mt-10 text-center text-lg text-slate-500">
            Tidak ada schedule ditemukan.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
