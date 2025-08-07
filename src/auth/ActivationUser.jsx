import { useState } from "react";
import { axiosDefault } from "../config/axios.js";
import { useDispatch } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { useNavigate, useParams } from "react-router-dom";

const ActivationUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  };

  return (
    <>
      {showModal && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
          <div className="relative w-[95%] rounded-md bg-white p-2 shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b border-teal-700 text-center">
              Activation user
            </p>

            {errForm && (
              <div className="mb-2 rounded border border-red-700 p-1 text-xs italic text-red-700">
                {errForm.map((err, index) => (
                  <p key={index}>{err}</p>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="token"
                className="mb-1 w-full rounded-md border p-1"
                value={activationToken}
                onChange={(e) => setActivationToken(e.target.value)}
              />
              <button
                type="submit"
                className="mb-1 w-full rounded-md border bg-teal-300 p-1"
              >
                submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivationUser;
