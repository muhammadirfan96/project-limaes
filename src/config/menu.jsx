import { BsSpeedometer, BsBasket, BsCaretRight } from "react-icons/bs";
import { AiOutlineShopping, AiOutlineStock } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { IoReceiptOutline, IoPeopleOutline } from "react-icons/io5";
import { IoIosPaperPlane } from "react-icons/io";
import { MdCompareArrows, MdOutlineStorage } from "react-icons/md";

const menu = [
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
  // {
  //   path: "transaksi-penjualan",
  //   icon: <IoIosPaperPlane />,
  //   name: "t-penjualan",
  // },
  // {
  //   path: "penjual",
  //   icon: <IoPeopleOutline />,
  //   name: "penjual",
  // },
  // {
  //   path: "pembeli",
  //   icon: <FaUserFriends />,
  //   name: "pembeli",
  // },
  // {
  //   path: "product",
  //   icon: <BsBasket />,
  //   name: "product",
  // },
];

export { menu };
