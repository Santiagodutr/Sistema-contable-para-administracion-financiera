import { useState } from 'react'
import { useCuentasStore } from '@/stores/cuentasStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Check, X, FileSpreadsheet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import * as XLSX from 'xlsx'

const CuentasPage = () => {
  const { cuentas, registrarMovimiento, eliminarMovimiento, editarMovimiento } = useCuentasStore()

  // Nueva fila
  const [tipoCuenta, setTipoCuenta] = useState('')
  const [detalle, setDetalle] = useState('')
  const [tipoMovimiento, setTipoMovimiento] = useState<'debito' | 'credito'>('debito')
  const [monto, setMonto] = useState('')

  // Estado de edición
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTipoCuenta, setEditTipoCuenta] = useState('')
  const [editDetalle, setEditDetalle] = useState('')
  const [editTipoMovimiento, setEditTipoMovimiento] = useState<'debito' | 'credito'>('debito')
  const [editMonto, setEditMonto] = useState('')

  const tiposCuenta = {
    '1': 'Activo',
    '2': 'Pasivo',
    '3': 'Patrimonio',
    '4': 'Ingreso',
    '5': 'Gasto',
    '6': 'Costo',
  }

  // Determinar si un tipo de cuenta puede tener débito y/o crédito
  const puedeDebito = (tipo: string) => ['1', '2', '3', '5', '6'].includes(tipo) // Activo, Pasivo, Patrimonio, Gasto, Costo
  const puedeCredito = (tipo: string) => ['1', '2', '3', '4'].includes(tipo) // Activo, Pasivo, Patrimonio, Ingreso

  const handleAgregarFila = () => {
    if (!tipoCuenta || !detalle || !monto) {
      alert('Complete todos los campos')
      return
    }

    registrarMovimiento(tipoCuenta, {
      tipo: tipoMovimiento,
      monto: parseFloat(monto),
      descripcion: detalle,
      fecha: new Date(),
    })

    // Limpiar campos
    setTipoCuenta('')
    setDetalle('')
    setMonto('')
  }

  const iniciarEdicion = (mov: any) => {
    setEditandoId(mov.id)
    setEditTipoCuenta(mov.tipoCuenta)
    setEditDetalle(mov.descripcion)
    setEditTipoMovimiento(mov.tipo)
    setEditMonto(mov.monto.toString())
  }

  const guardarEdicion = () => {
    if (!editandoId || !editTipoCuenta || !editDetalle || !editMonto) {
      alert('Complete todos los campos')
      return
    }

    editarMovimiento(editTipoCuenta, editandoId, {
      tipo: editTipoMovimiento,
      monto: parseFloat(editMonto),
      descripcion: editDetalle,
      fecha: new Date(),
    })

    setEditandoId(null)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
  }

  const handleEliminarMovimiento = (tipoCuenta: string, movimientoId: string) => {
    eliminarMovimiento(tipoCuenta, movimientoId)
  }

  const exportarAExcel = () => {
    const todosMovimientos = cuentas.flatMap(cuenta =>
      cuenta.movimientos.map(mov => ({
        ...mov,
        tipoCuenta: cuenta.tipo,
        nombreCuenta: cuenta.nombre
      }))
    ).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    const totalDebito = todosMovimientos
      .filter(mov => mov.tipo === 'debito')
      .reduce((sum, mov) => sum + mov.monto, 0)

    const totalCredito = todosMovimientos
      .filter(mov => mov.tipo === 'credito')
      .reduce((sum, mov) => sum + mov.monto, 0)

    // Crear datos para Excel
    const datos = [
      ['PLAN DE CUENTAS'],
      [''],
      ['Tipo', 'Detalle', 'Débito', 'Crédito'],
      ...todosMovimientos.map(mov => [
        `${mov.tipoCuenta} - ${tiposCuenta[mov.tipoCuenta as keyof typeof tiposCuenta]}`,
        mov.descripcion,
        mov.tipo === 'debito' ? mov.monto : '',
        mov.tipo === 'credito' ? mov.monto : ''
      ]),
      ['', 'TOTALES', totalDebito, totalCredito]
    ]

    const ws = XLSX.utils.aoa_to_sheet(datos)

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 }
    ]

    // Combinar celdas del título
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Plan de Cuentas')
    XLSX.writeFile(wb, 'plan_de_cuentas.xlsx')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cuentas Contables</h1>
        <p className="text-muted-foreground mt-2">
          Gestione el plan de cuentas con códigos 1-6 (Activos, Pasivos, Patrimonio, Ingresos, Gastos, Costos)
        </p>
      </div>

      <Tabs defaultValue="cuentas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cuentas">Plan de Cuentas</TabsTrigger>
        </TabsList>

        <TabsContent value="cuentas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Plan de Cuentas</CardTitle>
                  <CardDescription>
                    Registro de todos los movimientos contables
                  </CardDescription>
                </div>
                <Button onClick={exportarAExcel} variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar a Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                // Obtener todos los movimientos de todas las cuentas
                const todosMovimientos = cuentas.flatMap(cuenta =>
                  cuenta.movimientos.map(mov => ({
                    ...mov,
                    tipoCuenta: cuenta.tipo,
                    nombreCuenta: cuenta.nombre
                  }))
                ).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

                // Calcular totales
                const totalDebito = todosMovimientos
                  .filter(mov => mov.tipo === 'debito')
                  .reduce((sum, mov) => sum + mov.monto, 0)

                const totalCredito = todosMovimientos
                  .filter(mov => mov.tipo === 'credito')
                  .reduce((sum, mov) => sum + mov.monto, 0)

                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Detalle</TableHead>
                        <TableHead className="text-right">Débito</TableHead>
                        <TableHead className="text-right">Crédito</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Fila para agregar nuevo movimiento */}
                      <TableRow className="bg-muted/50">
                        <TableCell>
                          <select
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={tipoCuenta}
                            onChange={(e) => setTipoCuenta(e.target.value)}
                          >
                            <option value="">Seleccionar</option>
                            <option value="1">1 - Activo</option>
                            <option value="2">2 - Pasivo</option>
                            <option value="3">3 - Patrimonio</option>
                            <option value="4">4 - Ingreso</option>
                            <option value="5">5 - Gasto</option>
                            <option value="6">6 - Costo</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                            placeholder="Descripción del movimiento"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={tipoMovimiento === 'debito' ? monto : ''}
                            onChange={(e) => {
                              setTipoMovimiento('debito')
                              setMonto(e.target.value)
                            }}
                            placeholder={puedeDebito(tipoCuenta) ? '0.00' : 'N/A'}
                            className="text-right"
                            disabled={!puedeDebito(tipoCuenta)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={tipoMovimiento === 'credito' ? monto : ''}
                            onChange={(e) => {
                              setTipoMovimiento('credito')
                              setMonto(e.target.value)
                            }}
                            placeholder={puedeCredito(tipoCuenta) ? '0.00' : 'N/A'}
                            className="text-right"
                            disabled={!puedeCredito(tipoCuenta)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={handleAgregarFila}
                            size="sm"
                          >
                            Agregar
                          </Button>
                        </TableCell>
                      </TableRow>

                      {todosMovimientos.map((mov) => {
                        const esEdicion = editandoId === mov.id

                        return (
                          <TableRow key={mov.id}>
                            <TableCell>
                              {esEdicion ? (
                                <select
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  value={editTipoCuenta}
                                  onChange={(e) => setEditTipoCuenta(e.target.value)}
                                >
                                  <option value="1">1 - Activo</option>
                                  <option value="2">2 - Pasivo</option>
                                  <option value="3">3 - Patrimonio</option>
                                  <option value="4">4 - Ingreso</option>
                                  <option value="5">5 - Gasto</option>
                                  <option value="6">6 - Costo</option>
                                </select>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-semibold">{mov.tipoCuenta}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {tiposCuenta[mov.tipoCuenta as keyof typeof tiposCuenta]}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {esEdicion ? (
                                <Input
                                  value={editDetalle}
                                  onChange={(e) => setEditDetalle(e.target.value)}
                                  className="w-full"
                                  placeholder="Descripción"
                                />
                              ) : (
                                <span>{mov.descripcion}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {esEdicion ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editTipoMovimiento === 'debito' ? editMonto : ''}
                                    onChange={(e) => {
                                      setEditTipoMovimiento('debito')
                                      setEditMonto(e.target.value)
                                    }}
                                    className="w-full text-right"
                                    placeholder={puedeDebito(editTipoCuenta) ? '0.00' : 'N/A'}
                                    disabled={!puedeDebito(editTipoCuenta)}
                                  />
                                </div>
                              ) : (
                                <span className="font-semibold">
                                  {mov.tipo === 'debito' ? formatCurrency(mov.monto) : '-'}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {esEdicion ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editTipoMovimiento === 'credito' ? editMonto : ''}
                                    onChange={(e) => {
                                      setEditTipoMovimiento('credito')
                                      setEditMonto(e.target.value)
                                    }}
                                    className="w-full text-right"
                                    placeholder={puedeCredito(editTipoCuenta) ? '0.00' : 'N/A'}
                                    disabled={!puedeCredito(editTipoCuenta)}
                                  />
                                </div>
                              ) : (
                                <span className="font-semibold">
                                  {mov.tipo === 'credito' ? formatCurrency(mov.monto) : '-'}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {esEdicion ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={guardarEdicion}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={cancelarEdicion}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => iniciarEdicion(mov)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleEliminarMovimiento(mov.tipoCuenta, mov.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}

                      {/* Fila de totales */}
                      <TableRow className="bg-primary/10 font-bold border-t-2">
                        <TableCell colSpan={2} className="text-right">TOTALES</TableCell>
                        <TableCell className="text-right text-lg">
                          {formatCurrency(totalDebito)}
                        </TableCell>
                        <TableCell className="text-right text-lg">
                          {formatCurrency(totalCredito)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )
              })()}

              {/* Mensaje de verificación de balance */}
              {cuentas.length > 0 && (() => {
                const todosMovimientos = cuentas.flatMap(cuenta => cuenta.movimientos)
                const totalDebito = todosMovimientos
                  .filter(mov => mov.tipo === 'debito')
                  .reduce((sum, mov) => sum + mov.monto, 0)
                const totalCredito = todosMovimientos
                  .filter(mov => mov.tipo === 'credito')
                  .reduce((sum, mov) => sum + mov.monto, 0)
                const diferencia = Math.abs(totalDebito - totalCredito)
                const balanceado = diferencia < 0.01

                return (
                  <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${balanceado ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {balanceado ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span className="font-semibold">
                          Balanceado: Débitos = Créditos
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        <span className="font-semibold">
                          No balanceado: Diferencia de {formatCurrency(diferencia)}. Verifique los movimientos.
                        </span>
                      </>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CuentasPage
