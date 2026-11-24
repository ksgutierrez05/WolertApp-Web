import { listarSemaforos } from "./semaforosDirectorService";
import { listarUnidadesDirector, listarAlertasDirector, tipoCaso, normalizar } from "./directorTransitoService";
export async function cargarSemaforosMapa(){return listarSemaforos();}
export async function cargarGruposMapa(){return (await listarUnidadesDirector()).map(u=>({...u,idGrupo:u.idUnidadTransito??u.idUnidad??u.id}));}
export async function cargarAlertasSemaforosMapa(){return (await listarAlertasDirector()).filter(a=>normalizar(tipoCaso(a)).includes("SEMAFORO")).map(a=>({...a,tipo:tipoCaso(a)}));}
