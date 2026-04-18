import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estatusBadge', standalone: true })
export class EstatusBadgePipe implements PipeTransform {
  transform(estatus: string): string {
    const e = (estatus || '').toLowerCase();
    if (e.includes('complet') || e.includes('activo') || e.includes('aprobad')) return 'badge-completado';
    if (e.includes('proceso') || e.includes('curso'))                           return 'badge-progreso';
    if (e.includes('pendiente'))                                                return 'badge-pendiente';
    if (e.includes('vencido'))                                                  return 'badge-vencido';
    return 'badge-default';
  }
}
