import { Outlet } from "react-router-dom";
import Home from "../../components/app/Home";

const HomePage = () => {
  return (
    <>
      <Home />
      <Outlet />
    </>
  );
};

export default HomePage;
