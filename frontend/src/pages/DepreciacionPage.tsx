import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const activoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  valorInicial: z.number().min(1, 'El valor inicial debe ser mayor a 0'),
  valorResidual: z.number().min(0, 'El valor residual debe ser mayor o igual a 0'),
  vidaUtil: z.number().min(1, 'La vida útil debe ser mayor a 0'),
  tasaFija: z.number().min(0).max(100).optional(),
})

type ActivoFormData = z.infer<typeof activoSchema>

interface RegistroDepreciacion {
  periodo: number
  depreciacionPeriodo: number
  depreciacionAcumulada: number
  valorLibros: number
}

const DepreciacionPage = () => {
  const [tablaLineaRecta, setTablaLineaRecta] = useState<RegistroDepreciacion[]>([])
  const [tablaSumaDigitos, setTablaSumaDigitos] = useState<RegistroDepreciacion[]>([])
  const [tablaTasaFija, setTablaTasaFija] = useState<RegistroDepreciacion[]>([])

  const formLineaRecta = useForm<ActivoFormData>({
    resolver: zodResolver(activoSchema),
    defaultValues: {
      nombre: '',
      valorInicial: 0,
      valorResidual: 0,
      vidaUtil: 5,
    },
  })

  const formSumaDigitos = useForm<ActivoFormData>({
    resolver: zodResolver(activoSchema),
    defaultValues: {
      nombre: '',
      valorInicial: 0,
      valorResidual: 0,
      vidaUtil: 5,
    },
  })

  const formTasaFija = useForm<ActivoFormData>({
    resolver: zodResolver(activoSchema),
    defaultValues: {
      nombre: '',
      valorInicial: 0,
      valorResidual: 0,
      vidaUtil: 5,
      tasaFija: 20,
    },
  })

  const calcularLineaRecta = (data: ActivoFormData) => {
    const valorDepreciable = data.valorInicial - data.valorResidual
    const depreciacionAnual = valorDepreciable / data.vidaUtil

    const tabla: RegistroDepreciacion[] = []
    let depreciacionAcum = 0

    for (let i = 1; i <= data.vidaUtil; i++) {
      depreciacionAcum += depreciacionAnual
      tabla.push({
        periodo: i,
        depreciacionPeriodo: depreciacionAnual,
        depreciacionAcumulada: depreciacionAcum,
        valorLibros: data.valorInicial - depreciacionAcum,
      })
    }

    setTablaLineaRecta(tabla)
  }

  const calcularSumaDigitos = (data: ActivoFormData) => {
    const valorDepreciable = data.valorInicial - data.valorResidual
    const sumaDigitos = (data.vidaUtil * (data.vidaUtil + 1)) / 2

    const tabla: RegistroDepreciacion[] = []
    let depreciacionAcum = 0

    for (let i = 1; i <= data.vidaUtil; i++) {
      const factor = (data.vidaUtil - i + 1) / sumaDigitos
      const depreciacionPeriodo = valorDepreciable * factor
      depreciacionAcum += depreciacionPeriodo

      tabla.push({
        periodo: i,
        depreciacionPeriodo,
        depreciacionAcumulada: depreciacionAcum,
        valorLibros: data.valorInicial - depreciacionAcum,
      })
    }

    setTablaSumaDigitos(tabla)
  }

  const calcularTasaFija = (data: ActivoFormData) => {
    const tasa = (data.tasaFija || 20) / 100

    const tabla: RegistroDepreciacion[] = []
    let valorLibros = data.valorInicial
    let depreciacionAcum = 0

    for (let i = 1; i <= data.vidaUtil; i++) {
      let depreciacionPeriodo = valorLibros * tasa

      // Ajuste en el último período para no pasar del valor residual
      if (i === data.vidaUtil) {
        depreciacionPeriodo = Math.max(0, valorLibros - data.valorResidual)
      }

      // No depreciar por debajo del valor residual
      if (valorLibros - depreciacionPeriodo < data.valorResidual) {
        depreciacionPeriodo = valorLibros - data.valorResidual
      }

      depreciacionAcum += depreciacionPeriodo
      valorLibros -= depreciacionPeriodo

      tabla.push({
        periodo: i,
        depreciacionPeriodo,
        depreciacionAcumulada: depreciacionAcum,
        valorLibros,
      })

      // Si ya llegamos al valor residual, completar la tabla sin más depreciación
      if (valorLibros <= data.valorResidual) {
        for (let j = i + 1; j <= data.vidaUtil; j++) {
          tabla.push({
            periodo: j,
            depreciacionPeriodo: 0,
            depreciacionAcumulada: depreciacionAcum,
            valorLibros: data.valorResidual,
          })
        }
        break
      }
    }

    setTablaTasaFija(tabla)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Depreciación de Activos</h1>
        <p className="text-muted-foreground mt-2">
          Cálculo de depreciación por diferentes métodos
        </p>
      </div>

      <Tabs defaultValue="linea-recta" className="space-y-4">
        <TabsList>
          <TabsTrigger value="linea-recta">Línea Recta</TabsTrigger>
          <TabsTrigger value="suma-digitos">Suma de Dígitos</TabsTrigger>
          <TabsTrigger value="tasa-fija">Tasa Fija (Saldos Decrecientes)</TabsTrigger>
        </TabsList>

        <TabsContent value="linea-recta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Método de Línea Recta</CardTitle>
              <CardDescription>
                Depreciación constante durante toda la vida útil del activo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={formLineaRecta.handleSubmit(calcularLineaRecta)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Activo</Label>
                    <Input
                      {...formLineaRecta.register('nombre')}
                      placeholder="Ej: Vehículo"
                    />
                    {formLineaRecta.formState.errors.nombre && (
                      <p className="text-sm text-red-500">{formLineaRecta.formState.errors.nombre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Inicial ($)</Label>
                    <Input
                      type="number"
                      {...formLineaRecta.register('valorInicial', { valueAsNumber: true })}
                      placeholder="100000000"
                    />
                    {formLineaRecta.formState.errors.valorInicial && (
                      <p className="text-sm text-red-500">{formLineaRecta.formState.errors.valorInicial.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Residual ($)</Label>
                    <Input
                      type="number"
                      {...formLineaRecta.register('valorResidual', { valueAsNumber: true })}
                      placeholder="10000000"
                    />
                    {formLineaRecta.formState.errors.valorResidual && (
                      <p className="text-sm text-red-500">{formLineaRecta.formState.errors.valorResidual.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Vida Útil (años)</Label>
                    <Input
                      type="number"
                      {...formLineaRecta.register('vidaUtil', { valueAsNumber: true })}
                      placeholder="5"
                    />
                    {formLineaRecta.formState.errors.vidaUtil && (
                      <p className="text-sm text-red-500">{formLineaRecta.formState.errors.vidaUtil.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Depreciación
                </Button>
              </form>
            </CardContent>
          </Card>

          {tablaLineaRecta.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Depreciación - Línea Recta</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Año</TableHead>
                      <TableHead className="text-right">Depreciación del Período</TableHead>
                      <TableHead className="text-right">Depreciación Acumulada</TableHead>
                      <TableHead className="text-right">Valor en Libros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablaLineaRecta.map((registro) => (
                      <TableRow key={registro.periodo}>
                        <TableCell className="font-medium">{registro.periodo}</TableCell>
                        <TableCell className="text-right">{formatCurrency(registro.depreciacionPeriodo)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(registro.depreciacionAcumulada)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(registro.valorLibros)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Fórmula:</p>
                  <p className="text-sm">Depreciación Anual = (Valor Inicial - Valor Residual) / Vida Útil</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suma-digitos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Método de Suma de Dígitos</CardTitle>
              <CardDescription>
                Mayor depreciación en los primeros años (método acelerado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={formSumaDigitos.handleSubmit(calcularSumaDigitos)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Activo</Label>
                    <Input
                      {...formSumaDigitos.register('nombre')}
                      placeholder="Ej: Maquinaria"
                    />
                    {formSumaDigitos.formState.errors.nombre && (
                      <p className="text-sm text-red-500">{formSumaDigitos.formState.errors.nombre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Inicial ($)</Label>
                    <Input
                      type="number"
                      {...formSumaDigitos.register('valorInicial', { valueAsNumber: true })}
                      placeholder="100000000"
                    />
                    {formSumaDigitos.formState.errors.valorInicial && (
                      <p className="text-sm text-red-500">{formSumaDigitos.formState.errors.valorInicial.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Residual ($)</Label>
                    <Input
                      type="number"
                      {...formSumaDigitos.register('valorResidual', { valueAsNumber: true })}
                      placeholder="10000000"
                    />
                    {formSumaDigitos.formState.errors.valorResidual && (
                      <p className="text-sm text-red-500">{formSumaDigitos.formState.errors.valorResidual.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Vida Útil (años)</Label>
                    <Input
                      type="number"
                      {...formSumaDigitos.register('vidaUtil', { valueAsNumber: true })}
                      placeholder="5"
                    />
                    {formSumaDigitos.formState.errors.vidaUtil && (
                      <p className="text-sm text-red-500">{formSumaDigitos.formState.errors.vidaUtil.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Depreciación
                </Button>
              </form>
            </CardContent>
          </Card>

          {tablaSumaDigitos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Depreciación - Suma de Dígitos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Año</TableHead>
                      <TableHead className="text-right">Depreciación del Período</TableHead>
                      <TableHead className="text-right">Depreciación Acumulada</TableHead>
                      <TableHead className="text-right">Valor en Libros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablaSumaDigitos.map((registro) => (
                      <TableRow key={registro.periodo}>
                        <TableCell className="font-medium">{registro.periodo}</TableCell>
                        <TableCell className="text-right">{formatCurrency(registro.depreciacionPeriodo)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(registro.depreciacionAcumulada)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(registro.valorLibros)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Fórmula:</p>
                  <p className="text-sm">Suma de Dígitos = n × (n + 1) / 2</p>
                  <p className="text-sm">Factor Año i = (n - i + 1) / Suma de Dígitos</p>
                  <p className="text-sm">Depreciación = (Valor Inicial - Valor Residual) × Factor</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasa-fija" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Método de Tasa Fija (Saldos Decrecientes)</CardTitle>
              <CardDescription>
                Depreciación aplicada sobre el saldo pendiente (método acelerado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={formTasaFija.handleSubmit(calcularTasaFija)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Activo</Label>
                    <Input
                      {...formTasaFija.register('nombre')}
                      placeholder="Ej: Equipo de Cómputo"
                    />
                    {formTasaFija.formState.errors.nombre && (
                      <p className="text-sm text-red-500">{formTasaFija.formState.errors.nombre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Inicial ($)</Label>
                    <Input
                      type="number"
                      {...formTasaFija.register('valorInicial', { valueAsNumber: true })}
                      placeholder="100000000"
                    />
                    {formTasaFija.formState.errors.valorInicial && (
                      <p className="text-sm text-red-500">{formTasaFija.formState.errors.valorInicial.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Residual ($)</Label>
                    <Input
                      type="number"
                      {...formTasaFija.register('valorResidual', { valueAsNumber: true })}
                      placeholder="10000000"
                    />
                    {formTasaFija.formState.errors.valorResidual && (
                      <p className="text-sm text-red-500">{formTasaFija.formState.errors.valorResidual.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Vida Útil (años)</Label>
                    <Input
                      type="number"
                      {...formTasaFija.register('vidaUtil', { valueAsNumber: true })}
                      placeholder="5"
                    />
                    {formTasaFija.formState.errors.vidaUtil && (
                      <p className="text-sm text-red-500">{formTasaFija.formState.errors.vidaUtil.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tasa de Depreciación (%)</Label>
                    <Input
                      type="number"
                      {...formTasaFija.register('tasaFija', { valueAsNumber: true })}
                      placeholder="20"
                    />
                    {formTasaFija.formState.errors.tasaFija && (
                      <p className="text-sm text-red-500">{formTasaFija.formState.errors.tasaFija.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Común: 20% para 5 años, 40% para doble saldo decreciente
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Depreciación
                </Button>
              </form>
            </CardContent>
          </Card>

          {tablaTasaFija.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Depreciación - Tasa Fija</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Año</TableHead>
                      <TableHead className="text-right">Depreciación del Período</TableHead>
                      <TableHead className="text-right">Depreciación Acumulada</TableHead>
                      <TableHead className="text-right">Valor en Libros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablaTasaFija.map((registro) => (
                      <TableRow key={registro.periodo}>
                        <TableCell className="font-medium">{registro.periodo}</TableCell>
                        <TableCell className="text-right">{formatCurrency(registro.depreciacionPeriodo)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(registro.depreciacionAcumulada)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(registro.valorLibros)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Fórmula:</p>
                  <p className="text-sm">Depreciación Año = Valor en Libros × Tasa de Depreciación</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nota: El activo no se deprecia por debajo del valor residual
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DepreciacionPage
