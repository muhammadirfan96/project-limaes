import { BsSpeedometer, BsBasket } from "react-icons/bs";
import { AiOutlineShopping } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { IoReceiptOutline, IoPeopleOutline } from "react-icons/io5";
import { IoIosPaperPlane } from "react-icons/io";
import { MdCompareArrows, MdOutlineStorage } from "react-icons/md";
import { useSelector } from "react-redux";

// Semua daftar menu
const all_menu = [
  {
    path: "schedule",
    icon: <BsSpeedometer />,
    name: "schedule",
  },
  {
    path: "activity",
    icon: <AiOutlineShopping />,
    name: "activity",
  },
  {
    path: "approval",
    icon: <IoReceiptOutline />,
    name: "approval",
  },
];

// Custom Hook untuk filter menu berdasarkan role
const useMenu = () => {
  const role = useSelector((state) => state.jwToken.role);
  const token = useSelector((state) => state.jwToken.token);
  const userlimaes = useSelector((state) => state.userLimaes.data);

  // jika tidak ada token, kembalikan array kosong
  if (!token || !userlimaes) {
    return [];
  }

  // jika ada token, maka cek role. jika admin atau admin-punagaya, kembalikan semua menu
  if (role.includes("admin")) {
    return all_menu;
  } else {
    return all_menu.filter((item) => item.path !== "schedule");
  }

  // jika bukan admin atau admin-punagaya, kembalikan menu tanpa "schedule"
  // return all_menu.filter((item) => item.path !== "schedule");
};

export default useMenu;
