import { useEffect } from "react";
import { actualizarUbicacionPush } from "../Services/webPushService";

export default function SeguimientoPush({ children }) {
    useEffect(() => {
        let vigente = true;
        let procesando = false;

        async function actualizar() {
            if (!vigente || procesando ||
                document.visibilityState !== "visible") {
                return;
            }

            procesando = true;

            try {
                await actualizarUbicacionPush();
            } catch (error) {
                console.warn("WolertApp Push:", error.message);
            } finally {
                procesando = false;
            }
        }

        function alVolver() {
            if (document.visibilityState === "visible") {
                actualizar();
            }
        }

        actualizar();

        const intervalo = setInterval(actualizar, 300000);

        document.addEventListener(
            "visibilitychange",
            alVolver
        );

        return () => {
            vigente = false;
            clearInterval(intervalo);

            document.removeEventListener(
                "visibilitychange",
                alVolver
            );
        };
    }, []);

    return children;
}