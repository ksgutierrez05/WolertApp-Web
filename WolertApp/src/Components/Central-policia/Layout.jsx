
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FeedbackProvider } from "../Feedback/FeedbackProvider";
import "../../css/Policia/ver-detalles.css";
import "../../css/Policia/central-policia/css/tipografia-central.css";

export default function Layout() {
  const location = useLocation();

  const esMapa = /\/mapa\/?$/i.test(location.pathname);

  useEffect(() => {
    document.body.classList.add("rol-policia");

    return () => {
      document.body.classList.remove("rol-policia");
    };
  }, []);

  return (
    <FeedbackProvider>
      <Sidebar />

      <div
        id="wrapperDash"
        className={esMapa ? "wrapper-mapa-central" : ""}
      >
        <main
          className={`main-dash ${esMapa ? "main-dash-mapa" : ""}`}
        >
          <div
            className={`container-fluid ${
              esMapa ? "container-mapa-central" : ""
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </FeedbackProvider>
  );
}
