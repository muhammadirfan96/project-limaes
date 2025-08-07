import { SiMongodb, SiExpress, SiReact, SiNodedotjs } from "react-icons/si";

const Home = () => {
  return (
    <>
      <div className="mx-auto flex w-64 justify-center border-4 border-green-900 p-2 text-6xl text-green-900">
        <SiMongodb className="mx-1" />
        <SiExpress className="mx-1" />
        <SiReact className="mx-1" />
        <SiNodedotjs className="mx-1" />
      </div>
    </>
  );
};

export default Home;
