import { useState } from "react";
import { axiosDefault } from "../config/axios.js";
import { useDispatch } from "react-redux";
import { setToken, setExpire, setUsername } from "../redux/tokenSlice.js";
import { setNotification } from "../redux/notificationSlice.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errForm, setErrForm] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosDefault.post("/login", { email, password });

      const decoded = jwtDecode(response.data);
      dispatch(setToken(response.data));
      dispatch(setExpire(decoded.exp));
      dispatch(setUsername(decoded.email));
      dispatch(
        setNotification({
          message: "logged in",
          background: "bg-teal-100",
        }),
      );
      closeModal();
      navigate("/");
    } catch (e) {
      const arrError = e.response.data.error.split(",");
      setErrForm(arrError);
    }
  };

  const closeModal = () => {
    setErrForm(null);
    setEmail("");
    setPassword("");
  };

  const back = () => {
    closeModal();
    navigate("/");
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-80">
        <div className="relative w-[95%] rounded-md bg-white p-2 shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
          <p className="mb-2 border-b border-teal-700 text-center">Login</p>
          <button
            onClick={back}
            className="absolute -right-1 -top-1 rounded bg-red-700 px-1 text-white"
          >
            x
          </button>
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
              placeholder="email"
              className="mb-1 w-full rounded-md border p-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              className="mb-1 w-full rounded-md border p-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="mb-1 w-full rounded-md border bg-teal-300 p-1"
            >
              submit
            </button>
          </form>
          <button
            onClick={() => navigate("/forgot-password")}
            className="rounded bg-orange-500 p-0.5 text-xs text-white"
          >
            Forgot password
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
