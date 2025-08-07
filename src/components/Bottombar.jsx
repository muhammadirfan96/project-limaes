import { BsSpeedometer, BsBasket, BsCaretRight } from "react-icons/bs";
import { AiOutlineShopping, AiOutlineStock } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { IoReceiptOutline, IoPeopleOutline } from "react-icons/io5";
import { IoIosPaperPlane } from "react-icons/io";
import { MdCompareArrows, MdOutlineStorage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setBottombar } from "../redux/barSlice.js";

const Bottombar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bbar = useSelector((state) => state.bar.bottombar);

  const menu = [
    {
      path: "gudang-controller",
      icon: <BsSpeedometer />,
      name: "manage",
    },
    {
      path: "inventori-barang",
      icon: <AiOutlineShopping />,
      name: "inventori",
    },
    {
      path: "lokasi-penyimpanan",
      icon: <MdOutlineStorage />,
      name: "lokasi",
    },
    {
      path: "penerimaan-barang",
      icon: <IoReceiptOutline />,
      name: "penerimaan",
    },
    {
      path: "pengiriman-barang",
      icon: <IoIosPaperPlane />,
      name: "pengiriman",
    },
    {
      path: "pergeseran-barang",
      icon: <MdCompareArrows />,
      name: "pergeseran",
    },
    {
      path: "stok-barang",
      icon: <AiOutlineStock />,
      name: "stok",
    },
    {
      path: "pemasok",
      icon: <IoPeopleOutline />,
      name: "pemasok",
    },
    {
      path: "pelanggan",
      icon: <FaUserFriends />,
      name: "pelanggan",
    },
  ];

  return (
    <>
      <div
        className={`${
          bbar && "-mb-[62px]"
        } fixed bottom-0 left-0 right-0 h-16 border-t-2 border-t-teal-700 bg-teal-300 transition-all md:hidden`}
      >
        <button
          onClick={() => dispatch(setBottombar())}
          className="absolute -top-[28px] right-0 rounded-tl-lg bg-teal-700 px-3 pt-1"
        >
          <span
            className={`${
              !bbar && "translate-x-2"
            } mr-0.5 inline-block h-4 rotate-45 rounded-sm border-2 border-white bg-white font-extrabold transition delay-500`}
          ></span>
          <span
            className={`${
              !bbar && "-translate-x-2"
            } ml-0.5 inline-block h-4 -rotate-45 rounded-sm border-2 border-black bg-black font-extrabold transition delay-500`}
          ></span>
        </button>

        <div className="flex w-full overflow-auto p-1 text-center transition-all">
          {menu.map((each) => (
            <button
              key={each.path}
              onClick={() => navigate(`/${each.path}`)}
              className="m-1 rounded-md bg-teal-700 p-1 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center">
                {each.icon}
              </div>
            </button>
          ))}

          <button
            onClick={() => navigate("/product")}
            className="m-1 rounded-md bg-teal-700 p-1 text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center">
              <BsBasket />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Bottombar;
