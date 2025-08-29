import { SiMongodb, SiExpress, SiReact, SiNodedotjs } from "react-icons/si";
import RegisterUserLimaes from "../components/RegisterUserLimaes";

const Home = () => {
  return (
    <>
      <RegisterUserLimaes />
      <div className="mx-auto flex w-64 justify-center border-4 border-green-900 p-2 text-6xl text-green-900">
        <SiMongodb className="mx-1" />
        <SiExpress className="mx-1" />
        <SiReact className="mx-1" />
        <SiNodedotjs className="mx-1" />
      </div>
      <div className="m-4 rounded bg-teal-300 p-4 text-center">
        <h1 className="text-2xl font-bold">Welcome to LimaES</h1>
        <p className="mt-2">This is a full-stack application built with:</p>
        <ul className="mt-2 list-inside list-disc">
          <li>MongoDB</li>
          <li>Express.js</li>
          <li>React.js</li>
          <li>Node.js</li>
        </ul>
        <p className="mt-4">Explore the application and enjoy your stay!</p>
      </div>
      <div className="m-4 rounded bg-blue-100 p-4 text-center">
        <p className="text-lg">This is the home page.</p>
        <p className="mt-2">
          Use the navigation bar to explore different sections.
        </p>
      </div>
      <div className="m-4 rounded bg-yellow-100 p-4 text-center">
        <p className="text-lg">
          For any issues or feedback, please contact the support team.
        </p>
      </div>
      <div className="m-4 rounded bg-gray-100 p-4 text-center">
        <p className="text-lg">Thank you for using LimaES!</p>
      </div>
      <div className="m-4 rounded bg-purple-100 p-4 text-center">
        <p className="text-lg">Enjoy your day!</p>
      </div>
      <div className="m-4 rounded bg-pink-100 p-4 text-center">
        <p className="text-lg">Stay tuned for more updates.</p>
      </div>
    </>
  );
};

export default Home;
