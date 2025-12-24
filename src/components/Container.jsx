import Home from "../page/Home.jsx";
import NotFound from "../page/NotFound.jsx";
import Login from "../auth/Login.jsx";
import Register from "../auth/Register.jsx";
import ForgotPassword from "../auth/ForgotPassword.jsx";
import ActivationUser from "../auth/ActivationUser.jsx";
import ResetPassword from "../auth/ResetPassword.jsx";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Activity from "../page/Activity.jsx";
import Schedule from "../page/Schedule.jsx";
import Approval from "../page/Approval.jsx";

const Container = () => {
  const sbar = useSelector((state) => state.bar.sidebar);
  const bbar = useSelector((state) => state.bar.bottombar);

  return (
    <>
      <div
        className={`${
          sbar && "md:ml-52"
        } fixed left-0 right-0 top-0 mx-auto mt-[64px] overflow-x-auto pt-5 md:bottom-0 ${
          !bbar ? "bottom-0" : "bottom-0"
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/activation-user/:email" element={<ActivationUser />} />
          <Route path="/reset-password/:email" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default Container;
