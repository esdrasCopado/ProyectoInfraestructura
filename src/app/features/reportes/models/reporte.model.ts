export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  ip?: string;
  agrupacion?: string;
}

export interface FilaBase {
  folioSolicitud: string;
  dependencia: string;
  responsable: string;
  contacto: string;
  estatusProcesamieto: string;
  fechaCreacion: string;
}

export interface FilaConServidor extends FilaBase {
  ipServidor: string;
  administradorServidor: string;
  descripcionProyecto: string;
  sistemaOperativo: string;
  vcpu: number;
  ram: number;
  almacenamiento: number;
}

// 1.1 Solicitudes por dependencia
export type Reporte11Fila = FilaBase;

// 1.2 Recursos solicitados totalizados
export type Reporte12Fila = FilaConServidor;

export interface Reporte12Response {
  items: Reporte12Fila[];
  totalVcpu: number;
  totalRam: number;
  totalAlmacenamiento: number;
}

// 1.3 Por IP
export interface Reporte13Fila extends FilaConServidor {
  subdominioAprobado: string;
  vpns: string;
}

// 2.1 VPN
export interface Reporte21Fila {
  folioSolicitud: string;
  folioVpn: string;
  hostname: string;
  responsable: string;
  tipo: string;
  fechaAsignacion: string;
}

// 2.2 Subdominios
export interface Reporte22Fila {
  folio: string;
  sectorDependencia: string;
  responsableServidor: string;
  contacto: string;
  estatus: string;
  ipServidor: string;
  subdominioAprobado: string;
  proxyAsignado: string;
  tipoDespliegue: string;
  puertoPublicacion: string;
}

// 3.1 Vulnerabilidades
export interface Reporte31Fila {
  folio: string;
  sectorDependencia: string;
  responsableServidor: string;
  telefonoContacto: string;
  correoContacto: string;
  estatus: string;
  ipServidor: string;
  subdominioAprobado: string;
  fechaSolicitudAnalisis: string;
  fechaAplicacionPrueba: string;
  resultadoPrueba: string;
}

// 3.2 Comunicaciones y aplicativos por IP
export interface Reporte32Fila {
  folio: string;
  sectorDependencia: string;
  responsableServidor: string;
  contacto: string;
  estatus: string;
  ipServidor: string;
  subdominioAprobado: string;
  tipoDespliegue: string;
  puertosSolicitados: string;
  reglasFirewall: string;
  integraciones: string;
  otras: string;
}

// 4.1 Estatus de solicitudes
export interface Reporte41Fila {
  sector: string;
  dependencia: string;
  responsable: string;
  correo: string;
  descripcionServidor: string;
  ip: string;
  fechaSolicitud: string;
  estatus: string;
  fechaProcesamiento: string;
  rolResponsable: string;
  fechaPublicacion: string;
  tipoDespliegue: string;
}

// 4.2 Recursos totalizados general
export interface Reporte42Fila extends FilaConServidor {
  subdominios: string;
  vpns: string;
}
