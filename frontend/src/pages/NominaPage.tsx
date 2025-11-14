import { useState } from 'react'
import { useNominaStore, Empleado } from '@/stores/nominaStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Users, Trash2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const empleadoSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  salarioMensual: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'El salario debe ser mayor a 0'
  }),
})

const NominaPage = () => {
  const { empleados, agregarEmpleado, registrarPago, eliminarEmpleado, calcularDeducciones } = useNominaStore()
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(empleadoSchema),
  })

  const onSubmit = (data: any) => {
    agregarEmpleado({
      id: data.id,
      nombre: data.nombre,
      salarioMensual: parseFloat(data.salarioMensual),
    })
    toast.success('Empleado agregado exitosamente')
    reset()
  }

  const handleRegistrarPago = (idEmpleado: string) => {
    registrarPago(idEmpleado)
    toast.success('Pago registrado exitosamente')
  }

  const handleEliminar = (id: string) => {
    eliminarEmpleado(id)
    toast.success('Empleado eliminado')
    setSelectedEmpleado(null)
  }

  const calcularTotalesNomina = () => {
    const totales = empleados.reduce(
      (acc, emp) => {
        const deducciones = calcularDeducciones(emp.salarioMensual)
        return {
          salarioBruto: acc.salarioBruto + emp.salarioMensual,
          deducciones: acc.deducciones + deducciones.total,
          salarioNeto: acc.salarioNeto + (emp.salarioMensual - deducciones.total),
        }
      },
      { salarioBruto: 0, deducciones: 0, salarioNeto: 0 }
    )
    return totales
  }

  const totales = calcularTotalesNomina()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Nómina</h1>
        <p className="text-muted-foreground mt-2">
          Administre empleados y calcule la nómina mensual con deducciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Empleados</CardDescription>
            <CardTitle className="text-3xl">{empleados.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Nómina Mensual Bruta</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totales.salarioBruto)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Nómina Neta a Pagar</CardDescription>
            <CardTitle className="text-3xl text-green-600">{formatCurrency(totales.salarioNeto)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="empleados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empleados">Empleados</TabsTrigger>
          <TabsTrigger value="nuevo">Nuevo Empleado</TabsTrigger>
          <TabsTrigger value="nomina">Calcular Nómina</TabsTrigger>
        </TabsList>

        <TabsContent value="empleados">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Empleados</CardTitle>
              <CardDescription>Gestione la información de los empleados</CardDescription>
            </CardHeader>
            <CardContent>
              {empleados.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Salario Mensual</TableHead>
                      <TableHead className="text-right">Deducciones</TableHead>
                      <TableHead className="text-right">Salario Neto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empleados.map((empleado) => {
                      const deducciones = calcularDeducciones(empleado.salarioMensual)
                      const salarioNeto = empleado.salarioMensual - deducciones.total
                      return (
                        <TableRow key={empleado.id}>
                          <TableCell className="font-medium">{empleado.id}</TableCell>
                          <TableCell>{empleado.nombre}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(empleado.salarioMensual)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(deducciones.total)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(salarioNeto)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedEmpleado(empleado)}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleRegistrarPago(empleado.id)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleEliminar(empleado.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No hay empleados registrados
                </div>
              )}
            </CardContent>
          </Card>

          {selectedEmpleado && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Detalle: {selectedEmpleado.nombre}</CardTitle>
                <CardDescription>ID: {selectedEmpleado.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Salario Mensual</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedEmpleado.salarioMensual)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pagos Registrados</p>
                      <p className="text-2xl font-bold">{selectedEmpleado.pagos.length}</p>
                    </div>
                  </div>

                  {selectedEmpleado.pagos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Historial de Pagos</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Salario Bruto</TableHead>
                            <TableHead className="text-right">Deducciones</TableHead>
                            <TableHead className="text-right">Salario Neto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEmpleado.pagos.map((pago) => (
                            <TableRow key={pago.id}>
                              <TableCell>
                                {new Date(pago.fecha).toLocaleDateString('es-CO')}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(pago.salarioBruto)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(pago.deducciones.total)}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                {formatCurrency(pago.salarioNeto)}
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

        <TabsContent value="nuevo">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Empleado</CardTitle>
              <CardDescription>Complete el formulario para registrar un empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id">ID del Empleado</Label>
                  <Input id="id" placeholder="Ej: EMP001" {...register('id')} />
                  {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" placeholder="Ej: Juan Pérez" {...register('nombre')} />
                  {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salarioMensual">Salario Mensual</Label>
                  <Input
                    id="salarioMensual"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('salarioMensual')}
                  />
                  {errors.salarioMensual && (
                    <p className="text-sm text-destructive">{errors.salarioMensual.message}</p>
                  )}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Deducciones: Salud 4% + Pensión 4% = 8% del salario
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Empleado
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nomina">
          <Card>
            <CardHeader>
              <CardTitle>Nómina Mensual</CardTitle>
              <CardDescription>Resumen completo de la nómina del mes</CardDescription>
            </CardHeader>
            <CardContent>
              {empleados.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Salario Bruto</TableHead>
                        <TableHead className="text-right">Salud (4%)</TableHead>
                        <TableHead className="text-right">Pensión (4%)</TableHead>
                        <TableHead className="text-right">Total Ded.</TableHead>
                        <TableHead className="text-right">Salario Neto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empleados.map((empleado) => {
                        const deducciones = calcularDeducciones(empleado.salarioMensual)
                        const salarioNeto = empleado.salarioMensual - deducciones.total
                        return (
                          <TableRow key={empleado.id}>
                            <TableCell className="font-medium">{empleado.id}</TableCell>
                            <TableCell>{empleado.nombre}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(empleado.salarioMensual)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(deducciones.salud)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(deducciones.pension)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(deducciones.total)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(salarioNeto)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="bg-primary/10 font-bold">
                        <TableCell colSpan={2}>TOTALES</TableCell>
                        <TableCell className="text-right">{formatCurrency(totales.salarioBruto)}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                        <TableCell className="text-right">{formatCurrency(totales.deducciones)}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(totales.salarioNeto)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Salarios Brutos</p>
                        <p className="text-2xl font-bold">{formatCurrency(totales.salarioBruto)}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Deducciones</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totales.deducciones)}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 mb-1">Total Nómina Neta</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totales.salarioNeto)}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No hay empleados para calcular nómina
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NominaPage
