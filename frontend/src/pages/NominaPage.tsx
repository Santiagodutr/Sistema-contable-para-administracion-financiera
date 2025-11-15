import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Check, X, FileSpreadsheet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import * as XLSX from 'xlsx'
import { Label } from '@/components/ui/label'

interface EmpleadoNomina {
  id: string
  nombre: string
  salarioBase: number
  diasLiquidados: number
  horasDiurnas: number
  horasNocturnas: number
  horasFeriadas: number
}

const NominaPage = () => {
  const [empleados, setEmpleados] = useState<EmpleadoNomina[]>([])
  
  // Nueva fila
  const [nombre, setNombre] = useState('')
  const [salarioBase, setSalarioBase] = useState('')
  const [diasLiquidados, setDiasLiquidados] = useState('')
  const [horasDiurnas, setHorasDiurnas] = useState('')
  const [horasNocturnas, setHorasNocturnas] = useState('')
  const [horasFeriadas, setHorasFeriadas] = useState('')
  
  // Estado de edición
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editSalarioBase, setEditSalarioBase] = useState('')
  const [editDiasLiquidados, setEditDiasLiquidados] = useState('')
  const [editHorasDiurnas, setEditHorasDiurnas] = useState('')
  const [editHorasNocturnas, setEditHorasNocturnas] = useState('')
  const [editHorasFeriadas, setEditHorasFeriadas] = useState('')

  // Configuración parafiscales y prestaciones
  const [sinAnimoLucro, setSinAnimoLucro] = useState(false)
  const [conPersonasJuridicas, setConPersonasJuridicas] = useState(false)

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

  const calcularPagoHorasExtras = (salarioDevengado: number, horasDiurnas: number, horasNocturnas: number, horasFeriadas: number) => {
    const valorHora = calcularValorHora(salarioDevengado)
    const pagoDiurnas = valorHora * horasDiurnas * 1.25
    const pagoNocturnas = valorHora * horasNocturnas * 1.75
    const pagoFeriadas = valorHora * horasFeriadas * 1.8
    return pagoDiurnas + pagoNocturnas + pagoFeriadas
  }

  const calcularNomina = (emp: EmpleadoNomina) => {
    const salarioDevengado = calcularSalarioDevengado(emp.salarioBase, emp.diasLiquidados)
    const auxilioTransporte = calcularAuxilioTransporte(emp.salarioBase, emp.diasLiquidados)
    const pagoHorasExtras = calcularPagoHorasExtras(salarioDevengado, emp.horasDiurnas, emp.horasNocturnas, emp.horasFeriadas)
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
      baseParaDeducciones,
      salud,
      pension,
      netoPagado
    }
  }

  const calcularParafiscales = (emp: EmpleadoNomina) => {
    const nomina = calcularNomina(emp)
    const base = nomina.baseParaDeducciones

    if (sinAnimoLucro) {
      return {
        salud: base * 0.085,
        pension: base * 0.12,
        arl: base * 0.00522,
        sena: base * 0.02,
        icbf: base * 0.03,
        cofrem: base * 0.04
      }
    } else {
      // Con ánimo de lucro
      const debePagarCompleto = !conPersonasJuridicas
      return {
        salud: debePagarCompleto ? base * 0.085 : 0,
        pension: base * 0.12,
        arl: base * 0.00522,
        sena: debePagarCompleto ? base * 0.02 : 0,
        icbf: debePagarCompleto ? base * 0.03 : 0,
        cofrem: base * 0.04
      }
    }
  }

  const calcularPrestaciones = (emp: EmpleadoNomina) => {
    const nomina = calcularNomina(emp)
    const base = nomina.baseParaDeducciones

    return {
      cesantias: base * 0.0833,
      interesCesantias: base * 0.01,
      prima: base * 0.0833,
      vacaciones: base * 0.0416
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
      horasNocturnas: parseFloat(horasNocturnas) || 0,
      horasFeriadas: parseFloat(horasFeriadas) || 0
    }

    setEmpleados([...empleados, nuevoEmpleado])
    setNombre('')
    setSalarioBase('')
    setDiasLiquidados('')
    setHorasDiurnas('')
    setHorasNocturnas('')
    setHorasFeriadas('')
  }

  const iniciarEdicion = (emp: EmpleadoNomina) => {
    setEditandoId(emp.id)
    setEditNombre(emp.nombre)
    setEditSalarioBase(emp.salarioBase.toString())
    setEditDiasLiquidados(emp.diasLiquidados.toString())
    setEditHorasDiurnas(emp.horasDiurnas.toString())
    setEditHorasNocturnas(emp.horasNocturnas.toString())
    setEditHorasFeriadas(emp.horasFeriadas.toString())
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
            horasNocturnas: parseFloat(editHorasNocturnas) || 0,
            horasFeriadas: parseFloat(editHorasFeriadas) || 0
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

  // Calcular totales parafiscales
  const totalesParafiscales = empleados.reduce((acc, emp) => {
    const parafiscales = calcularParafiscales(emp)
    return {
      salud: acc.salud + parafiscales.salud,
      pension: acc.pension + parafiscales.pension,
      arl: acc.arl + parafiscales.arl,
      sena: acc.sena + parafiscales.sena,
      icbf: acc.icbf + parafiscales.icbf,
      cofrem: acc.cofrem + parafiscales.cofrem,
      total: acc.total + parafiscales.salud + parafiscales.pension + parafiscales.arl + parafiscales.sena + parafiscales.icbf + parafiscales.cofrem
    }
  }, {
    salud: 0,
    pension: 0,
    arl: 0,
    sena: 0,
    icbf: 0,
    cofrem: 0,
    total: 0
  })

  // Calcular totales prestaciones
  const totalesPrestaciones = empleados.reduce((acc, emp) => {
    const prestaciones = calcularPrestaciones(emp)
    return {
      cesantias: acc.cesantias + prestaciones.cesantias,
      interesCesantias: acc.interesCesantias + prestaciones.interesCesantias,
      prima: acc.prima + prestaciones.prima,
      vacaciones: acc.vacaciones + prestaciones.vacaciones,
      total: acc.total + prestaciones.cesantias + prestaciones.interesCesantias + prestaciones.prima + prestaciones.vacaciones
    }
  }, {
    cesantias: 0,
    interesCesantias: 0,
    prima: 0,
    vacaciones: 0,
    total: 0
  })

  const exportarNominaAExcel = () => {
    const datos: any[] = [
      ['NÓMINA MENSUAL'],
      [],
      ['Nombre', 'Salario Base', 'Días Liq.', 'Salario Dev.', 'H. Diurnas', 'H. Nocturnas', 'H. Feriadas', 'Pago H. Extra', 'Aux. Trans.', 'Total Dev.', 'Salud (4%)', 'Pensión (4%)', 'Neto Pagado']
    ]

    empleados.forEach(emp => {
      const nomina = calcularNomina(emp)
      datos.push([
        emp.nombre,
        emp.salarioBase,
        emp.diasLiquidados,
        nomina.salarioDevengado,
        emp.horasDiurnas,
        emp.horasNocturnas,
        emp.horasFeriadas,
        nomina.pagoHorasExtras,
        nomina.auxilioTransporte,
        nomina.totalDevengado,
        nomina.salud,
        nomina.pension,
        nomina.netoPagado
      ])
    })

    datos.push([
      'TOTALES',
      totales.salarioBase,
      '',
      totales.salarioDevengado,
      '',
      '',
      '',
      totales.pagoHorasExtras,
      totales.auxilioTransporte,
      totales.totalDevengado,
      totales.salud,
      totales.pension,
      totales.netoPagado
    ])

    const ws = XLSX.utils.aoa_to_sheet(datos)
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Nómina')
    XLSX.writeFile(wb, 'nomina.xlsx')
  }

  const exportarParafiscalesAExcel = () => {
    const tipoEmpresa = sinAnimoLucro ? 'SIN ÁNIMO DE LUCRO' : 'CON ÁNIMO DE LUCRO'
    const personasJuridicas = conPersonasJuridicas ? 'Sí' : 'No'

    const datos: any[] = [
      ['PARAFISCALES'],
      [`Tipo de empresa: ${tipoEmpresa}`],
      [`Con al menos 2 personas o 1 jurídica: ${personasJuridicas}`],
      [],
      ['Nombre', 'Base', 'Salud (8.5%)', 'Pensión (12%)', 'ARL (0.522%)', 'SENA (2%)', 'ICBF (3%)', 'COFREM (4%)', 'Total']
    ]

    empleados.forEach(emp => {
      const nomina = calcularNomina(emp)
      const parafiscales = calcularParafiscales(emp)
      const totalParafiscales = parafiscales.salud + parafiscales.pension + parafiscales.arl + parafiscales.sena + parafiscales.icbf + parafiscales.cofrem
      
      datos.push([
        emp.nombre,
        nomina.baseParaDeducciones,
        parafiscales.salud,
        parafiscales.pension,
        parafiscales.arl,
        parafiscales.sena,
        parafiscales.icbf,
        parafiscales.cofrem,
        totalParafiscales
      ])
    })

    datos.push([
      'TOTALES',
      '',
      totalesParafiscales.salud,
      totalesParafiscales.pension,
      totalesParafiscales.arl,
      totalesParafiscales.sena,
      totalesParafiscales.icbf,
      totalesParafiscales.cofrem,
      totalesParafiscales.total
    ])

    const ws = XLSX.utils.aoa_to_sheet(datos)
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Parafiscales')
    XLSX.writeFile(wb, 'parafiscales.xlsx')
  }

  const exportarPrestacionesAExcel = () => {
    const datos: any[] = [
      ['PRESTACIONES SOCIALES'],
      [],
      ['Nombre', 'Base', 'Cesantías (8.33%)', 'Interés Cesantías (1%)', 'Prima (8.33%)', 'Vacaciones (4.16%)', 'Total']
    ]

    empleados.forEach(emp => {
      const nomina = calcularNomina(emp)
      const prestaciones = calcularPrestaciones(emp)
      const totalPrestaciones = prestaciones.cesantias + prestaciones.interesCesantias + prestaciones.prima + prestaciones.vacaciones
      
      datos.push([
        emp.nombre,
        nomina.baseParaDeducciones,
        prestaciones.cesantias,
        prestaciones.interesCesantias,
        prestaciones.prima,
        prestaciones.vacaciones,
        totalPrestaciones
      ])
    })

    datos.push([
      'TOTALES',
      '',
      totalesPrestaciones.cesantias,
      totalesPrestaciones.interesCesantias,
      totalesPrestaciones.prima,
      totalesPrestaciones.vacaciones,
      totalesPrestaciones.total
    ])

    const ws = XLSX.utils.aoa_to_sheet(datos)
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Prestaciones')
    XLSX.writeFile(wb, 'prestaciones_sociales.xlsx')
  }

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
          <div className="flex justify-end mt-4">
            <Button onClick={exportarNominaAExcel} disabled={empleados.length === 0}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
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
                  <TableHead className="text-right">H. Feriadas</TableHead>
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
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={horasFeriadas}
                      onChange={(e) => setHorasFeriadas(e.target.value)}
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
                        {esEdicion ? (
                          <Input
                            type="number"
                            step="0.5"
                            value={editHorasFeriadas}
                            onChange={(e) => setEditHorasFeriadas(e.target.value)}
                            className="text-right min-w-[80px]"
                          />
                        ) : (
                          emp.horasFeriadas
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

      {/* Sección de Parafiscales */}
      <Card>
        <CardHeader>
          <CardTitle>Parafiscales</CardTitle>
          <CardDescription>
            Aportes parafiscales según tipo de empresa
          </CardDescription>
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sinAnimoLucro"
                  checked={sinAnimoLucro}
                  onChange={(e) => setSinAnimoLucro(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="sinAnimoLucro">Empresa sin ánimo de lucro</Label>
              </div>
              {!sinAnimoLucro && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="conPersonasJuridicas"
                    checked={conPersonasJuridicas}
                    onChange={(e) => setConPersonasJuridicas(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="conPersonasJuridicas">Con al menos 2 personas o 1 jurídica</Label>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={exportarParafiscalesAExcel} disabled={empleados.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Salud (8.5%)</TableHead>
                  <TableHead className="text-right">Pensión (12%)</TableHead>
                  <TableHead className="text-right">ARL (0.522%)</TableHead>
                  <TableHead className="text-right">SENA (2%)</TableHead>
                  <TableHead className="text-right">ICBF (3%)</TableHead>
                  <TableHead className="text-right">COFREM (4%)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados.map((emp) => {
                  const nomina = calcularNomina(emp)
                  const parafiscales = calcularParafiscales(emp)
                  const totalParafiscales = parafiscales.salud + parafiscales.pension + parafiscales.arl + parafiscales.sena + parafiscales.icbf + parafiscales.cofrem

                  return (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.nombre}</TableCell>
                      <TableCell className="text-right">{formatCurrency(nomina.baseParaDeducciones)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(parafiscales.salud)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(parafiscales.pension)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(parafiscales.arl)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(parafiscales.sena)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(parafiscales.icbf)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(parafiscales.cofrem)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(totalParafiscales)}</TableCell>
                    </TableRow>
                  )
                })}

                {empleados.length > 0 && (
                  <TableRow className="bg-primary/10 font-bold border-t-2">
                    <TableCell>TOTALES</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesParafiscales.salud)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesParafiscales.pension)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesParafiscales.arl)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesParafiscales.sena)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesParafiscales.icbf)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesParafiscales.cofrem)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesParafiscales.total)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sección de Prestaciones Sociales */}
      <Card>
        <CardHeader>
          <CardTitle>Prestaciones Sociales</CardTitle>
          <CardDescription>
            Prestaciones sociales calculadas sobre el total devengado sin auxilio de transporte
          </CardDescription>
          <div className="flex justify-end mt-4">
            <Button onClick={exportarPrestacionesAExcel} disabled={empleados.length === 0}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Cesantías (8.33%)</TableHead>
                  <TableHead className="text-right">Interés Cesantías (1%)</TableHead>
                  <TableHead className="text-right">Prima (8.33%)</TableHead>
                  <TableHead className="text-right">Vacaciones (4.16%)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados.map((emp) => {
                  const nomina = calcularNomina(emp)
                  const prestaciones = calcularPrestaciones(emp)
                  const totalPrestaciones = prestaciones.cesantias + prestaciones.interesCesantias + prestaciones.prima + prestaciones.vacaciones

                  return (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.nombre}</TableCell>
                      <TableCell className="text-right">{formatCurrency(nomina.baseParaDeducciones)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(prestaciones.cesantias)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(prestaciones.interesCesantias)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(prestaciones.prima)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(prestaciones.vacaciones)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(totalPrestaciones)}</TableCell>
                    </TableRow>
                  )
                })}

                {empleados.length > 0 && (
                  <TableRow className="bg-primary/10 font-bold border-t-2">
                    <TableCell>TOTALES</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesPrestaciones.cesantias)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesPrestaciones.interesCesantias)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesPrestaciones.prima)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesPrestaciones.vacaciones)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalesPrestaciones.total)}</TableCell>
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
