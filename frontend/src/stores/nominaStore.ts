import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Empleado {
  id: string
  nombre: string
  salarioMensual: number
  pagos: Pago[]
}

export interface Pago {
  id: string
  fecha: Date
  salarioBruto: number
  deducciones: {
    salud: number
    pension: number
    total: number
  }
  salarioNeto: number
}

interface NominaStore {
  empleados: Empleado[]
  agregarEmpleado: (empleado: Omit<Empleado, 'pagos'>) => void
  registrarPago: (idEmpleado: string) => void
  obtenerEmpleado: (id: string) => Empleado | undefined
  eliminarEmpleado: (id: string) => void
  calcularDeducciones: (salario: number) => { salud: number; pension: number; total: number }
}

export const useNominaStore = create<NominaStore>()(
  persist(
    (set, get) => ({
      empleados: [],
      
      agregarEmpleado: (empleado) => {
        set((state) => ({
          empleados: [
            ...state.empleados,
            {
              ...empleado,
              pagos: [],
            },
          ],
        }))
      },
      
      calcularDeducciones: (salario) => {
        const salud = salario * 0.04 // 4%
        const pension = salario * 0.04 // 4%
        const total = salud + pension
        return { salud, pension, total }
      },
      
      registrarPago: (idEmpleado) => {
        set((state) => ({
          empleados: state.empleados.map((empleado) => {
            if (empleado.id === idEmpleado) {
              const deducciones = get().calcularDeducciones(empleado.salarioMensual)
              const salarioNeto = empleado.salarioMensual - deducciones.total
              
              const nuevoPago: Pago = {
                id: `${Date.now()}-${Math.random()}`,
                fecha: new Date(),
                salarioBruto: empleado.salarioMensual,
                deducciones,
                salarioNeto,
              }
              
              return {
                ...empleado,
                pagos: [...empleado.pagos, nuevoPago],
              }
            }
            return empleado
          }),
        }))
      },
      
      obtenerEmpleado: (id) => {
        return get().empleados.find((e) => e.id === id)
      },
      
      eliminarEmpleado: (id) => {
        set((state) => ({
          empleados: state.empleados.filter((e) => e.id !== id),
        }))
      },
    }),
    {
      name: 'nomina-storage',
    }
  )
)
