import { useState, useEffect } from "react";
import { axiosDefault } from "../config/axios.js";
import { useDispatch } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { useNavigate, useParams } from "react-router-dom";
import { setBottombarBackward } from "../redux/barSlice.js";

const ActivationUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bbarBackward = useSelector((state) => state.bar.bottombarBackward);

  const { email } = useParams();

  const [activationToken, setActivationToken] = useState("");
  const [errForm, setErrForm] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosDefault.patch(`/activation-user/${email}`, {
        activationToken,
      });

      dispatch(
        setNotification({
          message: response.data.message,
          background: "bg-teal-100",
        }),
      );

      closeModal();
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      setErrForm(arrError);
    }
  };

  const [showModal, setShowModal] = useState(true);

  const closeModal = () => {
    setShowModal(false);
    setErrForm(null);
    setActivationToken("");
    navigate("/");
    dispatch(setBottombarBackward(false));
  };

  useEffect(() => {
    !bbarBackward && dispatch(setBottombarBackward(true));
  }, [bbarBackward]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] max-w-md rounded-lg bg-white p-6 shadow-lg shadow-teal-100">
            {/* Header */}
            <p className="mb-4 border-b border-teal-700 pb-2 text-center text-base font-semibold text-teal-700">
              Activation User
            </p>
            <button
              onClick={closeModal}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-1 text-sm text-white shadow hover:bg-red-700"
            >
              ✕
            </button>

            {/* Error */}
            {errForm && (
              <div className="mb-3 rounded border border-red-700 bg-red-50 p-2 text-xs italic text-red-700">
                {errForm.map((err, index) => (
                  <p key={index}>{err}</p>
                ))}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Activation Token"
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                value={activationToken}
                onChange={(e) => setActivationToken(e.target.value)}
              />
              <button
                type="submit"
                className="w-full rounded-md bg-teal-500 p-2 text-sm font-semibold text-white hover:bg-teal-600"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivationUser;
