import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MetodoValoracion = 'PEPS' | 'PROMEDIO_PONDERADO'

export interface Producto {
  codigo: string
  nombre: string
  cantidadTotal: number
  valorTotal: number
  entradas: Entrada[]
  movimientos: MovimientoKardex[]
  metodo: MetodoValoracion
}

export interface Entrada {
  fecha: Date
  cantidad: number
  costoUnitario: number
  cantidadRestante: number
}

export interface MovimientoKardex {
  id: string
  fecha: Date
  tipo: 'ENTRADA' | 'SALIDA'
  tipoDocumento: string
  numeroDocumento: string
  detalle: string
  cantidad: number
  costoUnitario: number
  costoTotal: number
  saldoCantidad: number
  saldoCostoUnitario: number
  saldoCostoTotal: number
}

interface KardexStore {
  productos: Producto[]
  agregarProducto: (producto: Omit<Producto, 'cantidadTotal' | 'valorTotal' | 'entradas' | 'movimientos'>) => void
  registrarEntrada: (
    codigo: string, 
    cantidad: number, 
    costoUnitario: number, 
    tipoDocumento: string,
    numeroDocumento: string,
    detalle: string
  ) => void
  registrarSalida: (
    codigo: string, 
    cantidad: number,
    tipoDocumento: string,
    numeroDocumento: string,
    detalle: string
  ) => boolean
  cambiarMetodo: (codigo: string, metodo: MetodoValoracion) => void
  obtenerProducto: (codigo: string) => Producto | undefined
  eliminarProducto: (codigo: string) => void
  obtenerCostoPromedio: (producto: Producto) => number
  limpiarTabla: (codigo: string) => void
  editarMovimiento: (codigo: string, movimientoId: string, fecha: Date, detalle: string, cantidad: number, costoUnitario?: number) => void
  eliminarMovimiento: (codigo: string, movimientoId: string) => void
}

export const useKardexStore = create<KardexStore>()(
  persist(
    (set, get) => ({
      productos: [
        {
          codigo: '1',
          nombre: 'Producto',
          cantidadTotal: 0,
          valorTotal: 0,
          entradas: [],
          movimientos: [],
          metodo: 'PEPS',
        },
      ],
      
      agregarProducto: (producto) => {
        set((state) => ({
          productos: [
            ...state.productos,
            {
              ...producto,
              cantidadTotal: 0,
              valorTotal: 0,
              entradas: [],
              movimientos: [],
              metodo: producto.metodo || 'PEPS',
            },
          ],
        }))
      },
      
      registrarEntrada: (codigo, cantidad, costoUnitario, tipoDocumento, numeroDocumento, detalle) => {
        set((state) => ({
          productos: state.productos.map((producto) => {
            if (producto.codigo === codigo) {
              const costoTotal = cantidad * costoUnitario
              const nuevaEntrada: Entrada = {
                fecha: new Date(),
                cantidad,
                costoUnitario,
                cantidadRestante: cantidad,
              }
              
              const nuevaCantidadTotal = producto.cantidadTotal + cantidad
              const nuevoValorTotal = producto.valorTotal + costoTotal
              const nuevoCostoUnitarioPromedio = nuevaCantidadTotal > 0 ? nuevoValorTotal / nuevaCantidadTotal : 0
              
              const nuevoMovimiento: MovimientoKardex = {
                id: `${Date.now()}-${Math.random()}`,
                fecha: new Date(),
                tipo: 'ENTRADA',
                tipoDocumento,
                numeroDocumento,
                detalle,
                cantidad,
                costoUnitario,
                costoTotal,
                saldoCantidad: nuevaCantidadTotal,
                saldoCostoUnitario: producto.metodo === 'PROMEDIO_PONDERADO' ? nuevoCostoUnitarioPromedio : costoUnitario,
                saldoCostoTotal: nuevoValorTotal,
              }
              
              return {
                ...producto,
                cantidadTotal: nuevaCantidadTotal,
                valorTotal: nuevoValorTotal,
                entradas: [...producto.entradas, nuevaEntrada],
                movimientos: [...producto.movimientos, nuevoMovimiento],
              }
            }
            return producto
          }),
        }))
      },
      
      registrarSalida: (codigo, cantidad, tipoDocumento, numeroDocumento, detalle) => {
        const producto = get().obtenerProducto(codigo)
        if (!producto || cantidad > producto.cantidadTotal) {
          return false
        }
        
        let cantidadPorSacar = cantidad
        let costoSalida = 0
        let costoUnitarioSalida = 0
        const entradasActualizadas = [...producto.entradas]
        
        if (producto.metodo === 'PEPS') {
          // PEPS: Sacar de las entradas más antiguas primero
          for (let i = 0; i < entradasActualizadas.length && cantidadPorSacar > 0; i++) {
            const entrada = entradasActualizadas[i]
            
            if (entrada.cantidadRestante <= cantidadPorSacar) {
              costoSalida += entrada.cantidadRestante * entrada.costoUnitario
              cantidadPorSacar -= entrada.cantidadRestante
              entrada.cantidadRestante = 0
            } else {
              costoSalida += cantidadPorSacar * entrada.costoUnitario
              entrada.cantidadRestante -= cantidadPorSacar
              cantidadPorSacar = 0
            }
          }
          costoUnitarioSalida = costoSalida / cantidad
        } else {
          // PROMEDIO PONDERADO: Usar el costo promedio actual
          costoUnitarioSalida = producto.cantidadTotal > 0 ? producto.valorTotal / producto.cantidadTotal : 0
          costoSalida = cantidad * costoUnitarioSalida
          
          // Actualizar todas las entradas proporcionalmente
          for (const entrada of entradasActualizadas) {
            if (entrada.cantidadRestante > 0 && cantidadPorSacar > 0) {
              const proporcion = entrada.cantidadRestante / producto.cantidadTotal
              const cantidadASacar = Math.min(Math.round(cantidad * proporcion), entrada.cantidadRestante, cantidadPorSacar)
              entrada.cantidadRestante -= cantidadASacar
              cantidadPorSacar -= cantidadASacar
            }
          }
        }
        
        const entradasFiltradas = entradasActualizadas.filter(e => e.cantidadRestante > 0)
        const nuevaCantidadTotal = producto.cantidadTotal - cantidad
        const nuevoValorTotal = producto.valorTotal - costoSalida
        const nuevoCostoUnitarioPromedio = nuevaCantidadTotal > 0 ? nuevoValorTotal / nuevaCantidadTotal : 0
        
        set((state) => ({
          productos: state.productos.map((p) => {
            if (p.codigo === codigo) {
              const nuevoMovimiento: MovimientoKardex = {
                id: `${Date.now()}-${Math.random()}`,
                fecha: new Date(),
                tipo: 'SALIDA',
                tipoDocumento,
                numeroDocumento,
                detalle,
                cantidad,
                costoUnitario: costoUnitarioSalida,
                costoTotal: costoSalida,
                saldoCantidad: nuevaCantidadTotal,
                saldoCostoUnitario: nuevoCostoUnitarioPromedio,
                saldoCostoTotal: nuevoValorTotal,
              }
              
              return {
                ...p,
                cantidadTotal: nuevaCantidadTotal,
                valorTotal: nuevoValorTotal,
                entradas: entradasFiltradas,
                movimientos: [...p.movimientos, nuevoMovimiento],
              }
            }
            return p
          }),
        }))
        
        return true
      },
      
      cambiarMetodo: (codigo, metodo) => {
        set((state) => ({
          productos: state.productos.map((producto) => {
            if (producto.codigo !== codigo) return producto
            
            // Recalcular todo el kardex con el nuevo método
            let cantidadAcumulada = 0
            let valorAcumulado = 0
            const entradasTemp: Entrada[] = []
            const movimientosActualizados: MovimientoKardex[] = []
            
            producto.movimientos.forEach((mov) => {
              if (mov.tipo === 'ENTRADA') {
                entradasTemp.push({
                  fecha: mov.fecha,
                  cantidad: mov.cantidad,
                  costoUnitario: mov.costoUnitario,
                  cantidadRestante: mov.cantidad,
                })
                
                cantidadAcumulada += mov.cantidad
                valorAcumulado += mov.costoTotal
                
                const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                
                movimientosActualizados.push({
                  ...mov,
                  saldoCantidad: cantidadAcumulada,
                  saldoCostoUnitario: metodo === 'PROMEDIO_PONDERADO' ? costoPromedio : mov.costoUnitario,
                  saldoCostoTotal: valorAcumulado,
                })
              } else {
                // SALIDA
                let cantidadPorSacar = mov.cantidad
                let costoSalida = 0
                
                if (metodo === 'PEPS') {
                  const entradasCopia = [...entradasTemp]
                  for (let i = 0; i < entradasCopia.length && cantidadPorSacar > 0; i++) {
                    const entrada = entradasCopia[i]
                    if (entrada.cantidadRestante <= cantidadPorSacar) {
                      costoSalida += entrada.cantidadRestante * entrada.costoUnitario
                      cantidadPorSacar -= entrada.cantidadRestante
                      entrada.cantidadRestante = 0
                    } else {
                      costoSalida += cantidadPorSacar * entrada.costoUnitario
                      entrada.cantidadRestante -= cantidadPorSacar
                      cantidadPorSacar = 0
                    }
                  }
                  entradasTemp.splice(0, entradasTemp.length, ...entradasCopia.filter(e => e.cantidadRestante > 0))
                } else {
                  const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                  costoSalida = mov.cantidad * costoPromedio
                }
                
                cantidadAcumulada -= mov.cantidad
                valorAcumulado -= costoSalida
                
                const nuevoCostoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                
                movimientosActualizados.push({
                  ...mov,
                  costoUnitario: costoSalida / mov.cantidad,
                  costoTotal: costoSalida,
                  saldoCantidad: cantidadAcumulada,
                  saldoCostoUnitario: nuevoCostoPromedio,
                  saldoCostoTotal: valorAcumulado,
                })
              }
            })
            
            return {
              ...producto,
              metodo,
              cantidadTotal: cantidadAcumulada,
              valorTotal: valorAcumulado,
              entradas: entradasTemp,
              movimientos: movimientosActualizados,
            }
          }),
        }))
      },
      
      obtenerProducto: (codigo) => {
        return get().productos.find((p) => p.codigo === codigo)
      },
      
      eliminarProducto: (codigo) => {
        set((state) => ({
          productos: state.productos.filter((p) => p.codigo !== codigo),
        }))
      },
      
      obtenerCostoPromedio: (producto) => {
        if (producto.cantidadTotal > 0) {
          return producto.valorTotal / producto.cantidadTotal
        }
        return 0
      },
      
      limpiarTabla: (codigo) => {
        set((state) => ({
          productos: state.productos.map((p) =>
            p.codigo === codigo
              ? {
                  ...p,
                  cantidadTotal: 0,
                  valorTotal: 0,
                  entradas: [],
                  movimientos: [],
                }
              : p
          ),
        }))
      },
      
      editarMovimiento: (codigo, movimientoId, fecha, detalle, cantidad, costoUnitario) => {
        set((state) => ({
          productos: state.productos.map((producto) => {
            if (producto.codigo !== codigo) return producto
            
            const movIndex = producto.movimientos.findIndex(m => m.id === movimientoId)
            if (movIndex === -1) return producto
            
            const movActual = producto.movimientos[movIndex]
            
            // Reconstruir el kardex desde el principio
            let cantidadAcumulada = 0
            let valorAcumulado = 0
            const entradasTemp: Entrada[] = []
            const movimientosActualizados: MovimientoKardex[] = []
            
            producto.movimientos.forEach((mov, idx) => {
              if (idx === movIndex) {
                // Este es el movimiento que estamos editando
                if (movActual.tipo === 'ENTRADA') {
                  const nuevoCosto = costoUnitario !== undefined ? costoUnitario : mov.costoUnitario
                  const costoTotal = cantidad * nuevoCosto
                  
                  entradasTemp.push({
                    fecha: fecha,
                    cantidad: cantidad,
                    costoUnitario: nuevoCosto,
                    cantidadRestante: cantidad,
                  })
                  
                  cantidadAcumulada += cantidad
                  valorAcumulado += costoTotal
                  
                  const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                  
                  movimientosActualizados.push({
                    ...mov,
                    fecha,
                    detalle,
                    cantidad,
                    costoUnitario: nuevoCosto,
                    costoTotal,
                    saldoCantidad: cantidadAcumulada,
                    saldoCostoUnitario: producto.metodo === 'PROMEDIO_PONDERADO' ? costoPromedio : nuevoCosto,
                    saldoCostoTotal: valorAcumulado,
                  })
                } else {
                  // SALIDA
                  let cantidadPorSacar = cantidad
                  let costoSalida = 0
                  
                  if (producto.metodo === 'PEPS') {
                    const entradasCopia = [...entradasTemp]
                    for (let i = 0; i < entradasCopia.length && cantidadPorSacar > 0; i++) {
                      const entrada = entradasCopia[i]
                      if (entrada.cantidadRestante <= cantidadPorSacar) {
                        costoSalida += entrada.cantidadRestante * entrada.costoUnitario
                        cantidadPorSacar -= entrada.cantidadRestante
                        entrada.cantidadRestante = 0
                      } else {
                        costoSalida += cantidadPorSacar * entrada.costoUnitario
                        entrada.cantidadRestante -= cantidadPorSacar
                        cantidadPorSacar = 0
                      }
                    }
                    entradasTemp.splice(0, entradasTemp.length, ...entradasCopia.filter(e => e.cantidadRestante > 0))
                  } else {
                    const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                    costoSalida = cantidad * costoPromedio
                  }
                  
                  cantidadAcumulada -= cantidad
                  valorAcumulado -= costoSalida
                  
                  const nuevoCostoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                  
                  movimientosActualizados.push({
                    ...mov,
                    fecha,
                    detalle,
                    cantidad,
                    costoUnitario: costoSalida / cantidad,
                    costoTotal: costoSalida,
                    saldoCantidad: cantidadAcumulada,
                    saldoCostoUnitario: nuevoCostoPromedio,
                    saldoCostoTotal: valorAcumulado,
                  })
                }
              } else if (idx > movIndex) {
                // Recalcular movimientos posteriores
                if (mov.tipo === 'ENTRADA') {
                  entradasTemp.push({
                    fecha: mov.fecha,
                    cantidad: mov.cantidad,
                    costoUnitario: mov.costoUnitario,
                    cantidadRestante: mov.cantidad,
                  })
                  
                  cantidadAcumulada += mov.cantidad
                  valorAcumulado += mov.costoTotal
                  
                  const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                  
                  movimientosActualizados.push({
                    ...mov,
                    saldoCantidad: cantidadAcumulada,
                    saldoCostoUnitario: producto.metodo === 'PROMEDIO_PONDERADO' ? costoPromedio : mov.costoUnitario,
                    saldoCostoTotal: valorAcumulado,
                  })
                } else {
                  let cantidadPorSacar = mov.cantidad
                  let costoSalida = 0
                  
                  if (producto.metodo === 'PEPS') {
                    const entradasCopia = [...entradasTemp]
                    for (let i = 0; i < entradasCopia.length && cantidadPorSacar > 0; i++) {
                      const entrada = entradasCopia[i]
                      if (entrada.cantidadRestante <= cantidadPorSacar) {
                        costoSalida += entrada.cantidadRestante * entrada.costoUnitario
                        cantidadPorSacar -= entrada.cantidadRestante
                        entrada.cantidadRestante = 0
                      } else {
                        costoSalida += cantidadPorSacar * entrada.costoUnitario
                        entrada.cantidadRestante -= cantidadPorSacar
                        cantidadPorSacar = 0
                      }
                    }
                    entradasTemp.splice(0, entradasTemp.length, ...entradasCopia.filter(e => e.cantidadRestante > 0))
                  } else {
                    const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                    costoSalida = mov.cantidad * costoPromedio
                  }
                  
                  cantidadAcumulada -= mov.cantidad
                  valorAcumulado -= costoSalida
                  
                  const nuevoCostoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                  
                  movimientosActualizados.push({
                    ...mov,
                    costoUnitario: costoSalida / mov.cantidad,
                    costoTotal: costoSalida,
                    saldoCantidad: cantidadAcumulada,
                    saldoCostoUnitario: nuevoCostoPromedio,
                    saldoCostoTotal: valorAcumulado,
                  })
                }
              } else {
                // Movimientos anteriores: mantener y recalcular acumulados
                movimientosActualizados.push(mov)
                
                if (mov.tipo === 'ENTRADA') {
                  entradasTemp.push({
                    fecha: mov.fecha,
                    cantidad: mov.cantidad,
                    costoUnitario: mov.costoUnitario,
                    cantidadRestante: mov.cantidad,
                  })
                  cantidadAcumulada += mov.cantidad
                  valorAcumulado += mov.costoTotal
                } else {
                  if (producto.metodo === 'PEPS') {
                    let cantidadPorSacar = mov.cantidad
                    const entradasCopia = [...entradasTemp]
                    for (let i = 0; i < entradasCopia.length && cantidadPorSacar > 0; i++) {
                      const entrada = entradasCopia[i]
                      if (entrada.cantidadRestante <= cantidadPorSacar) {
                        cantidadPorSacar -= entrada.cantidadRestante
                        entrada.cantidadRestante = 0
                      } else {
                        entrada.cantidadRestante -= cantidadPorSacar
                        cantidadPorSacar = 0
                      }
                    }
                    entradasTemp.splice(0, entradasTemp.length, ...entradasCopia.filter(e => e.cantidadRestante > 0))
                  }
                  cantidadAcumulada -= mov.cantidad
                  valorAcumulado -= mov.costoTotal
                }
              }
            })
            
            return {
              ...producto,
              cantidadTotal: cantidadAcumulada,
              valorTotal: valorAcumulado,
              entradas: entradasTemp,
              movimientos: movimientosActualizados,
            }
          }),
        }))
      },
      
      eliminarMovimiento: (codigo, movimientoId) => {
        set((state) => ({
          productos: state.productos.map((producto) => {
            if (producto.codigo !== codigo) return producto
            
            const movimientosFiltrados = producto.movimientos.filter(m => m.id !== movimientoId)
            
            // Recalcular todo el kardex desde cero
            let cantidadAcumulada = 0
            let valorAcumulado = 0
            const entradasTemp: Entrada[] = []
            const movimientosActualizados: MovimientoKardex[] = []
            
            movimientosFiltrados.forEach((mov) => {
              if (mov.tipo === 'ENTRADA') {
                entradasTemp.push({
                  fecha: mov.fecha,
                  cantidad: mov.cantidad,
                  costoUnitario: mov.costoUnitario,
                  cantidadRestante: mov.cantidad,
                })
                
                cantidadAcumulada += mov.cantidad
                valorAcumulado += mov.costoTotal
                
                const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                
                movimientosActualizados.push({
                  ...mov,
                  saldoCantidad: cantidadAcumulada,
                  saldoCostoUnitario: producto.metodo === 'PROMEDIO_PONDERADO' ? costoPromedio : mov.costoUnitario,
                  saldoCostoTotal: valorAcumulado,
                })
              } else {
                let cantidadPorSacar = mov.cantidad
                let costoSalida = 0
                
                if (producto.metodo === 'PEPS') {
                  const entradasCopia = [...entradasTemp]
                  for (let i = 0; i < entradasCopia.length && cantidadPorSacar > 0; i++) {
                    const entrada = entradasCopia[i]
                    if (entrada.cantidadRestante <= cantidadPorSacar) {
                      costoSalida += entrada.cantidadRestante * entrada.costoUnitario
                      cantidadPorSacar -= entrada.cantidadRestante
                      entrada.cantidadRestante = 0
                    } else {
                      costoSalida += cantidadPorSacar * entrada.costoUnitario
                      entrada.cantidadRestante -= cantidadPorSacar
                      cantidadPorSacar = 0
                    }
                  }
                  entradasTemp.splice(0, entradasTemp.length, ...entradasCopia.filter(e => e.cantidadRestante > 0))
                } else {
                  const costoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                  costoSalida = mov.cantidad * costoPromedio
                }
                
                cantidadAcumulada -= mov.cantidad
                valorAcumulado -= costoSalida
                
                const nuevoCostoPromedio = cantidadAcumulada > 0 ? valorAcumulado / cantidadAcumulada : 0
                
                movimientosActualizados.push({
                  ...mov,
                  costoUnitario: costoSalida / mov.cantidad,
                  costoTotal: costoSalida,
                  saldoCantidad: cantidadAcumulada,
                  saldoCostoUnitario: nuevoCostoPromedio,
                  saldoCostoTotal: valorAcumulado,
                })
              }
            })
            
            return {
              ...producto,
              cantidadTotal: cantidadAcumulada,
              valorTotal: valorAcumulado,
              entradas: entradasTemp,
              movimientos: movimientosActualizados,
            }
          }),
        }))
      },
    }),
    {
      name: 'kardex-storage',
    }
  )
)
