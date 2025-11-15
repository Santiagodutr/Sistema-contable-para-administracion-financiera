import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface EmpleadoNomina {
  id: string
  nombre: string
  salarioBase: number
  diasLiquidados: number
  horasDiurnas: number
  horasNocturnas: number
}

const NominaPage = () => {
  const [empleados, setEmpleados] = useState<EmpleadoNomina[]>([])
  
  // Nueva fila
  const [nombre, setNombre] = useState('')
  const [salarioBase, setSalarioBase] = useState('')
  const [diasLiquidados, setDiasLiquidados] = useState('')
  const [horasDiurnas, setHorasDiurnas] = useState('')
  const [horasNocturnas, setHorasNocturnas] = useState('')
  
  // Estado de edición
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editSalarioBase, setEditSalarioBase] = useState('')
  const [editDiasLiquidados, setEditDiasLiquidados] = useState('')
  const [editHorasDiurnas, setEditHorasDiurnas] = useState('')
  const [editHorasNocturnas, setEditHorasNocturnas] = useState('')

  const calcularSalarioDevengado = (salarioBase: number, dias: number) => {
    return (salarioBase / 30) * dias
  }

  const calcularValorHora = (salarioDevengado: number) => {
    return salarioDevengado / (5 * 44)
  }

  const calcularAuxilioTransporte = (salarioBase: number, dias: number) => {
    if (salarioBase < 2847000) {
      return (200000 / 30) * dias
    }
    return 0
  }

  const calcularPagoHorasExtras = (salarioDevengado: number, horasDiurnas: number, horasNocturnas: number) => {
    const valorHora = calcularValorHora(salarioDevengado)
    const pagoDiurnas = valorHora * horasDiurnas * 1.25
    const pagoNocturnas = valorHora * horasNocturnas * 1.75
    return pagoDiurnas + pagoNocturnas
  }

  const calcularNomina = (emp: EmpleadoNomina) => {
    const salarioDevengado = calcularSalarioDevengado(emp.salarioBase, emp.diasLiquidados)
    const auxilioTransporte = calcularAuxilioTransporte(emp.salarioBase, emp.diasLiquidados)
    const pagoHorasExtras = calcularPagoHorasExtras(salarioDevengado, emp.horasDiurnas, emp.horasNocturnas)
    const totalDevengado = salarioDevengado + pagoHorasExtras + auxilioTransporte
    
    const baseParaDeducciones = totalDevengado - auxilioTransporte
    const salud = baseParaDeducciones * 0.04
    const pension = baseParaDeducciones * 0.04
    const netoPagado = totalDevengado - salud - pension

    return {
      salarioDevengado,
      valorHora: calcularValorHora(salarioDevengado),
      pagoHorasExtras,
      auxilioTransporte,
      totalDevengado,
      salud,
      pension,
      netoPagado
    }
  }

  const handleAgregarEmpleado = () => {
    if (!nombre || !salarioBase || !diasLiquidados) {
      alert('Complete los campos obligatorios: Nombre, Salario Base y Días Liquidados')
      return
    }

    const nuevoEmpleado: EmpleadoNomina = {
      id: Date.now().toString(),
      nombre,
      salarioBase: parseFloat(salarioBase),
      diasLiquidados: parseInt(diasLiquidados),
      horasDiurnas: parseFloat(horasDiurnas) || 0,
      horasNocturnas: parseFloat(horasNocturnas) || 0
    }

    setEmpleados([...empleados, nuevoEmpleado])
    setNombre('')
    setSalarioBase('')
    setDiasLiquidados('')
    setHorasDiurnas('')
    setHorasNocturnas('')
  }

  const iniciarEdicion = (emp: EmpleadoNomina) => {
    setEditandoId(emp.id)
    setEditNombre(emp.nombre)
    setEditSalarioBase(emp.salarioBase.toString())
    setEditDiasLiquidados(emp.diasLiquidados.toString())
    setEditHorasDiurnas(emp.horasDiurnas.toString())
    setEditHorasNocturnas(emp.horasNocturnas.toString())
  }

  const guardarEdicion = () => {
    if (!editandoId || !editNombre || !editSalarioBase || !editDiasLiquidados) {
      alert('Complete todos los campos obligatorios')
      return
    }

    setEmpleados(empleados.map(emp => 
      emp.id === editandoId 
        ? {
            ...emp,
            nombre: editNombre,
            salarioBase: parseFloat(editSalarioBase),
            diasLiquidados: parseInt(editDiasLiquidados),
            horasDiurnas: parseFloat(editHorasDiurnas) || 0,
            horasNocturnas: parseFloat(editHorasNocturnas) || 0
          }
        : emp
    ))
    setEditandoId(null)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
  }

  const eliminarEmpleado = (id: string) => {
    setEmpleados(empleados.filter(emp => emp.id !== id))
  }

  // Calcular totales
  const totales = empleados.reduce((acc, emp) => {
    const nomina = calcularNomina(emp)
    return {
      salarioBase: acc.salarioBase + emp.salarioBase,
      salarioDevengado: acc.salarioDevengado + nomina.salarioDevengado,
      pagoHorasExtras: acc.pagoHorasExtras + nomina.pagoHorasExtras,
      auxilioTransporte: acc.auxilioTransporte + nomina.auxilioTransporte,
      totalDevengado: acc.totalDevengado + nomina.totalDevengado,
      salud: acc.salud + nomina.salud,
      pension: acc.pension + nomina.pension,
      netoPagado: acc.netoPagado + nomina.netoPagado
    }
  }, {
    salarioBase: 0,
    salarioDevengado: 0,
    pagoHorasExtras: 0,
    auxilioTransporte: 0,
    totalDevengado: 0,
    salud: 0,
    pension: 0,
    netoPagado: 0
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Nómina</h1>
        <p className="text-muted-foreground mt-2">
          Cálculo de nómina con horas extras, auxilio de transporte y deducciones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nómina Mensual</CardTitle>
          <CardDescription>
            Registro y cálculo de nómina de empleados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Salario Base</TableHead>
                  <TableHead className="text-right">Días Liq.</TableHead>
                  <TableHead className="text-right">Salario Dev.</TableHead>
                  <TableHead className="text-right">H. Diurnas</TableHead>
                  <TableHead className="text-right">H. Nocturnas</TableHead>
                  <TableHead className="text-right">Pago H. Extra</TableHead>
                  <TableHead className="text-right">Aux. Trans.</TableHead>
                  <TableHead className="text-right">Total Dev.</TableHead>
                  <TableHead className="text-right">Salud (4%)</TableHead>
                  <TableHead className="text-right">Pensión (4%)</TableHead>
                  <TableHead className="text-right">Neto Pagado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Fila para agregar nuevo empleado */}
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre del empleado"
                      className="min-w-[150px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={salarioBase}
                      onChange={(e) => setSalarioBase(e.target.value)}
                      placeholder="0"
                      className="text-right min-w-[120px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={diasLiquidados}
                      onChange={(e) => setDiasLiquidados(e.target.value)}
                      placeholder="30"
                      className="text-right min-w-[80px]"
                    />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={horasDiurnas}
                      onChange={(e) => setHorasDiurnas(e.target.value)}
                      placeholder="0"
                      className="text-right min-w-[80px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={horasNocturnas}
                      onChange={(e) => setHorasNocturnas(e.target.value)}
                      placeholder="0"
                      className="text-right min-w-[80px]"
                    />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={handleAgregarEmpleado} size="sm">
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>

                {empleados.map((emp) => {
                  const esEdicion = editandoId === emp.id
                  const nomina = calcularNomina(emp)

                  return (
                    <TableRow key={emp.id}>
                      <TableCell>
                        {esEdicion ? (
                          <Input
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            className="min-w-[150px]"
                          />
                        ) : (
                          emp.nombre
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {esEdicion ? (
                          <Input
                            type="number"
                            value={editSalarioBase}
                            onChange={(e) => setEditSalarioBase(e.target.value)}
                            className="text-right min-w-[120px]"
                          />
                        ) : (
                          formatCurrency(emp.salarioBase)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {esEdicion ? (
                          <Input
                            type="number"
                            value={editDiasLiquidados}
                            onChange={(e) => setEditDiasLiquidados(e.target.value)}
                            className="text-right min-w-[80px]"
                          />
                        ) : (
                          emp.diasLiquidados
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(nomina.salarioDevengado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {esEdicion ? (
                          <Input
                            type="number"
                            step="0.5"
                            value={editHorasDiurnas}
                            onChange={(e) => setEditHorasDiurnas(e.target.value)}
                            className="text-right min-w-[80px]"
                          />
                        ) : (
                          emp.horasDiurnas
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {esEdicion ? (
                          <Input
                            type="number"
                            step="0.5"
                            value={editHorasNocturnas}
                            onChange={(e) => setEditHorasNocturnas(e.target.value)}
                            className="text-right min-w-[80px]"
                          />
                        ) : (
                          emp.horasNocturnas
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(nomina.pagoHorasExtras)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(nomina.auxilioTransporte)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(nomina.totalDevengado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(nomina.salud)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(nomina.pension)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(nomina.netoPagado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {esEdicion ? (
                            <>
                              <Button variant="outline" size="sm" onClick={guardarEdicion}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelarEdicion}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => iniciarEdicion(emp)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => eliminarEmpleado(emp.id)}>
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
                {empleados.length > 0 && (
                  <TableRow className="bg-primary/10 font-bold border-t-2">
                    <TableCell>TOTALES</TableCell>
                    <TableCell className="text-right">{formatCurrency(totales.salarioBase)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{formatCurrency(totales.salarioDevengado)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{formatCurrency(totales.pagoHorasExtras)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totales.auxilioTransporte)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totales.totalDevengado)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totales.salud)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totales.pension)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(totales.netoPagado)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NominaPage
