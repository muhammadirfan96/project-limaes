import { useState, useEffect } from "react";
import { axiosRT } from "../config/axios.js";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";

const Approval = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.jwToken.token);
  const expire = useSelector((state) => state.jwToken.expire);
  const username = useSelector((state) => state.jwToken.username);
  const role = useSelector((state) => state.jwToken.role);
  const uid = useSelector((state) => state.jwToken.uid);

  const axiosInterceptors = axiosRT(token, expire, dispatch);

  return token ? (
    <>
      <div>Approval</div>
    </>
  ) : (
    <div className="m-4 rounded bg-red-100 p-4 text-center">unauthorized</div>
  );
};

export default Approval;
