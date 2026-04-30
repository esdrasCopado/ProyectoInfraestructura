import { CartaAprovisionamiento } from '../../carta-aprovisionamiento/models/carta-aprovisionamiento.model';

export type EstadoEtapa = 'completada' | 'en-curso' | 'pendiente-respuesta' | 'sin-iniciar';
export type EstadoSolicitud = 'en-progreso' | 'pendiente' | 'completada';

export interface EtapaSolicitud {
  numero: number;
  nombre: string;
  estado: EstadoEtapa;
  fechaActualizacion?: string;
  responsable?: string;
  vCores?: number;
  memoriaRam?: number;
  almacenamiento?: number;
}

export interface VpnServidor {
  vpnType: string;
  responsable: string;
  cargo: string;
  phone: string;
  assignedAt: string;
}

export interface SubdominioServidor {
  requestedName: string;
  port: number;
  sslRequired: boolean;
  status: string;
  assignedAt: string;
}

export interface Solicitud {
  id: string;
  folio: string;
  dependencia: string;
  nombreServidor: string;
  servidorId?: string;
  estado: EstadoSolicitud;
  etapaActual: number;
  etapas: EtapaSolicitud[];
  fechaRegistro: string;
  fechaActualizacion: string;
  carta?: CartaAprovisionamiento;
  vpns?: VpnServidor[];
  subdominios?: SubdominioServidor[];
}

export interface DashboardMetricas {
  total: number;
  enProgreso: number;
  pendientes: number;
  completadas: number;
}

export interface DashboardResponse {
  solicitudes: Solicitud[];
  metricas: DashboardMetricas;
}
