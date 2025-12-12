import { Provider } from "react-redux";
import store from "./redux/store.js";
import { Confirmation, Notification } from "./components/Alert.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Container from "./components/Container.jsx";
import Bottombar from "./components/Bottombar.jsx";
import RegisterUserLimaes from "./components/RegisterUserLimaes.jsx";

function App() {
  return (
    <>
      <Provider store={store}>
        <Topbar />
        <Sidebar />
        <Container />
        <Bottombar />
        <Notification />
        <Confirmation />
        <RegisterUserLimaes />
      </Provider>
    </>
  );
}

export default App;
