import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface DatosPeriodo {
  activos: number
  pasivos: number
  patrimonio: number
  ingresos: number
  gastos: number
}

const AnalisisFinancieroPage = () => {
  const [periodo1, setPeriodo1] = useState<DatosPeriodo>({
    activos: 0,
    pasivos: 0,
    patrimonio: 0,
    ingresos: 0,
    gastos: 0,
  })

  const [periodo2, setPeriodo2] = useState<DatosPeriodo>({
    activos: 0,
    pasivos: 0,
    patrimonio: 0,
    ingresos: 0,
    gastos: 0,
  })

  const [datosVertical, setDatosVertical] = useState({
    activoCorriente: 0,
    activoNoCorriente: 0,
    pasivoCorriente: 0,
    pasivoNoCorriente: 0,
    patrimonio: 0,
    ingresos: 0,
    costos: 0,
    gastosOp: 0,
    otrosGastos: 0,
  })

  const calcularVariacion = (valor1: number, valor2: number) => {
    const variacionAbs = valor2 - valor1
    const variacionPorc = valor1 !== 0 ? (variacionAbs / valor1) * 100 : 0
    return { absoluta: variacionAbs, porcentual: variacionPorc }
  }

  const utilidad1 = periodo1.ingresos - periodo1.gastos
  const utilidad2 = periodo2.ingresos - periodo2.gastos

  // Análisis Vertical
  const totalActivos = datosVertical.activoCorriente + datosVertical.activoNoCorriente
  const totalPasivos = datosVertical.pasivoCorriente + datosVertical.pasivoNoCorriente
  const utilidadBruta = datosVertical.ingresos - datosVertical.costos
  const utilidadOperacional = utilidadBruta - datosVertical.gastosOp
  const utilidadNeta = utilidadOperacional - datosVertical.otrosGastos

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análisis Financiero</h1>
        <p className="text-muted-foreground mt-2">
          Análisis horizontal y vertical de estados financieros
        </p>
      </div>

      <Tabs defaultValue="horizontal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="horizontal">Análisis Horizontal</TabsTrigger>
          <TabsTrigger value="vertical">Análisis Vertical</TabsTrigger>
        </TabsList>

        <TabsContent value="horizontal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Horizontal</CardTitle>
              <CardDescription>Comparación entre dos períodos contables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Período 1 (Año Anterior)</h3>
                  <div className="space-y-2">
                    <Label>Total Activos</Label>
                    <Input
                      type="number"
                      value={periodo1.activos}
                      onChange={(e) =>
                        setPeriodo1({ ...periodo1, activos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Pasivos</Label>
                    <Input
                      type="number"
                      value={periodo1.pasivos}
                      onChange={(e) =>
                        setPeriodo1({ ...periodo1, pasivos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Patrimonio</Label>
                    <Input
                      type="number"
                      value={periodo1.patrimonio}
                      onChange={(e) =>
                        setPeriodo1({ ...periodo1, patrimonio: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Ingresos</Label>
                    <Input
                      type="number"
                      value={periodo1.ingresos}
                      onChange={(e) =>
                        setPeriodo1({ ...periodo1, ingresos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Gastos</Label>
                    <Input
                      type="number"
                      value={periodo1.gastos}
                      onChange={(e) =>
                        setPeriodo1({ ...periodo1, gastos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Período 2 (Año Actual)</h3>
                  <div className="space-y-2">
                    <Label>Total Activos</Label>
                    <Input
                      type="number"
                      value={periodo2.activos}
                      onChange={(e) =>
                        setPeriodo2({ ...periodo2, activos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Pasivos</Label>
                    <Input
                      type="number"
                      value={periodo2.pasivos}
                      onChange={(e) =>
                        setPeriodo2({ ...periodo2, pasivos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Patrimonio</Label>
                    <Input
                      type="number"
                      value={periodo2.patrimonio}
                      onChange={(e) =>
                        setPeriodo2({ ...periodo2, patrimonio: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Ingresos</Label>
                    <Input
                      type="number"
                      value={periodo2.ingresos}
                      onChange={(e) =>
                        setPeriodo2({ ...periodo2, ingresos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Gastos</Label>
                    <Input
                      type="number"
                      value={periodo2.gastos}
                      onChange={(e) =>
                        setPeriodo2({ ...periodo2, gastos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultados del Análisis Horizontal</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cuenta</TableHead>
                    <TableHead className="text-right">Período 1</TableHead>
                    <TableHead className="text-right">Período 2</TableHead>
                    <TableHead className="text-right">Variación $</TableHead>
                    <TableHead className="text-right">Variación %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { nombre: 'Activos', p1: periodo1.activos, p2: periodo2.activos },
                    { nombre: 'Pasivos', p1: periodo1.pasivos, p2: periodo2.pasivos },
                    { nombre: 'Patrimonio', p1: periodo1.patrimonio, p2: periodo2.patrimonio },
                    { nombre: 'Ingresos', p1: periodo1.ingresos, p2: periodo2.ingresos },
                    { nombre: 'Gastos', p1: periodo1.gastos, p2: periodo2.gastos },
                    { nombre: 'Utilidad', p1: utilidad1, p2: utilidad2 },
                  ].map((item) => {
                    const variacion = calcularVariacion(item.p1, item.p2)
                    return (
                      <TableRow key={item.nombre}>
                        <TableCell className="font-medium">{item.nombre}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.p1)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.p2)}</TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            variacion.absoluta >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(variacion.absoluta)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            variacion.porcentual >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(variacion.porcentual)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interpretación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {calcularVariacion(periodo1.activos, periodo2.activos).porcentual !== 0 && (
                <p>
                  • Los activos {calcularVariacion(periodo1.activos, periodo2.activos).porcentual > 0 ? 'aumentaron' : 'disminuyeron'} en{' '}
                  {formatPercentage(Math.abs(calcularVariacion(periodo1.activos, periodo2.activos).porcentual))}
                </p>
              )}
              {calcularVariacion(periodo1.ingresos, periodo2.ingresos).porcentual !== 0 && (
                <p>
                  • Los ingresos {calcularVariacion(periodo1.ingresos, periodo2.ingresos).porcentual > 0 ? 'crecieron' : 'disminuyeron'} en{' '}
                  {formatPercentage(Math.abs(calcularVariacion(periodo1.ingresos, periodo2.ingresos).porcentual))}
                </p>
              )}
              {calcularVariacion(utilidad1, utilidad2).porcentual !== 0 && (
                <p>
                  • La utilidad {calcularVariacion(utilidad1, utilidad2).porcentual > 0 ? 'mejoró' : 'se redujo'} en{' '}
                  {formatPercentage(Math.abs(calcularVariacion(utilidad1, utilidad2).porcentual))}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vertical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Vertical</CardTitle>
              <CardDescription>Estructura porcentual de los estados financieros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Balance General</h3>
                  <div className="space-y-2">
                    <Label>Activo Corriente</Label>
                    <Input
                      type="number"
                      value={datosVertical.activoCorriente}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, activoCorriente: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Activo No Corriente</Label>
                    <Input
                      type="number"
                      value={datosVertical.activoNoCorriente}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, activoNoCorriente: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pasivo Corriente</Label>
                    <Input
                      type="number"
                      value={datosVertical.pasivoCorriente}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, pasivoCorriente: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pasivo No Corriente</Label>
                    <Input
                      type="number"
                      value={datosVertical.pasivoNoCorriente}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, pasivoNoCorriente: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Patrimonio</Label>
                    <Input
                      type="number"
                      value={datosVertical.patrimonio}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, patrimonio: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Estado de Resultados</h3>
                  <div className="space-y-2">
                    <Label>Ingresos</Label>
                    <Input
                      type="number"
                      value={datosVertical.ingresos}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, ingresos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Costos de Ventas</Label>
                    <Input
                      type="number"
                      value={datosVertical.costos}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, costos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gastos Operacionales</Label>
                    <Input
                      type="number"
                      value={datosVertical.gastosOp}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, gastosOp: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Otros Gastos</Label>
                    <Input
                      type="number"
                      value={datosVertical.otrosGastos}
                      onChange={(e) =>
                        setDatosVertical({ ...datosVertical, otrosGastos: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance General - Análisis Vertical</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">% del Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="font-semibold">
                      <TableCell>ACTIVOS</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">Activo Corriente</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.activoCorriente)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(totalActivos > 0 ? (datosVertical.activoCorriente / totalActivos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">Activo No Corriente</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.activoNoCorriente)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(totalActivos > 0 ? (datosVertical.activoNoCorriente / totalActivos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted font-semibold">
                      <TableCell>TOTAL ACTIVOS</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalActivos)}</TableCell>
                      <TableCell className="text-right">100.00%</TableCell>
                    </TableRow>
                    <TableRow className="font-semibold">
                      <TableCell>PASIVOS</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">Pasivo Corriente</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.pasivoCorriente)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(totalActivos > 0 ? (datosVertical.pasivoCorriente / totalActivos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">Pasivo No Corriente</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.pasivoNoCorriente)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(totalActivos > 0 ? (datosVertical.pasivoNoCorriente / totalActivos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted font-semibold">
                      <TableCell>TOTAL PASIVOS</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalPasivos)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(totalActivos > 0 ? (totalPasivos / totalActivos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted font-semibold">
                      <TableCell>PATRIMONIO</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.patrimonio)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(totalActivos > 0 ? (datosVertical.patrimonio / totalActivos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Resultados - Análisis Vertical</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">% de Ingresos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted font-semibold">
                      <TableCell>Ingresos</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.ingresos)}</TableCell>
                      <TableCell className="text-right">100.00%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Costos de Ventas</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.costos)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(datosVertical.ingresos > 0 ? (datosVertical.costos / datosVertical.ingresos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-green-50 font-semibold">
                      <TableCell>Utilidad Bruta</TableCell>
                      <TableCell className="text-right">{formatCurrency(utilidadBruta)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(datosVertical.ingresos > 0 ? (utilidadBruta / datosVertical.ingresos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Gastos Operacionales</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.gastosOp)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(datosVertical.ingresos > 0 ? (datosVertical.gastosOp / datosVertical.ingresos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-50 font-semibold">
                      <TableCell>Utilidad Operacional</TableCell>
                      <TableCell className="text-right">{formatCurrency(utilidadOperacional)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(datosVertical.ingresos > 0 ? (utilidadOperacional / datosVertical.ingresos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Otros Gastos</TableCell>
                      <TableCell className="text-right">{formatCurrency(datosVertical.otrosGastos)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(datosVertical.ingresos > 0 ? (datosVertical.otrosGastos / datosVertical.ingresos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-primary/10 font-bold">
                      <TableCell>UTILIDAD NETA</TableCell>
                      <TableCell className="text-right">{formatCurrency(utilidadNeta)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(datosVertical.ingresos > 0 ? (utilidadNeta / datosVertical.ingresos) * 100 : 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores Financieros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Endeudamiento</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(totalActivos > 0 ? (totalPasivos / totalActivos) * 100 : 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Patrimonio</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(totalActivos > 0 ? (datosVertical.patrimonio / totalActivos) * 100 : 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margen Bruto</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(datosVertical.ingresos > 0 ? (utilidadBruta / datosVertical.ingresos) * 100 : 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margen Operacional</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(datosVertical.ingresos > 0 ? (utilidadOperacional / datosVertical.ingresos) * 100 : 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margen Neto</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(datosVertical.ingresos > 0 ? (utilidadNeta / datosVertical.ingresos) * 100 : 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalisisFinancieroPage
