import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Cuenta {
  codigo: string
  nombre: string
  tipo: '1' | '2' | '3' | '4' | '5' | '6' // 1=Activos, 2=Pasivos, 3=Patrimonio, 4=Ingresos, 5=Gastos, 6=Costos
  saldoDebito: number
  saldoCredito: number
  movimientos: Movimiento[]
}

export interface Movimiento {
  id: string
  fecha: Date
  tipo: 'debito' | 'credito'
  monto: number
  descripcion: string
}

interface CuentasStore {
  cuentas: Cuenta[]
  agregarCuenta: (cuenta: Omit<Cuenta, 'saldoDebito' | 'saldoCredito' | 'movimientos'>) => void
  registrarMovimiento: (codigo: string, movimiento: Omit<Movimiento, 'id'>) => void
  obtenerCuenta: (codigo: string) => Cuenta | undefined
  obtenerCuentasPorTipo: (tipo: string) => Cuenta[]
  eliminarCuenta: (codigo: string) => void
  eliminarMovimiento: (tipoCuenta: string, movimientoId: string) => void
  editarMovimiento: (tipoCuenta: string, movimientoId: string, movimiento: Omit<Movimiento, 'id'>) => void
  calcularSaldo: (cuenta: Cuenta) => number
}

export const useCuentasStore = create<CuentasStore>()(
  persist(
    (set, get) => ({
      cuentas: [],
      
      agregarCuenta: (cuenta) => {
        set((state) => ({
          cuentas: [
            ...state.cuentas,
            {
              ...cuenta,
              saldoDebito: 0,
              saldoCredito: 0,
              movimientos: [],
            },
          ],
        }))
      },
      
      registrarMovimiento: (codigo, movimiento) => {
        set((state) => {
          // Buscar o crear la cuenta global del tipo
          let cuentaExiste = state.cuentas.find(c => c.tipo === codigo)
          
          if (!cuentaExiste) {
            // Crear la cuenta global si no existe
            const nombresCuentas = {
              '1': 'Activo',
              '2': 'Pasivo',
              '3': 'Patrimonio',
              '4': 'Ingreso',
              '5': 'Gasto',
              '6': 'Costo',
            }
            
            cuentaExiste = {
              codigo: codigo,
              nombre: nombresCuentas[codigo as keyof typeof nombresCuentas],
              tipo: codigo as '1' | '2' | '3' | '4' | '5' | '6',
              saldoDebito: 0,
              saldoCredito: 0,
              movimientos: [],
            }
          }
          
          return {
            cuentas: state.cuentas.map((cuenta) => {
              if (cuenta.tipo === codigo) {
                const nuevoMovimiento = {
                  ...movimiento,
                  id: `${Date.now()}-${Math.random()}`,
                  fecha: new Date(movimiento.fecha),
                }
                
                return {
                  ...cuenta,
                  saldoDebito: movimiento.tipo === 'debito' 
                    ? cuenta.saldoDebito + movimiento.monto 
                    : cuenta.saldoDebito,
                  saldoCredito: movimiento.tipo === 'credito' 
                    ? cuenta.saldoCredito + movimiento.monto 
                    : cuenta.saldoCredito,
                  movimientos: [...cuenta.movimientos, nuevoMovimiento],
                }
              }
              return cuenta
            }).concat(!state.cuentas.some(c => c.tipo === codigo) ? [cuentaExiste!] : [])
          }
        })
      },
      
      obtenerCuenta: (codigo) => {
        return get().cuentas.find((c) => c.codigo === codigo)
      },
      
      obtenerCuentasPorTipo: (tipo) => {
        return get().cuentas.filter((c) => c.tipo === tipo)
      },
      
      eliminarCuenta: (codigo) => {
        set((state) => ({
          cuentas: state.cuentas.filter((c) => c.codigo !== codigo),
        }))
      },
      
      eliminarMovimiento: (tipoCuenta, movimientoId) => {
        set((state) => ({
          cuentas: state.cuentas.map((cuenta) => {
            if (cuenta.tipo === tipoCuenta) {
              const movimiento = cuenta.movimientos.find(m => m.id === movimientoId)
              if (!movimiento) return cuenta
              
              return {
                ...cuenta,
                saldoDebito: movimiento.tipo === 'debito' 
                  ? cuenta.saldoDebito - movimiento.monto 
                  : cuenta.saldoDebito,
                saldoCredito: movimiento.tipo === 'credito' 
                  ? cuenta.saldoCredito - movimiento.monto 
                  : cuenta.saldoCredito,
                movimientos: cuenta.movimientos.filter(m => m.id !== movimientoId),
              }
            }
            return cuenta
          }),
        }))
      },
      
      editarMovimiento: (tipoCuenta, movimientoId, nuevoMovimiento) => {
        set((state) => ({
          cuentas: state.cuentas.map((cuenta) => {
            if (cuenta.tipo === tipoCuenta) {
              const movimientoViejo = cuenta.movimientos.find(m => m.id === movimientoId)
              if (!movimientoViejo) return cuenta
              
              // Revertir los valores del movimiento viejo
              let nuevoDebito = cuenta.saldoDebito
              let nuevoCredito = cuenta.saldoCredito
              
              if (movimientoViejo.tipo === 'debito') {
                nuevoDebito -= movimientoViejo.monto
              } else {
                nuevoCredito -= movimientoViejo.monto
              }
              
              // Aplicar los valores del movimiento nuevo
              if (nuevoMovimiento.tipo === 'debito') {
                nuevoDebito += nuevoMovimiento.monto
              } else {
                nuevoCredito += nuevoMovimiento.monto
              }
              
              return {
                ...cuenta,
                saldoDebito: nuevoDebito,
                saldoCredito: nuevoCredito,
                movimientos: cuenta.movimientos.map(m => 
                  m.id === movimientoId 
                    ? { ...nuevoMovimiento, id: movimientoId, fecha: new Date(nuevoMovimiento.fecha) }
                    : m
                ),
              }
            }
            return cuenta
          }),
        }))
      },
      
      calcularSaldo: (cuenta) => {
        // Activos (1), Gastos (5) y Costos (6): naturaleza deudora
        if (['1', '5', '6'].includes(cuenta.tipo)) {
          return cuenta.saldoDebito - cuenta.saldoCredito
        }
        // Pasivos (2), Patrimonio (3) e Ingresos (4): naturaleza acreedora
        return cuenta.saldoCredito - cuenta.saldoDebito
      },
    }),
    {
      name: 'cuentas-storage',
    }
  )
)
