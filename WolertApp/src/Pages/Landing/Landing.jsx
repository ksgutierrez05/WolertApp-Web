import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../../css/landing/styles.css";

export default function Landing() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const all = (s) => [...root.querySelectorAll(s)];
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clean = [];
    const listen = (el, event, fn, opts) => {
      el.addEventListener(event, fn, opts);
      clean.push(() => el.removeEventListener(event, fn, opts));
    };
    const header = root.querySelector("header"),
      bar = root.querySelector(".progress");
    const scroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
      bar.style.transform = `scaleX(${window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)})`;
      let current = "";
      all("main section[id]").forEach((s) => {
        if (s.getBoundingClientRect().top < window.innerHeight * 0.4)
          current = "#" + s.id;
      });
      all(".links a").forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === current),
      );
    };
    listen(window, "scroll", scroll, { passive: true });
    scroll();
    const reveal = all(
      ".strip-item,.head,.bento>*,.step,.maya,.map-box,.coverage>div:last-child,.security-grid>*",
    );
    if ("IntersectionObserver" in window && !calm) {
      root.classList.add("js");
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in", "draw");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.12 },
      );
      reveal.forEach((el) => {
        el.classList.add("reveal");
        el.style.setProperty(
          "--d",
          ([...el.parentElement.children].indexOf(el) % 5) * 0.1 + "s",
        );
        io.observe(el);
      });
      all(".steps").forEach((el) => io.observe(el));
      clean.push(() => io.disconnect());
    } else all(".steps").forEach((el) => el.classList.add("draw"));
    all(".tile,.step").forEach((el) =>
      listen(el, "pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", e.clientX - r.left + "px");
        el.style.setProperty("--y", e.clientY - r.top + "px");
      }),
    );
    const v = root.querySelector(".hero-visual");
    if (!calm && window.matchMedia("(hover:hover)").matches) {
      listen(v, "pointermove", (e) => {
        const r = v.getBoundingClientRect();
        v.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 7}deg) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -7}deg)`;
      });
      listen(v, "pointerleave", () => {
        v.style.transform = "";
      });
    }
    const items = all(".feed-item");
    let i = 0;
    if (items.length) {
      items[0].classList.add("on");
      if (!calm) {
        const timer = setInterval(() => {
          items[i].classList.remove("on");
          i = (i + 1) % items.length;
          items[i].classList.add("on");
        }, 2000);
        clean.push(() => clearInterval(timer));
      }
    }
    return () => {
      clean.forEach((fn) => fn());
      root.classList.remove("js");
      reveal.forEach((el) => el.classList.remove("reveal", "in", "draw"));
      items.forEach((el) => el.classList.remove("on"));
    };
  }, []);
  return (
    <div className="landing-shell" ref={ref}>
      <div className="progress" aria-hidden="true"></div>
      <header>
        <nav className="wrap">
          <a className="brand" href="#inicio">
            <img
              alt="Logo WolertApp"
              height="68"
              src="/img/logo.png"
              style={{ objectFit: "contain" }}
              width="68"
            />
            {"\n        WolertApp\n      "}
          </a>
          <div className="links">
            <a href="#producto">{"Plataforma"}</a>
            <a href="#proceso">{"Cómo funciona"}</a>
            <a href="#cobertura">{"Cobertura"}</a>
            <a href="#seguridad">{"Seguridad"}</a>
          </div>
          <Link className="btn" to="/login">
            {"Iniciar sesión ↗"}
          </Link>
        </nav>
      </header>
      <main>
        <section className="hero" id="inicio">
          <span className="blob b1"></span>
          <span className="blob b2"></span>
          <span className="blob b3"></span>
          <div className="wrap hero-grid">
            <div>
              <span className="badge">
                {"● Tecnología ciudadana · Valledupar"}
              </span>
              <h1>
                {"Alarmas comunitarias"}
                <br />
                <span>{"en la palma de tu mano."}</span>
              </h1>
              <p>
                {
                  "Tu barrio se cuida entre todos. Activa o recibe alertas sobre eventos importantes en tu comunidad de manera rápida y sencilla. Inicia sesión para acceder a tu rol."
                }
              </p>
              <div className="actions">
                <a className="btn" href="#producto">
                  {"Conoce WolertApp ↗"}
                </a>
                <a className="btn outline" href="#proceso">
                  {"Cómo funciona"}
                </a>
              </div>
            </div>
            <div className="stage">
              <div className="radar" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div className="hero-visual">
                <div className="floating-alert">
                  <span className="pulse"></span>
                  <div>
                    <strong style={{ fontSize: "13px", display: "block" }}>
                      {"WolertApp · Valledupar"}
                    </strong>
                    <small style={{ color: "#52627f", fontSize: "12px" }}>
                      {"Conexión ciudadana"}
                    </small>
                  </div>
                  <span className="bell">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      fill="currentColor"
                      className="bi bi-bell"
                      viewBox="0 0 16 16"
                    >
                      {" "}
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />{" "}
                    </svg>
                  </span>
                </div>

                <img
                  alt="Vista aérea de Valledupar"
                  src="/img/Valledupar.jpg"
                />
                <div className="hero-caption">
                  <strong style={{ fontSize: "18px", display: "block" }}>
                    {"Valledupar, Cesar"}
                  </strong>
                  <small>{"Tecnología al servicio de la comunidad"}</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="strip">
          <div className="wrap strip-grid">
            <div className="strip-item">
              <span>{"✓"}</span>
              {" Privacidad de datos"}
            </div>
            <div className="strip-item">
              <span>{"✓"}</span>
              {" Alertas en tiempo real"}
            </div>
            <div className="strip-item">
              <span>{"✓"}</span>
              {" Acceso por rol"}
            </div>
            <div className="strip-item">
              <span>{"✓"}</span>
              {" Historial y seguimiento"}
            </div>
          </div>
        </div>

        <section className="section" id="producto">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow">{"Plataforma"}</span>
                <h2>
                  {"Todo lo que necesitas para mantener tu comunidad segura"}
                </h2>
              </div>
              <p>
                {
                  "Desde el primer reporte hasta el seguimiento, WolertApp acompaña cada paso del proceso."
                }
              </p>
            </div>
            <div className="bento">
              <div className="tile big">
                <div>
                  <div className="ico">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      fill="currentColor"
                      className="bi bi-bell"
                      viewBox="0 0 16 16"
                    >
                      {" "}
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />{" "}
                    </svg>
                  </div>
                  <h3>{"Alertas en tiempo real"}</h3>
                  <p>
                    {
                      "Recibe notificaciones sobre eventos importantes cerca de ti."
                    }
                  </p>
                </div>
                <div className="feed">
                  <small>{"ACTIVIDAD DE EJEMPLO"}</small>
                  <div className="feed-item">
                    <span className="dot-warn"></span>
                    {"Alarma comunitaria"}
                  </div>
                  <div className="feed-item">
                    <span className="dot-warn"></span>
                    {"Actividad sospechosa"}
                  </div>
                  <div className="feed-item">
                    <span className="dot-ok"></span>
                    {"Situación atendida"}
                  </div>
                </div>
              </div>
              <div className="tile">
                <div className="ico">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    className="bi bi-shield-lock"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56" />{" "}
                    <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415" />{" "}
                  </svg>
                </div>
                <h3>{"Privacidad de datos"}</h3>
                <p>
                  {
                    "Acceso a la información según los permisos de cada usuario."
                  }
                </p>
              </div>
              <div className="tile">
                <div className="ico">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    className="bi bi-person-badge"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />{" "}
                    <path d="M4.5 0A2.5 2.5 0 0 0 2 2.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2.5A2.5 2.5 0 0 0 11.5 0zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v10.795a4.2 4.2 0 0 0-.776-.492C11.392 12.387 10.063 12 8 12s-3.392.387-4.224.803a4.2 4.2 0 0 0-.776.492z" />{" "}
                  </svg>
                </div>
                <h3>{"Asignaciones"}</h3>
                <p>
                  {
                    "Los usuarios con roles específicos acceden a las funcionalidades correspondientes."
                  }
                </p>
              </div>
              <div className="tile">
                <div className="ico">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    className="bi bi-clock-history"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />{" "}
                    <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />{" "}
                    <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />{" "}
                  </svg>
                </div>
                <h3>{"Historial de alertas"}</h3>
                <p>{"Consulta los eventos reportados y su seguimiento."}</p>
              </div>
              <div className="tile">
                <div className="ico">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    className="bi bi-map"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path
                      fillRule="evenodd"
                      d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"
                    />{" "}
                  </svg>
                </div>
                <h3>{"Mapa de alertas"}</h3>
                <p>
                  {
                    "Visualiza dónde ocurren los eventos desde tu barrio hasta el mapa de la ciudad."
                  }
                </p>
              </div>
              <div className="tile wide">
                <div className="ico">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    className="bi bi-geo-alt"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />{" "}
                    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />{" "}
                  </svg>
                </div>
                <h3>{"Alertas por barrio"}</h3>
                <p>{"Consulta las alertas y alarmas asociadas a tu zona."}</p>
              </div>
              <div className="alarm-banner">
                <div>
                  <h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      fill="currentColor"
                      className="bi bi-bell-fill"
                      viewBox="0 0 16 16"
                    >
                      {" "}
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />{" "}
                    </svg>
                    {" Alarmas comunitarias"}
                  </h3>
                  <p>
                    {"Recibe avisos sobre eventos importantes en tu comunidad."}
                  </p>
                </div>
                <a className="btn" href="#cobertura">
                  {"Conoce la cobertura →"}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section process" id="proceso">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow">{"Cómo funciona"}</span>
                <h2>{"Cinco pasos simples para empezar"}</h2>
              </div>
            </div>
            <div className="steps">
              <div className="step">
                <span className="step-num">{"01"}</span>
                <h3>{"Regístrate"}</h3>
                <p>
                  {"Crea tu cuenta en un par de minutos, sin complicaciones."}
                </p>
              </div>
              <div className="step">
                <span className="step-num">{"02"}</span>
                <h3>{"Roles"}</h3>
                <p>{"Accede a las funciones correspondientes a tu rol."}</p>
              </div>
              <div className="step">
                <span className="step-num">{"03"}</span>
                <h3>{"Gestiona alertas"}</h3>
                <p>
                  {
                    "Recibe o genera notificaciones sobre eventos importantes en tu comunidad."
                  }
                </p>
              </div>
              <div className="step">
                <span className="step-num">{"04"}</span>
                <h3>{"Colabora"}</h3>
                <p>
                  {
                    "Participa en la mejora de tu comunidad al compartir información relevante."
                  }
                </p>
              </div>
              <div className="step">
                <span className="step-num">{"05"}</span>
                <h3>{"Gestiona"}</h3>
                <p>{"Accede a un historial de alertas y reportes."}</p>
              </div>
            </div>
            <div className="maya">
              <div className="maya-ring">
                <img
                  alt="Maya, mascota de WolertApp"
                  src="/img/maya.png"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="cobertura">
          <div className="wrap coverage">
            <div className="map-box">
              <img
                alt="Mapa de Valledupar"
                src="/img/MapaValledupar.png"
              />
            </div>
            <div>
              <span className="eyebrow">{"Despliegue territorial"}</span>
              <h2>{"Dónde está presente WolertApp"}</h2>
              <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>
                {
                  "WolertApp está diseñado para Valledupar, con una propuesta de expansión a más ciudades."
                }
              </p>
              <div className="tags">
                <span className="tag">{"Valledupar"}</span>
                <span className="tag">{"Bogotá · propuesta futura"}</span>
                <span className="tag">{"Barranquilla · propuesta futura"}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="section process" id="seguridad">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow">{"Confianza"}</span>
                <h2>{"Seguridad y privacidad"}</h2>
              </div>
              <p>
                {
                  "Diseñamos WolertApp para gestionar alertas con acceso según el rol."
                }
              </p>
            </div>
            <div className="security-grid">
              <div className="tile">
                <div className="ico">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    className="bi bi-shield-lock"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56" />{" "}
                    <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415" />{" "}
                  </svg>
                </div>
                <h3>{"Registros de usuarios"}</h3>
                <p>
                  {
                    "La información de los usuarios se gestiona según los permisos de acceso."
                  }
                </p>
              </div>
              <div className="tile">
                <div className="ico">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    className="bi bi-person-lock"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 5.996V14H3s-1 0-1-1 1-4 6-4q.845.002 1.544.107a4.5 4.5 0 0 0-.803.918A11 11 0 0 0 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664zM9 13a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1" />{" "}
                  </svg>
                </div>
                <h3>{"Control de datos"}</h3>
                <p>
                  {
                    "La plataforma contempla la privacidad y el acceso autorizado a la información."
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <strong>{"WolertApp · Valledupar, Cesar"}</strong>
          <small>
            {
              "Alarmas comunitarias para mantener a tu ciudad conectada y segura. · © 2026"
            }
          </small>
          <a href="#producto">{"Funcionalidades"}</a>
          <a href="#seguridad">{"Seguridad y privacidad"}</a>
        </div>
      </footer>
    </div>
  );
}
