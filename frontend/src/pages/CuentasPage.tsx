import { useState } from 'react'
import { useCuentasStore, Cuenta } from '@/stores/cuentasStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const cuentaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.enum(['1', '2', '3', '4', '5', '6'], { required_error: 'Seleccione un tipo' }),
})

const movimientoSchema = z.object({
  codigo: z.string().min(1, 'Seleccione una cuenta'),
  tipo: z.enum(['debito', 'credito'], { required_error: 'Seleccione el tipo' }),
  monto: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'El monto debe ser mayor a 0'
  }),
  descripcion: z.string().min(1, 'La descripción es requerida'),
})

const CuentasPage = () => {
  const { cuentas, agregarCuenta, registrarMovimiento, eliminarCuenta, calcularSaldo } = useCuentasStore()
  const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null)

  const {
    register: registerCuenta,
    handleSubmit: handleSubmitCuenta,
    reset: resetCuenta,
    formState: { errors: errorsCuenta },
  } = useForm({
    resolver: zodResolver(cuentaSchema),
  })

  const {
    register: registerMovimiento,
    handleSubmit: handleSubmitMovimiento,
    reset: resetMovimiento,
    formState: { errors: errorsMovimiento },
  } = useForm({
    resolver: zodResolver(movimientoSchema),
  })

  const tiposCuenta = {
    '1': 'Activo',
    '2': 'Pasivo',
    '3': 'Patrimonio',
    '4': 'Ingreso',
    '5': 'Gasto',
    '6': 'Costo',
  }

  const onSubmitCuenta = (data: any) => {
    agregarCuenta({
      codigo: data.codigo,
      nombre: data.nombre,
      tipo: data.tipo,
    })
    toast.success('Cuenta agregada exitosamente')
    resetCuenta()
  }

  const onSubmitMovimiento = (data: any) => {
    registrarMovimiento(data.codigo, {
      tipo: data.tipo,
      monto: parseFloat(data.monto),
      descripcion: data.descripcion,
      fecha: new Date(),
    })
    toast.success('Movimiento registrado exitosamente')
    resetMovimiento()
  }

  const handleEliminarCuenta = (codigo: string) => {
    eliminarCuenta(codigo)
    toast.success('Cuenta eliminada')
    setSelectedCuenta(null)
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
          <TabsTrigger value="nueva">Nueva Cuenta</TabsTrigger>
          <TabsTrigger value="movimiento">Registrar Movimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="cuentas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan de Cuentas</CardTitle>
              <CardDescription>
                Total de cuentas: {cuentas.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(tiposCuenta).map(([codigo, nombre]) => {
                const cuentasTipo = cuentas.filter(c => c.tipo === codigo)
                if (cuentasTipo.length === 0) return null

                return (
                  <div key={codigo} className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">{nombre}s</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="text-right">Débito</TableHead>
                          <TableHead className="text-right">Crédito</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cuentasTipo.map((cuenta) => (
                          <TableRow key={cuenta.codigo}>
                            <TableCell className="font-medium">{cuenta.codigo}</TableCell>
                            <TableCell>{cuenta.nombre}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(cuenta.saldoDebito)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(cuenta.saldoCredito)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(calcularSaldo(cuenta))}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCuenta(cuenta)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleEliminarCuenta(cuenta.codigo)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}

              {cuentas.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No hay cuentas registradas. Cree una nueva cuenta para comenzar.
                </div>
              )}
            </CardContent>
          </Card>

          {selectedCuenta && (
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Cuenta: {selectedCuenta.codigo} - {selectedCuenta.nombre}</CardTitle>
                <CardDescription>
                  Tipo: {tiposCuenta[selectedCuenta.tipo as keyof typeof tiposCuenta]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Débito</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedCuenta.saldoDebito)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Crédito</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedCuenta.saldoCredito)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Final</p>
                      <p className="text-2xl font-bold">{formatCurrency(calcularSaldo(selectedCuenta))}</p>
                    </div>
                  </div>

                  {selectedCuenta.movimientos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Movimientos</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCuenta.movimientos.map((mov) => (
                            <TableRow key={mov.id}>
                              <TableCell>
                                {new Date(mov.fecha).toLocaleDateString('es-CO')}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  mov.tipo === 'debito' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {mov.tipo.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell>{mov.descripcion}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(mov.monto)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="nueva">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nueva Cuenta</CardTitle>
              <CardDescription>
                Complete el formulario para agregar una cuenta al plan de cuentas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCuenta(onSubmitCuenta)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de Cuenta</Label>
                  <Input
                    id="codigo"
                    placeholder="Ej: 1.1.01"
                    {...registerCuenta('codigo')}
                  />
                  {errorsCuenta.codigo && (
                    <p className="text-sm text-destructive">{errorsCuenta.codigo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Cuenta</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Caja General"
                    {...registerCuenta('nombre')}
                  />
                  {errorsCuenta.nombre && (
                    <p className="text-sm text-destructive">{errorsCuenta.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Cuenta</Label>
                  <select
                    id="tipo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...registerCuenta('tipo')}
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="1">1 - Activo</option>
                    <option value="2">2 - Pasivo</option>
                    <option value="3">3 - Patrimonio</option>
                    <option value="4">4 - Ingreso</option>
                    <option value="5">5 - Gasto</option>
                    <option value="6">6 - Costo</option>
                  </select>
                  {errorsCuenta.tipo && (
                    <p className="text-sm text-destructive">{errorsCuenta.tipo.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Cuenta
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimiento">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Movimiento</CardTitle>
              <CardDescription>
                Registre débitos o créditos en las cuentas contables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitMovimiento(onSubmitMovimiento)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cuenta">Cuenta</Label>
                  <select
                    id="cuenta"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...registerMovimiento('codigo')}
                  >
                    <option value="">Seleccione una cuenta</option>
                    {cuentas.map((cuenta) => (
                      <option key={cuenta.codigo} value={cuenta.codigo}>
                        {cuenta.codigo} - {cuenta.nombre}
                      </option>
                    ))}
                  </select>
                  {errorsMovimiento.codigo && (
                    <p className="text-sm text-destructive">{errorsMovimiento.codigo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoMov">Tipo de Movimiento</Label>
                  <select
                    id="tipoMov"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...registerMovimiento('tipo')}
                  >
                    <option value="">Seleccione el tipo</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                  {errorsMovimiento.tipo && (
                    <p className="text-sm text-destructive">{errorsMovimiento.tipo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...registerMovimiento('monto')}
                  />
                  {errorsMovimiento.monto && (
                    <p className="text-sm text-destructive">{errorsMovimiento.monto.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    placeholder="Descripción del movimiento"
                    {...registerMovimiento('descripcion')}
                  />
                  {errorsMovimiento.descripcion && (
                    <p className="text-sm text-destructive">{errorsMovimiento.descripcion.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Movimiento
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CuentasPage
