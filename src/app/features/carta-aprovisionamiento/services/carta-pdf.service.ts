import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

interface DiscoDuroPdf {
  capacidad: number;
  tipo: string;
  etiqueta?: string;
}

interface FormValue {
  areaRequirente: Record<string, string>;
  adminServidor: Record<string, string>;
  descripcion: Record<string, string>;
  specs: Record<string, string | number | boolean | DiscoDuroPdf[]>;
  infraestructura: Record<string, string | boolean | string[]>;
  responsiva: Record<string, string | boolean>;
}

@Injectable({ providedIn: 'root' })
export class CartaPdfService {

  private readonly MARGIN = 15;
  private readonly COL_LABEL = 15;
  private readonly COL_VALUE = 75;
  private readonly PAGE_WIDTH = 210;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - this.MARGIN * 2;

  generarPDF(formValue: FormValue): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = this.MARGIN;

    y = this.header(doc, y);
    y = this.seccion(doc, y, 'I. ÁREA REQUIRENTE', this.rowsContacto(formValue.areaRequirente));
    y = this.seccion(doc, y, 'II. ADMINISTRADOR DEL SERVIDOR', this.rowsAdminServidor(formValue.adminServidor));
    y = this.seccion(doc, y, 'III. DESCRIPCIÓN DEL SERVIDOR', this.rowsDescripcion(formValue.descripcion));
    y = this.seccion(doc, y, 'IV. ESPECIFICACIONES TÉCNICAS', this.rowsSpecs(formValue.specs));
    y = this.seccion(doc, y, 'V. INFRAESTRUCTURA', this.rowsInfra(formValue.infraestructura));
    y = this.seccion(doc, y, 'VI. RESPONSIVA', this.rowsResponsiva(formValue.responsiva));
    y = this.firmas(doc, y);

    doc.save('carta-aprovisionamiento.pdf');
  }

  // ── Header ──────────────────────────────────────────────────────────────────
  private header(doc: jsPDF, y: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CARTA DE APROVISIONAMIENTO DE INFRAESTRUCTURA', this.PAGE_WIDTH / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, this.PAGE_WIDTH / 2, y, { align: 'center' });
    y += 8;
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN, y, this.PAGE_WIDTH - this.MARGIN, y);
    return y + 6;
  }

  // ── Generic section renderer ─────────────────────────────────────────────
  private seccion(doc: jsPDF, y: number, titulo: string, rows: [string, string][]): number {
    y = this.checkPageBreak(doc, y, 20);

    // Title bar
    doc.setFillColor(30, 64, 175);
    doc.rect(this.MARGIN, y, this.CONTENT_WIDTH, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(titulo, this.MARGIN + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 9;

    // Rows
    doc.setFontSize(9);
    let fill = false;
    for (const [label, value] of rows) {
      y = this.checkPageBreak(doc, y, 7);
      if (fill) {
        doc.setFillColor(243, 244, 246);
        doc.rect(this.MARGIN, y - 1, this.CONTENT_WIDTH, 7, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.text(label, this.COL_LABEL, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', this.COL_VALUE, y + 4);
      y += 7;
      fill = !fill;
    }

    return y + 4;
  }

  // ── Firma section ────────────────────────────────────────────────────────
  private firmas(doc: jsPDF, y: number): number {
    y = this.checkPageBreak(doc, y, 40);
    y += 10;
    const col1 = this.MARGIN + 10;
    const col2 = this.PAGE_WIDTH / 2 + 10;
    const lineW = 60;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setLineWidth(0.3);

    doc.line(col1, y, col1 + lineW, y);
    doc.line(col2, y, col2 + lineW, y);
    y += 4;
    doc.text('Firma del solicitante', col1, y);
    doc.text('Firma del responsable de infraestructura', col2, y);

    return y + 4;
  }

  // ── Page break guard ─────────────────────────────────────────────────────
  private checkPageBreak(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > 285) {
      doc.addPage();
      return this.MARGIN;
    }
    return y;
  }

  // ── Row builders ─────────────────────────────────────────────────────────
  private rowsContacto(g: Record<string, string>): [string, string][] {
    return [
      ['Sector:', g['sector']],
      ['Dependencia:', g['dependencia']],
      ['Responsable:', g['responsable']],
      ['Cargo:', g['cargo']],
      ['Teléfono:', g['telefono']],
      ['Correo:', g['correo']],
    ];
  }

  private rowsAdminServidor(g: Record<string, string>): [string, string][] {
    return [
      ['Proveedor:', g['proveedor']],
      ['Dependencia:', g['dependencia']],
      ['Responsable:', g['responsable']],
      ['Cargo:', g['cargo']],
      ['Teléfono:', g['telefono']],
      ['Correo:', g['correo']],
    ];
  }

  private rowsDescripcion(g: Record<string, string>): [string, string][] {
    return [
      ['Descripción:', g['descripcionServidor']],
      ['Nombre del servidor:', g['nombreServidor']],
      ['Fecha de arranque:', g['fechaArranque']],
      ['Tipo de uso:', g['tipoUso']],
      ['Vigencia:', g['vigencia']],
      ['Nombre de la aplicación:', g['nombreAplicacion']],
      ['Características especiales:', g['caracteristicasEspeciales']],
    ];
  }

  private rowsSpecs(g: Record<string, string | number | boolean | DiscoDuroPdf[]>): [string, string][] {
    const so = g['sistemaOperativo'] === 'otro'
      ? String(g['sistemaOperativoOtro'] ?? '')
      : String(g['sistemaOperativo'] ?? '');

    const discos = (g['discosDuros'] as DiscoDuroPdf[] | undefined) ?? [];
    const discosRows: [string, string][] = discos.map((d, i) => {
      const etiqueta = d.etiqueta ? ` (${d.etiqueta})` : '';
      return [`Disco ${i + 1}:`, `${d.capacidad} GB — ${d.tipo}${etiqueta}`];
    });

    return [
      ['Tipo de requerimiento:', String(g['tipoRequerimiento'])],
      ['Modalidad:', String(g['modalidad'])],
      ['Sistema operativo:', so],
      ['vCores:', String(g['vCores'])],
      ['Memoria RAM (GB):', String(g['memoriaRam'])],
      ...discosRows,
      ['Motor de base de datos:', String(g['motorBD'] || '—')],
      ['Puertos:', String(g['puertos'] || '—')],
      ['Integraciones:', String(g['integraciones'] || '—')],
      ['Otras especificaciones:', String(g['otrasSpecs'] || '—')],
    ];
  }

  private rowsInfra(g: Record<string, string | boolean | string[]>): [string, string][] {
    const subdominios = (g['subdominios'] as string[] | undefined) ?? [];
    const subdRows: [string, string][] = subdominios
      .filter(s => s.trim())
      .map((s, i) => [`Subdominio ${i + 1}:`, s] as [string, string]);
    return [
      ...subdRows,
      ['Puerto:', String(g['puerto'] || '—')],
      ['Requiere SSL:', g['requiereSSL'] ? 'Sí' : 'No'],
    ];
  }

  private rowsResponsiva(g: Record<string, string | boolean>): [string, string][] {
    return [
      ['Firmante:', String(g['firmante'])],
      ['Número de empleado:', String(g['numEmpleado'])],
      ['Puesto:', String(g['puestoFirmante'])],
      ['Acepta términos:', g['aceptaTerminos'] ? 'Sí' : 'No'],
    ];
  }
}
