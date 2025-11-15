import { useCuentasStore } from '@/stores/cuentasStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

const EstadoResultadosPage = () => {
  const { obtenerCuentasPorTipo, calcularSaldo } = useCuentasStore()

  const ingresos = obtenerCuentasPorTipo('4')
  const gastos = obtenerCuentasPorTipo('5')
  const costos = obtenerCuentasPorTipo('6')

  const totalIngresos = ingresos.reduce((sum, cuenta) => sum + calcularSaldo(cuenta), 0)
  const totalCostos = costos.reduce((sum, cuenta) => sum + calcularSaldo(cuenta), 0)
  const totalGastos = gastos.reduce((sum, cuenta) => sum + calcularSaldo(cuenta), 0)

  const utilidadBruta = totalIngresos - totalCostos
  const utilidadOperacional = utilidadBruta - totalGastos
  const utilidadNeta = utilidadOperacional

  const margenBruto = totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0
  const margenOperacional = totalIngresos > 0 ? (utilidadOperacional / totalIngresos) * 100 : 0
  const margenNeto = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0

  const exportarAExcel = () => {
    const datos = [
      ['ESTADO DE RESULTADOS'],
      [''],
      ['INGRESOS'],
      ['C\u00f3digo', 'Detalle', 'Monto'],
      ...ingresos.flatMap(cuenta => 
        cuenta.movimientos.map(mov => [
          cuenta.codigo,
          mov.descripcion,
          mov.monto
        ])
      ),
      ['', 'TOTAL INGRESOS', totalIngresos],
      [''],
      ['COSTOS DE VENTAS'],
      ['C\u00f3digo', 'Detalle', 'Monto'],
      ...costos.flatMap(cuenta => 
        cuenta.movimientos.map(mov => [
          cuenta.codigo,
          mov.descripcion,
          mov.monto
        ])
      ),
      ['', 'TOTAL COSTOS', totalCostos],
      [''],
      ['', 'UTILIDAD BRUTA', utilidadBruta],
      ['', `Margen Bruto: ${margenBruto.toFixed(2)}%`],
      [''],
      ['GASTOS OPERACIONALES'],
      ['C\u00f3digo', 'Detalle', 'Monto'],
      ...gastos.flatMap(cuenta => 
        cuenta.movimientos.map(mov => [
          cuenta.codigo,
          mov.descripcion,
          mov.monto
        ])
      ),
      ['', 'TOTAL GASTOS', totalGastos],
      [''],
      ['', 'UTILIDAD OPERACIONAL', utilidadOperacional],
      ['', `Margen Operacional: ${margenOperacional.toFixed(2)}%`],
      [''],
      ['', 'UTILIDAD NETA', utilidadNeta],
      ['', `Margen Neto: ${margenNeto.toFixed(2)}%`],
      [''],
      ['RESUMEN DEL PROCESO DE C\u00c1LCULO'],
      ['Concepto', 'Monto'],
      ['Ingresos', totalIngresos],
      ['(-) Costos de Ventas', -totalCostos],
      ['(=) Utilidad Bruta', utilidadBruta],
      [`C\u00e1lculo: ${totalIngresos} - ${totalCostos} = ${utilidadBruta}`],
      [''],
      ['(-) Gastos Operacionales', -totalGastos],
      ['(=) Utilidad Operacional', utilidadOperacional],
      [`C\u00e1lculo: ${utilidadBruta} - ${totalGastos} = ${utilidadOperacional}`],
      [''],
      ['(=) UTILIDAD NETA DEL PER\u00cdODO', utilidadNeta],
      [''],
      ['INDICADORES DE RENTABILIDAD'],
      ['Margen Bruto', `${margenBruto.toFixed(2)}%`],
      ['Margen Operacional', `${margenOperacional.toFixed(2)}%`],
      ['Margen Neto', `${margenNeto.toFixed(2)}%`]
    ]

    const ws = XLSX.utils.aoa_to_sheet(datos)
    ws['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 20 }]
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estado de Resultados')
    XLSX.writeFile(wb, 'estado_de_resultados.xlsx')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estado de Resultados</h1>
          <p className="text-muted-foreground mt-2">
            Rendimiento financiero de la empresa durante el per\u00edodo
          </p>
        </div>
        <Button onClick={exportarAExcel} variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar a Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
          <CardDescription>Ingresos operacionales del período</CardDescription>
        </CardHeader>
        <CardContent>
          {ingresos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingresos.flatMap((cuenta) => 
                  cuenta.movimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(mov.monto)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>TOTAL INGRESOS</TableCell>
                  <TableCell className="text-right text-lg">
                    {formatCurrency(totalIngresos)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay ingresos registrados
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Costos de Ventas</CardTitle>
          <CardDescription>Costos directamente relacionados con la producción</CardDescription>
        </CardHeader>
        <CardContent>
          {costos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costos.flatMap((cuenta) => 
                  cuenta.movimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(mov.monto)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>TOTAL COSTOS</TableCell>
                  <TableCell className="text-right text-lg">
                    {formatCurrency(totalCostos)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay costos registrados
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle>Utilidad Bruta</CardTitle>
          <CardDescription>Ingresos - Costos de Ventas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">
            {formatCurrency(utilidadBruta)}
          </div>
          {totalIngresos > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Margen Bruto: {formatPercentage(margenBruto)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos Operacionales</CardTitle>
          <CardDescription>Gastos necesarios para operar el negocio</CardDescription>
        </CardHeader>
        <CardContent>
          {gastos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.flatMap((cuenta) => 
                  cuenta.movimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(mov.monto)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>TOTAL GASTOS</TableCell>
                  <TableCell className="text-right text-lg">
                    {formatCurrency(totalGastos)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay gastos registrados
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Utilidad Operacional</CardTitle>
          <CardDescription>Utilidad Bruta - Gastos Operacionales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">
            {formatCurrency(utilidadOperacional)}
          </div>
          {totalIngresos > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Margen Operacional: {formatPercentage(margenOperacional)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-primary/10 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Utilidad Neta del Período</CardTitle>
          <CardDescription>Resultado final del ejercicio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(utilidadNeta)}
          </div>
          {totalIngresos > 0 && (
            <p className="text-lg text-muted-foreground mt-3">
              Margen Neto: {formatPercentage(margenNeto)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle>Resumen del Proceso de Cálculo</CardTitle>
          <CardDescription>Desarrollo numérico del estado de resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span>Ingresos</span>
              <span className="font-bold text-green-600">{formatCurrency(totalIngresos)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span>(-) Costos de Ventas</span>
              <span className="font-bold text-red-600">({formatCurrency(totalCostos)})</span>
            </div>
            <div className="border-t-2 border-slate-300 my-2"></div>
            <div className="flex justify-between items-center p-3 bg-green-100 rounded border border-green-300">
              <span className="font-semibold">(=) Utilidad Bruta</span>
              <span className="font-bold text-green-700">{formatCurrency(utilidadBruta)}</span>
            </div>
            <div className="text-xs text-muted-foreground ml-4">
              {formatCurrency(totalIngresos)} - {formatCurrency(totalCostos)} = {formatCurrency(utilidadBruta)}
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded border mt-4">
              <span>(-) Gastos Operacionales</span>
              <span className="font-bold text-red-600">({formatCurrency(totalGastos)})</span>
            </div>
            <div className="border-t-2 border-slate-300 my-2"></div>
            <div className="flex justify-between items-center p-3 bg-blue-100 rounded border border-blue-300">
              <span className="font-semibold">(=) Utilidad Operacional</span>
              <span className="font-bold text-blue-700">{formatCurrency(utilidadOperacional)}</span>
            </div>
            <div className="text-xs text-muted-foreground ml-4">
              {formatCurrency(utilidadBruta)} - {formatCurrency(totalGastos)} = {formatCurrency(utilidadOperacional)}
            </div>
            
            <div className="border-t-4 border-slate-400 my-4"></div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
              <span className="font-bold text-lg">(=) UTILIDAD NETA DEL PERÍODO</span>
              <span className={`font-bold text-2xl ${
                utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(utilidadNeta)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Rentabilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Margen Bruto</p>
              <p className="text-3xl font-bold">{formatPercentage(margenBruto)}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Margen Operacional</p>
              <p className="text-3xl font-bold">{formatPercentage(margenOperacional)}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Margen Neto</p>
              <p className="text-3xl font-bold">{formatPercentage(margenNeto)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EstadoResultadosPage
