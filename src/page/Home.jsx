import { SiMongodb, SiExpress, SiReact, SiNodedotjs } from "react-icons/si";
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
  const userlimaes = useSelector((state) => state.userLimaes.data);
  const axiosInterceptors = axiosRT(token, expire, dispatch);

  const [title, setTitle] = useState("");
  const [month] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());
  const [day] = useState(new Date().getDate());

  const [scheduleData, setScheduleData] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [viewSchedule, setViewSchedule] = useState([]);

  // ============================
  // FETCH SCHEDULE
  // ============================
  const fetchScheduleLimaes = async () => {
    if (!token || !userlimaes || !userlimaes.bagianlimaes_id) return;

    try {
      // const current = new Date(year, month - 1, day);
      // const next = new Date(current);
      // next.setDate(current.getDate() + 1);

      // const keytanggal = `${year}-${month}-${day}@${next.getFullYear()}-${
      //   next.getMonth() + 1
      // }-${next.getDate()}`;

      // const keytanggal = `2025-11-20@2025-11-24`;

      // const keytanggal = `${year}-${month}-${day}@${year}-${month}-${day}`;

      // to make sure tanggal is in format YYYY-MM-DD with leading zeros
      const dayString = day.toString().padStart(2, "0");
      const monthString = month.toString().padStart(2, "0");
      const keytanggal = `${year}-${monthString}-${dayString}@${year}-${monthString}-${dayString}`;

      // console.log({ keytanggal });

      let lokasiQuery = "";
      let unit = "";
      let area = "";
      if (role === "admin") {
        unit = "";
        area = "";
        lokasiQuery = "";
        setTitle("all unit");
      }
      if (role === "user") {
        // 1. Ambil data bagian user
        const bagianRes = await axiosInterceptors.get(
          `/${import.meta.env.VITE_APP_NAME}/${
            import.meta.env.VITE_APP_VERSION
          }/bagian-limaes/${userlimaes.bagianlimaes_id}`,
        );
        unit = bagianRes.data.unit;
        area = "";
        setTitle(unit);
      }
      if (role.includes("-")) {
        unit = role.includes("-") && role.split("-")[1];
        area = "";
        setTitle(unit);
      }

      // 2. Ambil lokasi berdasarkan unit + area
      const lokasiRes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${
          import.meta.env.VITE_APP_VERSION
        }/lokasi-limaes?unit=${unit}&area=${area}`,
      );
      // &area=${area}

      const lokasilimaes_ids = [
        ...new Set(lokasiRes.data.data.map((ll) => ll._id)),
      ];

      if (role === "user" || role.includes("-")) {
        lokasiQuery = lokasilimaes_ids
          .map((id) => `&lokasilimaes_id=${id}`)
          .join("");
      }

      // 3. Ambil schedule sesuai lokasi
      const scheduleRes = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${
          import.meta.env.VITE_APP_VERSION
        }/schedule-limaes?${lokasiQuery}&tanggal=${keytanggal}`,
      );

      // &tanggal=${keytanggal}

      setScheduleData(scheduleRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // console.log({ scheduleData });

  // ============================
  // JOIN schedule + lokasi
  // ============================
  useEffect(() => {
    if (!scheduleData.length) return;

    const fetchMerged = async () => {
      try {
        const merged = await Promise.all(
          scheduleData.map(async (item) => {
            try {
              const lokasiRes = await axiosInterceptors.get(
                `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/lokasi-limaes/${item.lokasilimaes_id}`,
              );

              const lokasi = lokasiRes.data;

              return {
                ...item,
                unit: lokasi?.unit || "-",
                area: lokasi?.area || "-",
                equipment: lokasi?.equipment || "-",
              };
            } catch (e) {
              return {
                ...item,
                unit: "-",
                area: "-",
                equipment: "-",
              };
            }
          }),
        );

        setViewSchedule(merged);
      } catch (err) {
        console.error("Error merging schedule + lokasi:", err);
      }
    };

    fetchMerged();
  }, [scheduleData]);

  // ============================
  // Jalankan fetch ketika userlimaes siap
  // ============================
  useEffect(() => {
    fetchScheduleLimaes();
  }, [userlimaes, token]);

  // ============================
  // VIEW JIKA BELUM LOGIN
  // ============================
  if (!token || !userlimaes)
    return (
      <div className="mx-auto max-w-xl p-4">
        <div className="mx-auto flex w-64 justify-center rounded-xl bg-white p-3 text-6xl text-green-700 shadow-md">
          <SiMongodb className="mx-1" />
          <SiExpress className="mx-1" />
          <SiReact className="mx-1" />
          <SiNodedotjs className="mx-1" />
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-teal-100 p-4 text-center shadow">
            <h1 className="text-2xl font-bold">Welcome to HOUSE KEEPING</h1>
            <p className="mt-2">This application is built with MERN Stack:</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 p-4">
      {/* HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-slate-800 drop-shadow">
          {title}
        </h1>

        <h2 className="mt-2 text-lg text-slate-600">
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="mt-3 inline-block rounded-lg bg-white px-4 py-2 shadow">
          <span className="font-semibold text-slate-700">
            <Time />
          </span>
        </div>
      </div>

      {/* CARD SCHEDULE */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {viewSchedule.length > 0 ? (
          viewSchedule.map((schedule) => {
            // STATUS CONFIG
            // const statusText =
            //   schedule.status === 0
            //     ? "Terjadwal"
            //     : schedule.status === 1
            //       ? "Terlaksana"
            //       : "Terapprove";

            // const statusColors =
            //   schedule.status === 0
            //     ? "bg-yellow-100 text-yellow-700"
            //     : schedule.status === 1
            //       ? "bg-green-100 text-green-700"
            //       : "bg-green-100 text-green-700";

            // const shadowColors =
            //   schedule.status === 0
            //     ? "shadow-yellow-300"
            //     : schedule.status === 1
            //       ? "shadow-green-300"
            //       : "shadow-green-300";

            return (
              <div
                key={schedule._id}
                className={`rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${schedule.status === 0 && "shadow-yellow-300"} ${schedule.status === 1 && "shadow-green-300"} ${schedule.status === 2 && "shadow-blue-300"}`}
              >
                {/* TITLE */}
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    {schedule.equipment}
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
                    <strong className="text-slate-800">Unit:</strong>{" "}
                    {schedule.unit}
                  </p>
                  <p>
                    <strong className="text-slate-800">Area:</strong>{" "}
                    {schedule.area}
                  </p>
                  <p>
                    <strong className="text-slate-800">Equipment:</strong>{" "}
                    {schedule.equipment}
                  </p>
                  <p>
                    <strong className="text-slate-800">Tanggal:</strong>{" "}
                    {new Date(schedule.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
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
