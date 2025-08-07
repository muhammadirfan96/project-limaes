import { IoReceiptOutline } from "react-icons/io5";
import { IoIosPaperPlane } from "react-icons/io";
import { MdCompareArrows } from "react-icons/md";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useSelector } from "react-redux";
import PembelianBarang from "../aplications/PembelianBarang";
import PenjualanBarang from "../aplications/PenjualanBarang";

const Applications = () => {
  const token = useSelector((state) => state.jwToken.token);
  return token ? (
    <>
      <div className="mt-2 flex flex-wrap justify-evenly gap-2">
        <div className="w-[95%]">
          {/*judul*/}
          <p className="mb-2 rounded bg-teal-300 p-1 text-center shadow">
            applications
          </p>
          <div className="flex flex-wrap justify-evenly gap-2">
            <PembelianBarang />
            <PenjualanBarang />
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="m-4 rounded bg-red-100 p-4 text-center">unauthorized</div>
  );
};

export default Applications;
