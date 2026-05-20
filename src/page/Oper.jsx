import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaPencilAlt, FaTrash, FaPrint } from "react-icons/fa";
import { setBottombarBackward } from "../redux/barSlice.js";

const Oper = () => {
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
  const [oper, setOper] = useState({});
  const [tanggalOper, setTanggalOper] = useState("");
  const [waktuOper, setWaktuOper] = useState("");
  const [statusOper, setStatusOper] = useState("");
  const [catatanOper, setCatatanOper] = useState("");
  const [showInputTanggalAndWaktuOper, setShowInputTanggalAndWaktuOper] =
    useState(false);

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

  const [showModalOper, setShowModalOper] = useState(false);
  const openModalOper = () => {
    setShowModalOper(true);
    dispatch(setBottombarBackward(true));
  };
  const closeModalOper = () => {
    setShowModalOper(false);
    setErrForm(null);
    setForm_id(null);
    setOper({});
    setTanggalOper("");
    setWaktuOper("");
    setStatusOper("");
    setCatatanOper("");
    setShowInputTanggalAndWaktuOper(false);
    dispatch(setBottombarBackward(false));
  };

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
      // d.oper && setOper(d.oper);
      // setTanggalOper(d.oper?.tanggal || "");
      // setWaktuOper(d.oper?.waktu || "");
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
          // oper,
        },
      );
      dispatch(
        setNotification({ message: "Data updated", background: "bg-teal-100" }),
      );
      closeModal();
      findDataOperProcessStatus2();
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      setErrForm(arrError);
    }
  };

  // handle oper
  const handleOper = async (id) => {
    try {
      setForm_id({ id });
      const oldData = await axiosInterceptors.get(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedule-limaes/${id}`,
      );
      const d = oldData.data;
      openModalOper();
      setTanggal(d.tanggal);
      setWaktu(d.waktu);
      setLokasilimaes_id(d.lokasilimaes_id);
      setPelaksana(d.pelaksana);
      setStatus(d.status);
      setPenilaian(d.penilaian);
      setCatatan(d.catatan);
      setSasaran(d.sasaran);
      setTujuan(d.tujuan);
      d.oper && setOper(d.oper);
      setTanggalOper(d.oper?.tanggal.split("T")[0] || "");
      setWaktuOper(d.oper?.waktu || "");
    } catch (e) {
      const msg = e?.response?.data?.error ?? "Failed to fetch data";
      dispatch(setNotification({ message: msg, background: "bg-red-100" }));
    }
  };

  // handle submit oper
  const handleSubmitOper = (e) => {
    e.preventDefault();
    updateDataOper(form_id.id);
  };

  const updateDataOper = async (id) => {
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
          catatan,
          sasaran,
          tujuan,
          oper: {
            tanggal: tanggalOper,
            waktu: parseInt(waktuOper),
            process: [
              ...(oper.process || []),
              {
                status: parseInt(statusOper),
                user: userlimaes.fullname,
                jabatan: userlimaes.bagianlimaes.jabatan,
                catatan: catatanOper,
              },
            ],
          },
        },
      );
      dispatch(
        setNotification({ message: "Data updated", background: "bg-teal-100" }),
      );
      closeModalOper();
      findDataOperProcessStatus0();
      findDataOperProcessStatus1();
      findDataOperProcessStatus2();
    } catch (e) {
      const arrError = e?.response?.data?.error?.split(",") ?? [
        "Terjadi kesalahan",
      ];
      setErrForm(arrError);
    }
  };

  // data with status 0
  const [dataStatus0, setDataStatus0] = useState([]);
  const findDataOperProcessStatus0 = async () => {
    try {
      const filter = {
        lokasi_unit: [userlimaes.bagianlimaes.unit],
        operStatus: [0],
        status: [0],
        ...(userlimaes.users.role === "user" &&
          !userlimaes.bagianlimaes.jabatan.includes("tl") && {
            lokasi_area: [userlimaes.bagianlimaes.area],
            operUser: [userlimaes.fullname],
            // operJabatan: [userlimaes.bagianlimaes.jabatan],
          }),
        ...(userlimaes.users.role === "user" &&
          userlimaes.bagianlimaes.jabatan.includes("tl") && {
            operJabatan: [
              userlimaes.bagianlimaes.bawahan,
              userlimaes.bagianlimaes.jabatan,
            ],
          }),
        sortBy: "tanggal",
        order: "desc",
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
    if (userlimaes) findDataOperProcessStatus0();
  }, [userlimaes]);

  // data with status 1
  const [dataStatus1, setDataStatus1] = useState([]);
  const findDataOperProcessStatus1 = async () => {
    try {
      const filter = {
        lokasi_unit: [userlimaes.bagianlimaes.unit],
        operStatus: [1],
        status: [0],
        ...(userlimaes.users.role === "user" &&
          !userlimaes.bagianlimaes.jabatan.includes("tl") && {
            lokasi_area: [userlimaes.bagianlimaes.area],
            operJabatan: [userlimaes.bagianlimaes.atasan],
          }),
        sortBy: "tanggal",
        order: "desc",
      };

      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes/aggregate`,
        filter,
      );

      setDataStatus1(scheduleRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userlimaes) findDataOperProcessStatus1();
  }, [userlimaes]);

  // data with status 2
  const [dataStatus2, setDataStatus2] = useState([]);
  const findDataOperProcessStatus2 = async () => {
    try {
      const filter = {
        lokasi_unit: [userlimaes.bagianlimaes.unit],
        operStatus: [2],
        status: [0],
        ...(userlimaes.users.role === "user" &&
          !userlimaes.bagianlimaes.jabatan.includes("tl") && {
            lokasi_area: [userlimaes.bagianlimaes.area],
          }),
        ...(userlimaes.users.role === "user" &&
          userlimaes.bagianlimaes.jabatan.includes("tl") && {
            operUser: [userlimaes.fullname],
            operJabatan: [userlimaes.bagianlimaes.jabatan],
          }),
        sortBy: "tanggal",
        order: "desc",
      };

      const scheduleRes = await axiosInterceptors.post(
        `/${import.meta.env.VITE_APP_NAME}/${import.meta.env.VITE_APP_VERSION}/schedules-limaes/aggregate`,
        filter,
      );

      setDataStatus2(scheduleRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userlimaes) findDataOperProcessStatus2();
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
            Oper
          </p>

          {/* box untuk multi card schedule limaes, overflow-x scroll. di box ini terdapat multi card nya */}

          {/* DIAJUKAN */}
          <div className="ml-2 flex">
            <div className="h-28 w-6 rounded-l-lg bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-200">
              <p className="flex h-full -rotate-90 transform flex-row items-center justify-center font-bold">
                DIAJUKAN
              </p>
            </div>
            <div className="mb-4 flex min-h-36 w-full gap-4 overflow-x-auto rounded-lg rounded-tl-none border border-amber-700 bg-amber-50 p-4">
              {dataStatus0.length > 0 ? (
                dataStatus0.map((schedule) => (
                  <div
                    key={`${schedule._id}-${schedule.createdAt}`}
                    // onClick={() => handleUpdate(schedule._id)}
                    className="relative min-w-[280px] rounded-xl border border-slate-300 bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:shadow-lg"
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
                        {new Date(schedule.tanggal).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
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
                              <li key={`${schedule._id}-tujuan-${idx}`}>
                                {tuj}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-gradient-to-tr from-amber-50 to-yellow-100 p-3 shadow-sm">
                        <b>DETAIL OPER</b>
                        <p>
                          <span className="font-medium text-slate-700">
                            tanggal :{" "}
                          </span>
                          {new Date(schedule.oper?.tanggal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">
                            Waktu :{" "}
                          </span>
                          {schedule.oper?.waktu === 1 && "shift pagi"}
                          {schedule.oper?.waktu === 2 && "shift sore"}
                          {schedule.oper?.waktu === 3 && "shift malam"}
                        </p>
                        <div>
                          <span className="font-medium text-slate-700">
                            Progress :{" "}
                          </span>
                          {schedule.oper.process &&
                            schedule.oper.process.length > 0 && (
                              <ul className="list-disc pl-5 text-xs">
                                {schedule.oper.process.map((proc, idx) => (
                                  <li key={`${schedule._id}-oper-${idx}`}>
                                    {proc.user} &raquo; {proc.catatan}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      </div>
                    </div>
                    {/* Verify Button */}
                    {/* jabatan includes tl, show button */}
                    {userlimaes.users.role === "user" &&
                      userlimaes.bagianlimaes.jabatan.includes("tl") && (
                        <>
                          <div className="mt-10" />
                          <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 gap-2 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                setStatusOper(1);
                                setShowInputTanggalAndWaktuOper(true);
                                handleOper(schedule._id);
                              }}
                              className="w-full rounded-md bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-200 p-2 text-sm font-semibold hover:text-amber-700"
                            >
                              Verify
                            </button>
                          </div>
                        </>
                      )}
                  </div>
                ))
              ) : (
                <p className="col-span-full mt-10 w-full text-center text-lg text-slate-500">
                  tidak ada data
                </p>
              )}
            </div>
          </div>

          {/* DISETUJUI */}
          <div className="ml-2 flex">
            <div className="h-28 w-6 rounded-l-lg bg-gradient-to-t from-green-500 via-emerald-400 to-green-200">
              <p className="flex h-full -rotate-90 transform flex-row items-center justify-center font-bold">
                DISETUJUI
              </p>
            </div>
            <div className="mb-4 flex min-h-36 w-full gap-4 overflow-x-auto rounded-lg rounded-tl-none border border-green-700 bg-green-50 p-4">
              {dataStatus1.length > 0 ? (
                dataStatus1.map((schedule) => (
                  <div
                    key={`${schedule._id}-${schedule.createdAt}`}
                    // onClick={() => handleUpdate(schedule._id)}
                    className="relative min-w-[280px] rounded-xl border border-slate-300 bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:shadow-lg"
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
                        {new Date(schedule.tanggal).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
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
                              <li key={`${schedule._id}-tujuan-${idx}`}>
                                {tuj}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="rounded-lg border border-green-200 bg-gradient-to-tr from-green-50 to-teal-100 p-3 shadow-sm">
                        <b>DETAIL OPER</b>
                        <p>
                          <span className="font-medium text-slate-700">
                            tanggal :{" "}
                          </span>
                          {new Date(schedule.oper?.tanggal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">
                            Waktu :{" "}
                          </span>
                          {schedule.oper?.waktu === 1 && "shift pagi"}
                          {schedule.oper?.waktu === 2 && "shift sore"}
                          {schedule.oper?.waktu === 3 && "shift malam"}
                        </p>
                        <div>
                          <span className="font-medium text-slate-700">
                            Progress :{" "}
                          </span>
                          {schedule.oper.process &&
                            schedule.oper.process.length > 0 && (
                              <ul className="list-disc pl-5 text-xs">
                                {schedule.oper.process.map((proc, idx) => (
                                  <li key={`${schedule._id}-oper-${idx}`}>
                                    {proc.user} &raquo; {proc.catatan}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      </div>
                    </div>
                    {/* Terima Button */}
                    {/* jabatan includes tl, show button */}
                    {userlimaes.users.role === "user" &&
                      userlimaes.bagianlimaes.jabatan.includes("tl") && (
                        <>
                          <div className="mt-10"></div>
                          <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 gap-2 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                setStatusOper(2);
                                setShowInputTanggalAndWaktuOper(false);
                                handleOper(schedule._id);
                              }}
                              className="w-1/2 rounded-md bg-gradient-to-r from-green-500 via-emerald-400 to-green-200 p-2 text-sm font-semibold hover:text-green-700"
                            >
                              Terima
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStatusOper(1);
                                setShowInputTanggalAndWaktuOper(true);
                                handleOper(schedule._id);
                              }}
                              className="w-1/2 rounded-md bg-amber-500 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 p-2 text-sm font-semibold hover:text-amber-700"
                            >
                              Reschedule
                            </button>
                          </div>
                        </>
                      )}
                  </div>
                ))
              ) : (
                <p className="col-span-full mt-10 w-full text-center text-lg text-slate-500">
                  tidak ada data
                </p>
              )}
            </div>
          </div>

          {/* DITERIMA */}
          <div className="ml-2 flex">
            <div className="h-28 w-6 rounded-l-lg bg-gradient-to-t from-blue-500 via-blue-400 to-cyan-200">
              <p className="flex h-full -rotate-90 transform flex-row items-center justify-center font-bold">
                DITERIMA
              </p>
            </div>
            <div className="mb-4 flex min-h-36 w-full gap-4 overflow-x-auto rounded-lg rounded-tl-none border border-blue-700 bg-blue-50 p-4">
              {dataStatus2.length > 0 ? (
                dataStatus2.map((schedule) => (
                  <div
                    key={`${schedule._id}-${schedule.createdAt}`}
                    // onClick={() => handleUpdate(schedule._id)}
                    className="relative min-w-[280px] rounded-xl border border-slate-300 bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:shadow-lg"
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
                        {new Date(schedule.tanggal).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
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
                              <li key={`${schedule._id}-tujuan-${idx}`}>
                                {tuj}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="rounded-lg border border-blue-200 bg-gradient-to-tr from-blue-50 to-cyan-100 p-3 shadow-sm">
                        <b>DETAIL OPER</b>
                        <p>
                          <span className="font-medium text-slate-700">
                            tanggal :{" "}
                          </span>
                          {new Date(schedule.oper?.tanggal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">
                            Waktu :{" "}
                          </span>
                          {schedule.oper?.waktu === 1 && "shift pagi"}
                          {schedule.oper?.waktu === 2 && "shift sore"}
                          {schedule.oper?.waktu === 3 && "shift malam"}
                        </p>
                        <div>
                          <span className="font-medium text-slate-700">
                            Progress :{" "}
                          </span>
                          {schedule.oper.process &&
                            schedule.oper.process.length > 0 && (
                              <ul className="list-disc pl-5 text-xs">
                                {schedule.oper.process.map((proc, idx) => (
                                  <li key={`${schedule._id}-oper-${idx}`}>
                                    {proc.user} &raquo; {proc.catatan}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      </div>
                    </div>
                    {/* Laksanakan / Oper Button */}
                    {/* jabatan not includes tl, show button */}
                    {userlimaes.users.role === "user" &&
                      !userlimaes.bagianlimaes.jabatan.includes("tl") &&
                      schedule.oper.process &&
                      schedule.oper.process.length > 0 &&
                      schedule.oper.process[schedule.oper.process.length - 1]
                        .jabatan === userlimaes.bagianlimaes.atasan && (
                        <>
                          <div className="mt-10"></div>
                          <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 gap-2 px-4">
                            <button
                              type="button"
                              onClick={() => handleUpdate(schedule._id)}
                              className="w-1/2 rounded-md bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-200 p-2 text-sm font-semibold hover:text-blue-700"
                            >
                              Laksanakan
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStatusOper(0);
                                setShowInputTanggalAndWaktuOper(true);
                                handleOper(schedule._id);
                              }}
                              className="w-1/2 rounded-md bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-200 p-2 text-sm font-semibold hover:text-amber-700"
                            >
                              Oper
                            </button>
                          </div>
                        </>
                      )}
                  </div>
                ))
              ) : (
                <p className="col-span-full mt-10 w-full text-center text-lg text-slate-500">
                  tidak ada data
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* modal update */}
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

      {/* modal oper */}
      {showModalOper && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-lg bg-white shadow-lg shadow-teal-100 md:w-[80%] lg:w-[50%]">
            {/* Header */}
            <p className="mb-2 border-b-2 border-teal-700 py-2 text-center text-base font-semibold text-teal-700">
              input data operan
            </p>
            <button
              onClick={closeModalOper}
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

              <form onSubmit={handleSubmitOper} className="space-y-4">
                {showInputTanggalAndWaktuOper && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-teal-700">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        value={tanggalOper || ""}
                        onChange={(e) => setTanggalOper(e.target.value)}
                        className="w-full rounded border border-teal-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teal-700">
                        Waktu
                      </label>
                      <select
                        value={waktuOper || ""}
                        onChange={(e) => setWaktuOper(e.target.value)}
                        className="w-full rounded border border-teal-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="">...</option>
                        <option value="1">Shift pagi</option>
                        <option value="2">Shift sore</option>
                        <option value="3">Shift malam</option>
                      </select>
                    </div>
                  </>
                )}
                {/* catatan */}
                <div>
                  <label className="block text-sm font-medium text-teal-700">
                    Catatan
                  </label>
                  <textarea
                    value={catatanOper || ""}
                    onChange={(e) => setCatatanOper(e.target.value)}
                    className="w-full rounded border border-teal-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    rows="3"
                  />
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

export default Oper;
