import { useNavigate } from "react-router-dom";
import { TbError404 } from "react-icons/tb";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-84px)] w-full items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-100">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
          <TbError404 className="text-5xl text-teal-700" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-slate-800">
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-slate-600">
          Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        </p>

        {/* Divider */}
        <div className="my-6 h-px w-full bg-slate-200" />

        {/* Action */}
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-teal-600 px-6 py-2 font-semibold text-white shadow transition-all hover:bg-teal-700 hover:shadow-md active:scale-95"
        >
          Kembali ke Home
        </button>

        {/* Footer text */}
        <p className="mt-4 text-xs text-slate-400">Error 404 • Limaes System</p>
      </div>
    </div>
  );
};

export default NotFound;
