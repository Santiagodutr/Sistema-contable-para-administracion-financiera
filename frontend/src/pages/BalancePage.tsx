import { useCuentasStore } from '@/stores/cuentasStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

const BalancePage = () => {
  const { cuentas, calcularSaldo, obtenerCuentasPorTipo } = useCuentasStore()

  const activos = obtenerCuentasPorTipo('1')
  const pasivos = obtenerCuentasPorTipo('2')
  const patrimonio = obtenerCuentasPorTipo('3')

  const totalActivos = activos.reduce((sum, cuenta) => sum + calcularSaldo(cuenta), 0)
  const totalPasivos = pasivos.reduce((sum, cuenta) => sum + calcularSaldo(cuenta), 0)
  const totalPatrimonio = totalActivos - totalPasivos // Patrimonio = Activos - Pasivos
  const totalPasivoPatrimonio = totalPasivos + totalPatrimonio

  const diferencia = Math.abs(totalActivos - totalPasivoPatrimonio)
  const balanceCuadrado = diferencia < 0.01

  const exportarAExcel = () => {
    const datos = [
      ['BALANCE GENERAL'],
      [''],
      ['ACTIVOS'],
      ['C\u00f3digo', 'Detalle', 'Saldo'],
      ...activos.flatMap(cuenta => 
        cuenta.movimientos.map(mov => [
          cuenta.codigo,
          mov.descripcion,
          mov.tipo === 'debito' ? mov.monto : -mov.monto
        ])
      ),
      ['', 'TOTAL ACTIVOS', totalActivos],
      [''],
      ['PASIVOS'],
      ['C\u00f3digo', 'Detalle', 'Saldo'],
      ...pasivos.flatMap(cuenta => 
        cuenta.movimientos.map(mov => [
          cuenta.codigo,
          mov.descripcion,
          mov.tipo === 'credito' ? mov.monto : -mov.monto
        ])
      ),
      ['', 'TOTAL PASIVOS', totalPasivos],
      [''],
      ['PATRIMONIO'],
      ['C\u00f3digo', 'Detalle', 'Saldo'],
      ...patrimonio.flatMap(cuenta => 
        cuenta.movimientos.map(mov => [
          cuenta.codigo,
          mov.descripcion,
          mov.tipo === 'credito' ? mov.monto : -mov.monto
        ])
      ),
      ['', 'TOTAL PATRIMONIO (Activos - Pasivos)', totalPatrimonio],
      [''],
      ['RESUMEN'],
      ['Total Activos', totalActivos],
      ['Total Pasivos', totalPasivos],
      ['Total Patrimonio', totalPatrimonio],
      ['Total Pasivo + Patrimonio', totalPasivoPatrimonio],
      ['', balanceCuadrado ? 'BALANCE CUADRADO' : `DIFERENCIA: ${diferencia}`]
    ]

    const ws = XLSX.utils.aoa_to_sheet(datos)
    ws['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 20 }]
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Balance General')
    XLSX.writeFile(wb, 'balance_general.xlsx')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Balance General</h1>
          <p className="text-muted-foreground mt-2">
            Estado de la situaci\u00f3n financiera de la empresa
          </p>
        </div>
        <Button onClick={exportarAExcel} variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar a Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activos</CardTitle>
          <CardDescription>Recursos económicos controlados por la empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {activos.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.flatMap((cuenta) => 
                    cuenta.movimientos.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                        <TableCell>{mov.descripcion}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(mov.tipo === 'debito' ? mov.monto : -mov.monto)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2}>TOTAL ACTIVOS</TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(totalActivos)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay activos registrados
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pasivos</CardTitle>
          <CardDescription>Obligaciones presentes de la empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {pasivos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pasivos.flatMap((cuenta) => 
                  cuenta.movimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(mov.tipo === 'credito' ? mov.monto : -mov.monto)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>TOTAL PASIVOS</TableCell>
                  <TableCell className="text-right text-lg">
                    {formatCurrency(totalPasivos)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay pasivos registrados
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patrimonio</CardTitle>
          <CardDescription>Participación de los propietarios en la empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {patrimonio.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patrimonio.flatMap((cuenta) => 
                  cuenta.movimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(mov.tipo === 'credito' ? mov.monto : -mov.monto)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>TOTAL PATRIMONIO</TableCell>
                  <TableCell className="text-right text-lg">
                    {formatCurrency(totalPatrimonio)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay patrimonio registrado
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Resumen del Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Activos</p>
              <p className="text-3xl font-bold">{formatCurrency(totalActivos)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pasivos</p>
              <p className="text-3xl font-bold">{formatCurrency(totalPasivos)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Patrimonio</p>
              <p className="text-3xl font-bold">{formatCurrency(totalPatrimonio)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Pasivo + Patrimonio</span>
              <span className="text-2xl font-bold">{formatCurrency(totalPasivoPatrimonio)}</span>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            balanceCuadrado ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
          }`}>
            {balanceCuadrado ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">
                  Balance cuadrado: Activos = Pasivos + Patrimonio
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">
                  Advertencia: Diferencia de {formatCurrency(diferencia)}. 
                  El balance no está cuadrado. Verifique los movimientos.
                </span>
              </>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Ecuación Contable:</h4>
            <p className="text-lg">
              Activos ({formatCurrency(totalActivos)}) = 
              Pasivos ({formatCurrency(totalPasivos)}) + 
              Patrimonio ({formatCurrency(totalPatrimonio)})
            </p>
          </div>
        </CardContent>
      </Card>

      {cuentas.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No hay cuentas registradas</p>
              <p>Agregue cuentas en el módulo de "Cuentas Contables" para ver el balance</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BalancePage
