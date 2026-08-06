import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActivarGiftcardPayload,
  BloquearGiftcardPayload,
  CrearGiftcardPayload,
  Giftcard,
  MovimientoTipo,
  ReiniciarActivacionPayload,
  calcularEstadoGiftcard,
} from '../data/giftcard.model';
import { EmpresaService } from './empresa.service';

// No hay sistema de autenticación aún — se simula el usuario que ejecuta acciones desde el BackOffice.
const USUARIO_ACTUAL = 'Administrador';

const MOCK_GIFTCARDS: Giftcard[] = [
  {
    id: '1',
    empresaId: 'empresa-1',
    codigo: 'GC-8F2A-01',
    tipoMonto: 'fijo',
    canal: 'ambos',
    cliente: null,
    monto: 20000,
    saldo: 20000,
    sid: 'SID-10021',
    vigente: true,
    fechaActivacion: null,
    campanaId: 'campana-1',
    movimientos: [movimiento('creacion', 'SID-10021', '2026-06-15', 20000, 20000, 'Generada en campaña corporativa', 'Administrador')],
  },
  {
    id: '2',
    empresaId: 'empresa-1',
    codigo: 'GC-8F2A-02',
    tipoMonto: 'fijo',
    canal: 'ambos',
    cliente: null,
    monto: 20000,
    saldo: 20000,
    sid: 'SID-10022',
    vigente: true,
    fechaActivacion: null,
    campanaId: 'campana-1',
    movimientos: [movimiento('creacion', 'SID-10022', '2026-06-15', 20000, 20000, 'Generada en campaña corporativa', 'Administrador')],
  },
  {
    id: '3',
    empresaId: 'empresa-1',
    codigo: 'GC-4B19-07',
    tipoMonto: 'dinamico',
    canal: 'tienda',
    cliente: 'Constanza Rivas',
    monto: 35000,
    saldo: 12500,
    sid: 'SID-10087',
    vigente: true,
    fechaActivacion: '2026-05-02',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10085', '2026-05-02', 35000, 35000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10086', '2026-05-02', 35000, 35000, 'Venta en tienda Providencia', 'Vendedor Providencia'),
      movimiento('uso', 'SID-10087', '2026-06-20', -22500, 12500, 'Consumo en compra #4821', 'Constanza Rivas'),
    ],
  },
  {
    id: '4',
    empresaId: 'empresa-1',
    codigo: 'GC-4B19-08',
    tipoMonto: 'fijo',
    canal: 'tienda',
    cliente: 'Tomás Herrera',
    monto: 15000,
    saldo: 15000,
    sid: 'SID-10088',
    vigente: true,
    fechaActivacion: '2026-05-10',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10083', '2026-05-10', 15000, 15000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10088', '2026-05-10', 15000, 15000, 'Venta en tienda Ñuñoa', 'Vendedor Ñuñoa'),
    ],
  },
  {
    id: '5',
    empresaId: 'empresa-1',
    codigo: 'GC-2C77-03',
    tipoMonto: 'fijo',
    canal: 'ecommerce',
    cliente: 'Javiera Soto',
    monto: 10000,
    saldo: 0,
    sid: 'SID-10101',
    vigente: true,
    fechaActivacion: '2026-04-01',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10099', '2026-04-01', 10000, 10000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10100', '2026-04-01', 10000, 10000, 'Venta en tienda Las Condes', 'Vendedor Las Condes'),
      movimiento('uso', 'SID-10101', '2026-04-18', -10000, 0, 'Consumo total en compra #3390', 'Javiera Soto'),
    ],
  },
  {
    id: '6',
    empresaId: 'empresa-1',
    codigo: 'GC-9A44-05',
    tipoMonto: 'dinamico',
    canal: 'ambos',
    cliente: 'Pedro Álvarez',
    monto: 50000,
    saldo: 50000,
    sid: 'SID-10112',
    vigente: false,
    fechaActivacion: '2026-06-01',
    campanaId: null,
    movimientos: [
      movimiento('creacion', 'SID-10110', '2026-06-01', 50000, 50000, 'Creada individual', 'Administrador'),
      movimiento('venta', 'SID-10111', '2026-06-01', 50000, 50000, 'Venta en tienda Maipú', 'Vendedor Maipú'),
      movimiento('ajuste', 'SID-10112', '2026-06-05', 0, 50000, 'Bloqueada por robo reportado por el cliente', 'Administrador'),
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class GiftcardService {
  private readonly empresaService = inject(EmpresaService);
  private readonly _giftcards = signal<Giftcard[]>(MOCK_GIFTCARDS);
  private secuencia = MOCK_GIFTCARDS.length;

  readonly giftcardsDeEmpresaActiva = computed(() => this._giftcards().filter((g) => g.empresaId === this.empresaService.empresaActiva().id));

  readonly metricas = computed(() => {
    const lista = this.giftcardsDeEmpresaActiva();
    const estados = lista.map((g) => calcularEstadoGiftcard(g));
    return {
      vigentesSinVender: estados.filter((e) => e === 'sin-activar').length,
      activas: estados.filter((e) => e === 'activa').length,
      saldoRealEmitido: lista.filter((g, i) => estados[i] === 'activa').reduce((total, g) => total + g.saldo, 0),
      inactivas: estados.filter((e) => e === 'agotada' || e === 'inactiva').length,
    };
  });

  crear(payload: CrearGiftcardPayload): void {
    const monto = payload.tipoMonto === 'fijo' ? (payload.montoFijo ?? 0) : 0;
    const cantidad = payload.modo === 'lote' ? payload.cantidad : 1;
    // Monto dinámico se asigna al activar — nunca puede nacer ya activada.
    const crearActivada = payload.tipoMonto === 'fijo' && payload.modo === 'individual' && !payload.crearSoloComoVigente;
    const prefijo = generarPrefijoCodigo();
    const hoy = new Date().toISOString().slice(0, 10);
    const campanaId = payload.modo === 'lote' ? payload.campanaId : null;
    const empresaId = this.empresaService.empresaActiva().id;

    const nuevas: Giftcard[] = Array.from({ length: cantidad }, (_, indice) => {
      this.secuencia += 1;
      const sid = `SID-${10000 + this.secuencia}`;
      return {
        id: `giftcard-${this.secuencia}`,
        empresaId,
        codigo: `GC-${prefijo}-${String(indice + 1).padStart(2, '0')}`,
        tipoMonto: payload.tipoMonto,
        canal: payload.canal,
        cliente: null,
        monto,
        saldo: monto,
        sid,
        vigente: true,
        fechaActivacion: crearActivada ? hoy : null,
        campanaId,
        movimientos: [
          {
            sid,
            tipo: 'creacion',
            fecha: hoy,
            monto,
            saldoResultante: monto,
            detalle: payload.modo === 'lote' ? 'Generada en campaña corporativa' : 'Creada individual',
            usuario: USUARIO_ACTUAL,
          },
        ],
      };
    });

    this._giftcards.update((lista) => [...nuevas, ...lista]);
  }

  activar(payload: ActivarGiftcardPayload): void {
    this.secuencia += 1;
    const nuevoSid = `SID-${10000 + this.secuencia}`;
    const hoy = new Date().toISOString().slice(0, 10);

    this._giftcards.update((lista) =>
      lista.map((g) => {
        if (g.id !== payload.giftcardId) return g;
        const monto = payload.monto ?? g.monto;
        return {
          ...g,
          monto,
          cliente: payload.destinatario,
          fechaActivacion: hoy,
          saldo: monto,
          sid: nuevoSid,
          movimientos: [
            ...g.movimientos,
            { sid: nuevoSid, tipo: 'venta', fecha: hoy, monto, saldoResultante: monto, detalle: `Activada para ${payload.destinatario}`, usuario: USUARIO_ACTUAL },
          ],
        };
      }),
    );
  }

  bloquear(payload: BloquearGiftcardPayload): void {
    this.secuencia += 1;
    const nuevoSid = `SID-${10000 + this.secuencia}`;
    const hoy = new Date().toISOString().slice(0, 10);

    this._giftcards.update((lista) =>
      lista.map((g) =>
        g.id === payload.giftcardId
          ? {
              ...g,
              vigente: false,
              sid: nuevoSid,
              movimientos: [
                ...g.movimientos,
                { sid: nuevoSid, tipo: 'ajuste', fecha: hoy, monto: 0, saldoResultante: g.saldo, detalle: `Bloqueada — ${payload.motivo}`, usuario: USUARIO_ACTUAL },
              ],
            }
          : g,
      ),
    );
  }

  reiniciarActivacion(payload: ReiniciarActivacionPayload): void {
    this.secuencia += 1;
    const nuevoSid = `SID-${10000 + this.secuencia}`;
    const hoy = new Date().toISOString().slice(0, 10);

    this._giftcards.update((lista) =>
      lista.map((g) =>
        g.id === payload.giftcardId
          ? {
              ...g,
              fechaActivacion: null,
              cliente: null,
              saldo: g.monto,
              sid: nuevoSid,
              movimientos: [
                ...g.movimientos,
                {
                  sid: nuevoSid,
                  tipo: 'ajuste',
                  fecha: hoy,
                  monto: 0,
                  saldoResultante: g.monto,
                  detalle: 'Activación reiniciada — código vuelve a Sin activar',
                  usuario: USUARIO_ACTUAL,
                },
              ],
            }
          : g,
      ),
    );
  }
}

function generarPrefijoCodigo(): string {
  return Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
}

function movimiento(tipo: MovimientoTipo, sid: string, fecha: string, monto: number, saldoResultante: number, detalle: string, usuario: string) {
  return { sid, tipo, fecha, monto, saldoResultante, detalle, usuario };
}
