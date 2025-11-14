import { useState } from 'react'
import { useKardexStore, MetodoValoracion } from '@/stores/kardexStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Pencil, Trash2, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

const KardexPage = () => {
  const { productos, registrarEntrada, registrarSalida, cambiarMetodo, limpiarTabla, editarMovimiento, eliminarMovimiento } = useKardexStore()
  
  // Nueva fila
  const [detalle, setDetalle] = useState('')
  const [tipoMovimiento, setTipoMovimiento] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA')
  const [cantidad, setCantidad] = useState('')
  const [costoUnitario, setCostoUnitario] = useState('')
  
  // Estado de edición
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editFecha, setEditFecha] = useState('')
  const [editDetalle, setEditDetalle] = useState('')
  const [editCantidad, setEditCantidad] = useState('')
  const [editCostoUnitario, setEditCostoUnitario] = useState('')

  // Siempre usa el primer producto
  const productoSeleccionado = productos[0]

  const handleAgregarFila = () => {
    if (!productoSeleccionado) {
      alert('No hay productos registrados')
      return
    }

    if (!detalle || !cantidad) {
      alert('Complete todos los campos')
      return
    }

    if (tipoMovimiento === 'ENTRADA') {
      if (!costoUnitario) {
        alert('Ingrese el costo unitario')
        return
      }
      registrarEntrada(productoSeleccionado.codigo, parseInt(cantidad), parseFloat(costoUnitario), '', '', detalle)
    } else {
      const exito = registrarSalida(productoSeleccionado.codigo, parseInt(cantidad), '', '', detalle)
      if (!exito) {
        alert('No hay suficiente inventario')
        return
      }
    }

    // Limpiar campos
    setDetalle('')
    setCantidad('')
    setCostoUnitario('')
  }
  
  const iniciarEdicion = (mov: any) => {
    setEditandoId(mov.id)
    setEditFecha(new Date(mov.fecha).toISOString().split('T')[0])
    setEditDetalle(mov.detalle)
    setEditCantidad(mov.cantidad.toString())
    setEditCostoUnitario(mov.tipo === 'ENTRADA' ? mov.costoUnitario.toString() : '')
  }
  
  const guardarEdicion = (mov: any) => {
    if (!productoSeleccionado || !editandoId) return
    
    if (!editDetalle || !editCantidad) {
      alert('Complete todos los campos')
      return
    }
    
    const cantidad = parseInt(editCantidad)
    const costoUnitario = mov.tipo === 'ENTRADA' && editCostoUnitario ? parseFloat(editCostoUnitario) : undefined
    
    if (mov.tipo === 'ENTRADA' && !costoUnitario) {
      alert('Ingrese el costo unitario para entradas')
      return
    }
    
    editarMovimiento(
      productoSeleccionado.codigo,
      editandoId,
      new Date(editFecha),
      editDetalle,
      cantidad,
      costoUnitario
    )
    
    setEditandoId(null)
  }
  
  const cancelarEdicion = () => {
    setEditandoId(null)
  }
  
  const handleEliminarMovimiento = (movId: string) => {
    if (!productoSeleccionado) return
    
    if (confirm('¿Está seguro de eliminar este movimiento?')) {
      eliminarMovimiento(productoSeleccionado.codigo, movId)
    }
  }
  
  const calcularTotales = () => {
    if (!productoSeleccionado) return { entradas: 0, salidas: 0, saldo: 0 }
    
    const totales = productoSeleccionado.movimientos.reduce((acc, mov) => {
      if (mov.tipo === 'ENTRADA') {
        acc.entradas += mov.cantidad
      } else {
        acc.salidas += mov.cantidad
      }
      return acc
    }, { entradas: 0, salidas: 0, saldo: 0 })
    
    totales.saldo = totales.entradas - totales.salidas
    return totales
  }

  const totales = calcularTotales()

  const exportarAExcel = () => {
    if (!productoSeleccionado) {
      alert('No hay datos para exportar')
      return
    }

    // Crear libro de Excel
    const wb = XLSX.utils.book_new()
    
    // Crear array de datos con encabezados personalizados
    const data: any[][] = []
    
    // Fila 1: Encabezados principales
    data.push(['Fecha', 'Detalle', 'Entradas', '', '', 'Salidas', '', '', 'Saldos', '', ''])
    
    // Fila 2: Subencabezados
    data.push(['', '', 'cantidad', 'Valor Unitario', 'Valor Total', 'cantidad', 'Valor Unitario', 'Valor Total', 'cantidad', 'Valor Unitario', 'Valor Total'])
    
    // Agregar datos de movimientos
    productoSeleccionado.movimientos.forEach((mov) => {
      data.push([
        new Date(mov.fecha).toLocaleDateString('es-PE'),
        mov.detalle,
        mov.tipo === 'ENTRADA' ? mov.cantidad : '',
        mov.tipo === 'ENTRADA' ? mov.costoUnitario : '',
        mov.tipo === 'ENTRADA' ? mov.costoTotal : '',
        mov.tipo === 'SALIDA' ? mov.cantidad : '',
        mov.tipo === 'SALIDA' ? mov.costoUnitario : '',
        mov.tipo === 'SALIDA' ? mov.costoTotal : '',
        mov.saldoCantidad,
        mov.saldoCostoUnitario,
        mov.saldoCostoTotal,
      ])
    })
    
    // Agregar fila de totales
    data.push([
      '',
      'TOTALES',
      totales.entradas,
      0,
      0,
      totales.salidas,
      0,
      0,
      totales.saldo,
      0,
      0,
    ])

    // Crear hoja de trabajo
    const ws = XLSX.utils.aoa_to_sheet(data)

    // Combinar celdas para encabezados principales
    ws['!merges'] = [
      { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, // Entradas
      { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, // Salidas
      { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } }, // Saldos
    ]

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 20 }, // Detalle
      { wch: 12 }, // Entrada - Cantidad
      { wch: 15 }, // Entrada - Valor Unitario
      { wch: 15 }, // Entrada - Valor Total
      { wch: 12 }, // Salida - Cantidad
      { wch: 15 }, // Salida - Valor Unitario
      { wch: 15 }, // Salida - Valor Total
      { wch: 12 }, // Saldo - Cantidad
      { wch: 15 }, // Saldo - Valor Unitario
      { wch: 15 }, // Saldo - Valor Total
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Kardex')

    // Descargar archivo
    const nombreArchivo = `Kardex_${productoSeleccionado.codigo}_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, nombreArchivo)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kardex de Inventarios</h1>
          {productoSeleccionado && (
            <p className="text-sm text-muted-foreground mt-1">
              Producto: {productoSeleccionado.codigo} - {productoSeleccionado.nombre}
            </p>
          )}
        </div>

        <div className="flex gap-4 items-end">
          {productoSeleccionado && (
            <div>
              <label className="text-sm font-medium">Método</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={productoSeleccionado.metodo}
                onChange={(e) => {
                  cambiarMetodo(productoSeleccionado.codigo, e.target.value as MetodoValoracion)
                }}
              >
                <option value="PEPS">PEPS</option>
                <option value="PROMEDIO_PONDERADO">Promedio Ponderado</option>
              </select>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={exportarAExcel}
            disabled={!productoSeleccionado || productoSeleccionado.movimientos.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar a Excel
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={() => {
              if (productoSeleccionado && confirm('¿Está seguro de limpiar toda la tabla?')) {
                limpiarTabla(productoSeleccionado.codigo)
              }
            }}
          >
            Limpiar Tabla
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {productoSeleccionado ? `${productoSeleccionado.codigo} - ${productoSeleccionado.nombre}` : 'Seleccione un producto'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2} className="text-center border bg-gray-100">Fecha</TableHead>
                  <TableHead rowSpan={2} className="text-center border bg-gray-100">Detalle</TableHead>
                  <TableHead colSpan={3} className="text-center border bg-gray-100">Entradas</TableHead>
                  <TableHead colSpan={3} className="text-center border bg-gray-100">Salidas</TableHead>
                  <TableHead colSpan={3} className="text-center border bg-gray-100">Saldos</TableHead>
                  <TableHead rowSpan={2} className="text-center border bg-gray-100">Acciones</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border text-right text-xs bg-gray-50">cantidad</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">Valor Unitario</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">Valor Total</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">cantidad</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">Valor Unitario</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">Valor Total</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">cantidad</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">Valor Unitario</TableHead>
                  <TableHead className="border text-right text-xs bg-gray-50">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productoSeleccionado?.movimientos.map((mov) => {
                  const esEditable = editandoId === mov.id
                  
                  return (
                    <TableRow key={mov.id} className={esEditable ? 'bg-yellow-50' : ''}>
                      <TableCell className="border text-xs">
                        {esEditable ? (
                          <Input
                            type="date"
                            value={editFecha}
                            onChange={(e) => setEditFecha(e.target.value)}
                            className="h-8 text-xs"
                          />
                        ) : (
                          new Date(mov.fecha).toLocaleDateString('es-PE')
                        )}
                      </TableCell>
                      <TableCell className="border text-xs">
                        {esEditable ? (
                          <Input
                            value={editDetalle}
                            onChange={(e) => setEditDetalle(e.target.value)}
                            className="h-8 text-xs"
                          />
                        ) : (
                          mov.detalle
                        )}
                      </TableCell>
                      
                      {mov.tipo === 'ENTRADA' ? (
                        <>
                          <TableCell className="border text-right text-xs">
                            {esEditable ? (
                              <Input
                                type="number"
                                value={editCantidad}
                                onChange={(e) => setEditCantidad(e.target.value)}
                                className="h-8 text-xs"
                              />
                            ) : (
                              mov.cantidad
                            )}
                          </TableCell>
                          <TableCell className="border text-right text-xs">
                            {esEditable ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={editCostoUnitario}
                                onChange={(e) => setEditCostoUnitario(e.target.value)}
                                className="h-8 text-xs"
                              />
                            ) : (
                              formatCurrency(mov.costoUnitario)
                            )}
                          </TableCell>
                          <TableCell className="border text-right text-xs">
                            {esEditable && editCantidad && editCostoUnitario
                              ? formatCurrency(parseFloat(editCantidad) * parseFloat(editCostoUnitario))
                              : formatCurrency(mov.costoTotal)}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="border"></TableCell>
                          <TableCell className="border"></TableCell>
                          <TableCell className="border"></TableCell>
                        </>
                      )}
                      
                      {mov.tipo === 'SALIDA' ? (
                        <>
                          <TableCell className="border text-right text-xs">
                            {esEditable ? (
                              <Input
                                type="number"
                                value={editCantidad}
                                onChange={(e) => setEditCantidad(e.target.value)}
                                className="h-8 text-xs"
                              />
                            ) : (
                              mov.cantidad
                            )}
                          </TableCell>
                          <TableCell className="border text-right text-xs">
                            {formatCurrency(mov.costoUnitario)}
                          </TableCell>
                          <TableCell className="border text-right text-xs">
                            {formatCurrency(mov.costoTotal)}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="border"></TableCell>
                          <TableCell className="border"></TableCell>
                          <TableCell className="border"></TableCell>
                        </>
                      )}
                      
                      <TableCell className="border text-right font-semibold text-xs">
                        {mov.saldoCantidad}
                      </TableCell>
                      <TableCell className="border text-right font-semibold text-xs">
                        {formatCurrency(mov.saldoCostoUnitario)}
                      </TableCell>
                      <TableCell className="border text-right font-semibold text-xs">
                        {formatCurrency(mov.saldoCostoTotal)}
                      </TableCell>
                      
                      <TableCell className="border">
                        {esEditable ? (
                          <div className="flex gap-1 justify-center">
                            <Button onClick={() => guardarEdicion(mov)} size="sm" className="h-6 text-xs px-2">
                              ✓
                            </Button>
                            <Button onClick={cancelarEdicion} size="sm" variant="outline" className="h-6 text-xs px-2">
                              ✗
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1 justify-center">
                            <Button onClick={() => iniciarEdicion(mov)} size="sm" variant="ghost" className="h-6 text-xs px-2">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button onClick={() => handleEliminarMovimiento(mov.id)} size="sm" variant="ghost" className="h-6 text-xs px-2 text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                
                {/* Fila de entrada de datos */}
                <TableRow className="bg-blue-50">
                  <TableCell className="border">
                    <Input
                      type="date"
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="border">
                    <Input
                      placeholder="Detalle"
                      value={detalle}
                      onChange={(e) => setDetalle(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  
                  {tipoMovimiento === 'ENTRADA' ? (
                    <>
                      <TableCell className="border">
                        <Input
                          type="number"
                          placeholder="Cant"
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="border">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Costo"
                          value={costoUnitario}
                          onChange={(e) => setCostoUnitario(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="border text-right text-xs">
                        {cantidad && costoUnitario ? formatCurrency(parseFloat(cantidad) * parseFloat(costoUnitario)) : ''}
                      </TableCell>
                      <TableCell className="border"></TableCell>
                      <TableCell className="border"></TableCell>
                      <TableCell className="border"></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="border"></TableCell>
                      <TableCell className="border"></TableCell>
                      <TableCell className="border"></TableCell>
                      <TableCell className="border">
                        <Input
                          type="number"
                          placeholder="Cant"
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="border"></TableCell>
                      <TableCell className="border"></TableCell>
                    </>
                  )}
                  
                  <TableCell className="border"></TableCell>
                  <TableCell className="border"></TableCell>
                  <TableCell className="border"></TableCell>
                  
                  <TableCell className="border">
                    <div className="flex gap-2">
                      <select
                        value={tipoMovimiento}
                        onChange={(e) => setTipoMovimiento(e.target.value as 'ENTRADA' | 'SALIDA')}
                        className="h-8 text-xs border rounded px-2 flex-1"
                      >
                        <option value="ENTRADA">Entrada</option>
                        <option value="SALIDA">Salida</option>
                      </select>
                      <Button onClick={handleAgregarFila} size="sm" className="h-8 text-xs">
                        +
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Fila de totales */}
                <TableRow className="bg-gray-100 font-bold">
                  <TableCell className="border text-center">Totales</TableCell>
                  <TableCell className="border"></TableCell>
                  <TableCell className="border text-right">{totales.entradas}</TableCell>
                  <TableCell className="border" colSpan={2}></TableCell>
                  <TableCell className="border text-right">{totales.salidas}</TableCell>
                  <TableCell className="border" colSpan={2}></TableCell>
                  <TableCell className="border text-right">{totales.saldo}</TableCell>
                  <TableCell className="border" colSpan={2}></TableCell>
                  <TableCell className="border"></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default KardexPage
