import { BsSpeedometer, BsBasket, BsCaretRight } from "react-icons/bs";
import { AiOutlineShopping, AiOutlineStock } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { IoReceiptOutline, IoPeopleOutline } from "react-icons/io5";
import { IoIosPaperPlane } from "react-icons/io";
import { MdCompareArrows, MdOutlineStorage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import { menu } from "../config/menu.jsx";
import useMenu from "../config/menu.jsx";

const Sidebar = () => {
  const menu = useMenu();
  const navigate = useNavigate();
  const sbar = useSelector((state) => state.bar.sidebar);

  function potongTeks(teks, batas = 8) {
    return teks.length > batas ? teks.slice(0, batas) + "..." : teks;
  }

  return (
    <>
      <div
        className={`${
          !sbar && "-ml-52"
        } fixed bottom-0 left-0 top-[64px] hidden w-52 overflow-auto border-r-2 border-teal-700 bg-teal-300 p-4 transition-all md:block`}
      >
        <div className="flex flex-col">
          {menu.map((each) => (
            <button
              key={each.path}
              onClick={() => navigate(`/${each.path}`)}
              className="relative m-1 rounded bg-teal-600 px-2 py-1 text-start text-white shadow hover:bg-teal-700"
            >
              <div className="mr-2 inline-block">{each.icon}</div>
              {potongTeks(each.name)}
              <BsCaretRight className="absolute right-1 top-2" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
