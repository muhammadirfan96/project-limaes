import Home from "../page/Home.jsx";
import Barang from "../page/Barang.jsx";
import TransaksiPembelian from "../page/TransaksiPembelian.jsx";
import TransaksiPenjualan from "../page/TransaksiPenjualan.jsx";
import Penjual from "../page/Penjual.jsx";
import Pembeli from "../page/Pembeli.jsx";
import Product from "../page/Product.jsx";
import NotFound from "../page/NotFound.jsx";
import Login from "../auth/Login.jsx";
import Register from "../auth/Register.jsx";
import ForgotPassword from "../auth/ForgotPassword.jsx";
import ActivationUser from "../auth/ActivationUser.jsx";
import ResetPassword from "../auth/ResetPassword.jsx";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Applications from "../page/Applications.jsx";

const Container = () => {
  const sbar = useSelector((state) => state.bar.sidebar);
  const bbar = useSelector((state) => state.bar.bottombar);

  return (
    <>
      <div
        className={`${
          sbar && "md:ml-52"
        } fixed left-0 right-0 top-0 mx-auto mt-[64px] overflow-x-auto pt-5 md:bottom-0 ${
          !bbar ? "bottom-20" : "bottom-0"
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manage" element={<Applications />} />
          <Route path="/barang" element={<Barang />} />
          <Route path="/transaksi-pembelian" element={<TransaksiPembelian />} />
          <Route path="/transaksi-penjualan" element={<TransaksiPenjualan />} />
          <Route path="/penjual" element={<Penjual />} />
          <Route path="/pembeli" element={<Pembeli />} />
          <Route path="/product" element={<Product />} />
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
