export interface ContactoArea {
  sector: string;
  dependencia: string;
  responsable: string;
  cargo: string;
  telefono: string;
  correo: string;
}

export interface CartaAprovisionamiento {
  // Apartado 1
  areaRequirente: ContactoArea;
  adminServidor: ContactoArea & { proveedor: string };

  // Apartado 2
  descripcionServidor: string;
  nombreServidor: string;
  fechaArranque: string;
  tipoUso: 'interno' | 'publicado';
  caracteristicasEspeciales: string;
  vigencia: string;
  nombreAplicacion: string;

  // Apartado 3
  tipoRequerimiento: 'estandar' | 'especifico';
  modalidad: 'nuevo' | 'clonacion' | 'serverBase';
  sistemaOperativo: 'windows' | 'linux' | 'otro';
  sistemaOperativoOtro?: string;
  vCores: number;
  memoriaRam: number;
  almacenamiento: number;
  motorBD: string;
  puertos: string;
  integraciones: string;
  otrasSpecs: string;

  // Apartado 4
  subdominioSolicitado: string;
  puerto: string;
  requiereSSL: boolean;
  vpnResponsable: string;
  vpnCargo: string;
  vpnTelefono: string;
  vpnCorreo: string;

  // Apartado 6
  firmante: string;
  numEmpleado: string;
  puestoFirmante: string;
  aceptaTerminos: boolean;
}
