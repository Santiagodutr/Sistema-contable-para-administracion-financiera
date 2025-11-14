import { useCuentasStore } from '@/stores/cuentasStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatPercentage } from '@/lib/utils'

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estado de Resultados</h1>
        <p className="text-muted-foreground mt-2">
          Rendimiento financiero de la empresa durante el período
        </p>
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
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingresos.map((cuenta) => (
                  <TableRow key={cuenta.codigo}>
                    <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                    <TableCell>{cuenta.nombre}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calcularSaldo(cuenta))}
                    </TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costos.map((cuenta) => (
                  <TableRow key={cuenta.codigo}>
                    <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                    <TableCell>{cuenta.nombre}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calcularSaldo(cuenta))}
                    </TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.map((cuenta) => (
                  <TableRow key={cuenta.codigo}>
                    <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                    <TableCell>{cuenta.nombre}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calcularSaldo(cuenta))}
                    </TableCell>
                  </TableRow>
                ))}
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
