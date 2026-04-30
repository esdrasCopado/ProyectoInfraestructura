import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, map, catchError, tap } from 'rxjs';
import { DashboardResponse, DashboardMetricas, Solicitud, EtapaSolicitud, EstadoSolicitud, VpnServidor, SubdominioServidor } from '../models/solicitud.model';
import { CartaAprovisionamiento, ContactoArea, AdminServidor, Descripcion, Specs, Infraestructura, Responsiva } from '../../carta-aprovisionamiento/models/carta-aprovisionamiento.model';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';
import { DASHBOARD_MOCK } from './dashboard.mock';

export interface DashboardFiltros {
  busqueda?: string;
  estado?: string;
  etapa?: number;
  pagina?: number;
  porPagina?: number;
}

// ── Interfaces del backend ────────────────────────────────────────────────────

interface ResumenBackend {
  total:           number;
  porEstatus:      { estatus: string; total: number }[];
  porTipoUso:      { tipoUso: string; total: number }[];
  topDependencias: { dependencia: string; total: number }[];
}

interface SolicitudBackend {
  id:               number;
  folio:            string;
  nombreAplicacion: string;
  estatus:          string;
  createdAt:        string;
  updatedAt:        string;
  servidor:         { hostname: string; etapaOperativa: string; [k: string]: any } | null;
  [k: string]:      any;
}

interface CartaBackend {
  id?:                        number;
  solicitudId?:               number;
  createdAt?:                 string;
  updatedAt?:                 string;
  firmaDependenciaAt?:        string;
  firmanteAtdtNombre?:        string;
  firmanteAtdtPuesto?:        string;
  firmanteDependenciaNombre?: string;
  firmanteDependenciaPuesto?: string;
  firmanteDependenciaEmpleado?: string;
  solicitud?: {
    id?:                      number;
    folio?:                   string;
    nombreServidor?:          string;
    nombreAplicacion?:        string;
    descripcionUso?:          string;
    tipoUso?:                 string;
    tipoRequerimiento?:       string;
    sistemaOperativo?:        string;
    vcpuSolicitado?:          number;
    ramSolicitadaGb?:         number;
    almacenamientoSolicitadoGb?: number;
    motorBaseDatos?:          string;
    reglasFirewall?:          string;
    integracionesExternas?:   string;
    conectividadOtras?:       string;
    fechaArranqueDeseada?:    string;
    vigenciaMeses?:           number;
    esClonacion?:             boolean;
    dependency?: {
      dependencyId?: number;
      sector?:       string;
      name?:         string;
      responsable?:  string;
      cargo?:        string;
      telefono?:     string;
      correo?:       string;
      [k: string]:   any;
    };
    [k: string]: any;
  };
}

// ── Definición canónica de etapas ─────────────────────────────────────────────
// Los nombres deben coincidir exactamente con los que devuelve el backend en etapaActual

export const ETAPAS_PROCESO: { numero: number; nombre: string }[] = [
  { numero: 1,  nombre: 'Carta responsiva'    },
  { numero: 2,  nombre: 'Validación recursos' },
  { numero: 3,  nombre: 'Creación servidor'   },
  { numero: 4,  nombre: 'Comunicaciones'      },
  { numero: 5,  nombre: 'Parches'             },
  { numero: 6,  nombre: 'XDR y agente'        },
  { numero: 7,  nombre: 'VPN'                 },
  { numero: 8,  nombre: 'Subdominio'          },
  { numero: 9,  nombre: 'Credenciales'        },
  { numero: 10, nombre: 'WAF'                 },
  { numero: 11, nombre: 'Evidencias'          },
  { numero: 12, nombre: 'Val. evidencias'     },
  { numero: 13, nombre: 'Sol. publicación'    },
  { numero: 14, nombre: 'Vulnerabilidades'    },
];

const ESTADO_MAP: Record<string, EstadoSolicitud> = {
  'Pendiente':  'pendiente',
  'En proceso': 'en-progreso',
  'En Proceso': 'en-progreso',
  'Terminado':  'completada',
  'Completado': 'completada',
};

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private solicitudUrl = `${environment.apiUrl}/solicitud`;
  private readonly useMock = environment.useMock;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  obtenerDashboard(filtros: DashboardFiltros = {}): Observable<DashboardResponse> {
    if (this.useMock) {
      return of(this.filtrarLocal(DASHBOARD_MOCK, filtros));
    }

    return forkJoin({
      resumen:     this.http.get<ResumenBackend>(`${this.solicitudUrl}/dashboard/resumen`),
      solicitudes: this.http.get<SolicitudBackend[]>(`${this.solicitudUrl}`),
    }).pipe(
      map(({ resumen, solicitudes }) => {
        const mapped    = solicitudes.map(s => this.mapearSolicitud(s));
        const metricas  = this.mapearMetricas(resumen);
        const filtradas = this.filtrarLocal({ solicitudes: mapped, metricas }, filtros).solicitudes;
        return { solicitudes: filtradas, metricas };
      })
    );
  }

  actualizarServidor(servidorId: string, payload: Record<string, any>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/servidor/${servidorId}`, payload);
  }

  obtenerDetalle(id: string): Observable<Solicitud> {
    if (this.useMock) {
      return of(DASHBOARD_MOCK.solicitudes.find(s => s.id === id)!);
    }
    return forkJoin({
      solicitud:  this.http.get<SolicitudBackend>(`${this.solicitudUrl}/${id}`),
      servidores: this.http.get<any[]>(`${environment.apiUrl}/servidor/solicitud/${id}`).pipe(
        catchError(() => of([] as any[]))
      ),
      carta: this.http.get<CartaBackend>(`${environment.apiUrl}/cartas/solicitud/${id}`).pipe(
        tap(res => console.log('[DashboardService] GET /cartas/solicitud/' + id, res)),
        catchError(err => {
          console.error('[DashboardService] Error al obtener carta:', err);
          return of(null);
        })
      ),
    }).pipe(
      map(({ solicitud, servidores, carta }) => {
        console.log('[Detalle] solicitud raw:', solicitud);
        const mapped = this.mapearSolicitud(solicitud);

        mapped.vpns = (solicitud.servidor?.['serverVpns'] ?? [])
          .map((sv: any): VpnServidor => ({
            vpnType:    sv.vpn?.vpnType    ?? '',
            responsable: sv.vpn?.responsable ?? '',
            cargo:       sv.vpn?.cargo       ?? '',
            phone:       sv.vpn?.phone       ?? '',
            assignedAt:  sv.assignedAt       ?? '',
          }));

        mapped.subdominios = (solicitud.servidor?.['serverSubdominios'] ?? [])
          .map((ss: any): SubdominioServidor => ({
            requestedName: ss.subdominio?.requestedName ?? '',
            port:          ss.subdominio?.port          ?? 0,
            sslRequired:   ss.subdominio?.sslRequired   ?? false,
            status:        ss.subdominio?.status        ?? '',
            assignedAt:    ss.assignedAt                ?? '',
          }));

        // Inyectar datos del servidor
        if (servidores.length > 0) {
          const srv = servidores[0];
          mapped.servidorId = String(srv.id);

          const etapa2 = mapped.etapas.find(e => e.numero === 2);
          if (etapa2) {
            etapa2.vCores         = srv.nucleos       ?? etapa2.vCores;
            etapa2.memoriaRam     = srv.ram            ?? etapa2.memoriaRam;
            etapa2.almacenamiento = srv.almacenamiento ?? etapa2.almacenamiento;
          }

        }

        // Inyectar datos de la carta responsiva (Etapa 1)
        if (carta) {
          mapped.carta = this.mapearCarta(carta);
        }

        return mapped;
      })
    );
  }

  // ── Mapeo backend → modelo frontend ─────────────────────────────────────────

  private mapearSolicitud(s: SolicitudBackend): Solicitud {
    const etapaOperativa = s.servidor?.etapaOperativa ?? '';
    const etapaIdx = ETAPAS_PROCESO.findIndex(e => e.nombre === etapaOperativa);
    const etapaNum = etapaIdx >= 0 ? etapaIdx + 1 : 1;

    const etapas: EtapaSolicitud[] = ETAPAS_PROCESO.map(e => ({
      numero: e.numero,
      nombre: e.nombre,
      estado: e.numero < etapaNum ? 'completada'
            : e.numero === etapaNum ? 'en-curso'
            : 'sin-iniciar',
    }));

    return {
      id:                 String(s.id),
      folio:              s.folio,
      dependencia:        s.nombreAplicacion,
      nombreServidor:     s.servidor?.hostname ?? '',
      estado:             ESTADO_MAP[s.estatus] ?? 'pendiente',
      etapaActual:        etapaNum,
      etapas,
      fechaRegistro:      s.createdAt,
      fechaActualizacion: s.updatedAt ?? s.createdAt,
    };
  }

  private mapearCarta(c: CartaBackend): CartaAprovisionamiento {
    const sol = c.solicitud ?? {};
    const dep = sol.dependency ?? {};

    return {
      areaRequirente: {
        sector:      dep.sector      ?? '',
        dependencia: dep.name        ?? '',
        responsable: dep.responsable ?? '',
        cargo:       dep.cargo       ?? '',
        telefono:    dep.telefono    ?? '',
        correo:      dep.correo      ?? '',
      },
      adminServidor: {
        proveedor:   '',
        sector:      '',
        dependencia: '',
        responsable: c.firmanteAtdtNombre ?? '',
        cargo:       c.firmanteAtdtPuesto ?? '',
        telefono:    '',
        correo:      '',
      },
      descripcion: {
        descripcionServidor:       sol.descripcionUso       ?? '',
        nombreServidor:            sol.nombreServidor        ?? '',
        nombreAplicacion:          sol.nombreAplicacion      ?? '',
        tipoUso:                   (sol.tipoUso as 'interno' | 'publicado') ?? 'interno',
        fechaArranque:             sol.fechaArranqueDeseada ?? '',
        vigencia:                  sol.vigenciaMeses != null ? `${sol.vigenciaMeses} meses` : '',
        caracteristicasEspeciales: sol.conectividadOtras    ?? '',
      },
      specs: {
        tipoRequerimiento:    (sol.tipoRequerimiento as 'estandar' | 'especifico') ?? 'estandar',
        modalidad:            sol.esClonacion ? 'renovacion' : 'nuevo',
        sistemaOperativo:     (sol.sistemaOperativo as 'windows' | 'linux' | 'otro') ?? 'linux',
        sistemaOperativoOtro: '',
        vCores:               sol.vcpuSolicitado            ?? 0,
        memoriaRam:           sol.ramSolicitadaGb           ?? 0,
        discosDuros:          sol.almacenamientoSolicitadoGb != null
                                ? [{ capacidad: sol.almacenamientoSolicitadoGb, tipo: 'SSD' as const, etiqueta: 'Sistema' }]
                                : [],
        motorBD:              sol.motorBaseDatos       ?? '',
        puertos:              sol.reglasFirewall        ?? '',
        integraciones:        sol.integracionesExternas ?? '',
        otrasSpecs:           '',
        ipActual:             '',
        nombreServidorActual: '',
        tipoRenovacion:       '',
      },
      infraestructura: {
        subdominios: [],
        requiereSSL: false,
        vpns:        [],
      },
      responsiva: {
        firmante:       c.firmanteDependenciaNombre   ?? '',
        numEmpleado:    c.firmanteDependenciaEmpleado ?? '',
        puestoFirmante: c.firmanteDependenciaPuesto   ?? '',
        aceptaTerminos: true,
      },
    };
  }

  private mapearMetricas(m: ResumenBackend): DashboardMetricas {
    const get = (estatus: string) =>
      m.porEstatus.find(e => e.estatus.toLowerCase() === estatus)?.total ?? 0;
    return {
      total:       m.total,
      enProgreso:  get('en-proceso') + get('en proceso'),
      pendientes:  get('pendiente'),
      completadas: get('terminado') + get('completado'),
    };
  }

  // ── Filtrado local (mock y post-fetch) ───────────────────────────────────────

  private filtrarLocal(data: DashboardResponse, filtros: DashboardFiltros): DashboardResponse {
    let solicitudes = data.solicitudes;

    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      solicitudes = solicitudes.filter(s =>
        s.folio.toLowerCase().includes(q) || s.dependencia.toLowerCase().includes(q)
      );
    }
    if (filtros.estado) {
      solicitudes = solicitudes.filter(s => s.estado === filtros.estado);
    }
    if (filtros.etapa) {
      solicitudes = solicitudes.filter(s => s.etapaActual === filtros.etapa);
    }

    const metricas: DashboardMetricas = {
      total:      solicitudes.length,
      enProgreso: solicitudes.filter(s => s.estado === 'en-progreso').length,
      pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
      completadas: solicitudes.filter(s => s.estado === 'completada').length,
    };

    return { solicitudes, metricas };
  }
}
