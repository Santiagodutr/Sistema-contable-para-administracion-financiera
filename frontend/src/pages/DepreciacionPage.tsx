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
import Calculator from 'lucide-react/dist/esm/icons/calculator'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet'
import { formatCurrency } from '@/lib/utils'
import * as XLSX from 'xlsx'

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
  const [tasaCalculada, setTasaCalculada] = useState<number>(0)

  // Estados para fechas en línea recta
  const [usarDiasLR, setUsarDiasLR] = useState(false)
  const [fechaInicioLR, setFechaInicioLR] = useState('')
  const [fechaFinLR, setFechaFinLR] = useState('')
  const [diasLR, setDiasLR] = useState(0)

  // Estados para fechas en suma de dígitos
  const [usarDiasSD, setUsarDiasSD] = useState(false)
  const [fechaInicioSD, setFechaInicioSD] = useState('')
  const [fechaFinSD, setFechaFinSD] = useState('')
  const [diasSD, setDiasSD] = useState(0)

  // Estados para fechas en tasa fija
  const [usarDiasTF, setUsarDiasTF] = useState(false)
  const [fechaInicioTF, setFechaInicioTF] = useState('')
  const [fechaFinTF, setFechaFinTF] = useState('')
  const [diasTF, setDiasTF] = useState(0)

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

  const calcularTasaDepreciacion = (valorInicial: number, valorResidual: number, vidaUtil: number): number => {
    if (valorInicial <= 0 || valorResidual < 0 || vidaUtil <= 0) return 0
    if (valorResidual >= valorInicial) return 0

    // Fórmula: Tasa = 1 - (Valor Residual / Valor Inicial)^(1/Vida Útil)
    const tasa = 1 - Math.pow(valorResidual / valorInicial, 1 / vidaUtil)
    return tasa * 100 // Convertir a porcentaje
  }

  const actualizarTasaTasaFija = () => {
    const valores = formTasaFija.getValues()
    if (valores.valorInicial > 0 && valores.vidaUtil > 0) {
      const tasa = calcularTasaDepreciacion(valores.valorInicial, valores.valorResidual, valores.vidaUtil)
      setTasaCalculada(tasa)
      formTasaFija.setValue('tasaFija', tasa)
    }
  }

  const calcularDiasEntreFechas = (inicio: string, fin: string): number => {
    if (!inicio || !fin) return 0
    const fecha1 = new Date(inicio)
    const fecha2 = new Date(fin)

    // Método contable: 30 días por mes, 360 días por año
    const anio1 = fecha1.getFullYear()
    const mes1 = fecha1.getMonth() + 1
    const dia1 = fecha1.getDate()

    const anio2 = fecha2.getFullYear()
    const mes2 = fecha2.getMonth() + 1
    const dia2 = fecha2.getDate()

    // Calcular diferencia en años, meses y días
    let anios = anio2 - anio1
    let meses = mes2 - mes1
    let dias = dia2 - dia1 + 1 // +1 para incluir el primer día

    // Ajustar si los días son negativos
    if (dias <= 0) {
      meses--
      dias += 30
    }

    // Ajustar si los meses son negativos
    if (meses < 0) {
      anios--
      meses += 12
    }

    // Convertir todo a días (método 30/360)
    const totalDias = (anios * 360) + (meses * 30) + dias

    return totalDias > 0 ? totalDias : 0
  }

  const calcularLineaRecta = (data: ActivoFormData) => {
    const valorDepreciable = data.valorInicial - data.valorResidual
    const depreciacionAnual = valorDepreciable / data.vidaUtil

    if (usarDiasLR && diasLR > 0) {
      // Calcular depreciación para el período de días específico
      const depreciacionDiaria = depreciacionAnual / 360
      const depreciacionTotal = depreciacionDiaria * diasLR
      const valorLibrosFinal = data.valorInicial - depreciacionTotal

      setTablaLineaRecta([{
        periodo: 1,
        depreciacionPeriodo: depreciacionTotal,
        depreciacionAcumulada: depreciacionTotal,
        valorLibros: valorLibrosFinal,
      }])
      return
    }

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

    if (usarDiasSD && diasSD > 0) {
      // Dividir los días en años completos (360 días) y días restantes
      const aniosCompletos = Math.floor(diasSD / 360)
      const diasRestantes = diasSD % 360

      const tabla: RegistroDepreciacion[] = []
      let depreciacionAcum = 0
      let valorLibrosActual = data.valorInicial

      // Calcular años completos
      for (let i = 1; i <= aniosCompletos; i++) {
        const factor = (data.vidaUtil - i + 1) / sumaDigitos
        const depreciacionPeriodo = valorDepreciable * factor
        depreciacionAcum += depreciacionPeriodo
        valorLibrosActual = data.valorInicial - depreciacionAcum

        tabla.push({
          periodo: i,
          depreciacionPeriodo,
          depreciacionAcumulada: depreciacionAcum,
          valorLibros: valorLibrosActual,
        })
      }

      // Calcular días restantes si existen
      if (diasRestantes > 0 && aniosCompletos < data.vidaUtil) {
        const factor = (data.vidaUtil - aniosCompletos) / sumaDigitos
        const depreciacionAnual = valorDepreciable * factor
        const depreciacionDiaria = depreciacionAnual / 360
        const depreciacionPeriodo = depreciacionDiaria * diasRestantes
        depreciacionAcum += depreciacionPeriodo
        valorLibrosActual = data.valorInicial - depreciacionAcum

        tabla.push({
          periodo: aniosCompletos + 1,
          depreciacionPeriodo,
          depreciacionAcumulada: depreciacionAcum,
          valorLibros: valorLibrosActual,
        })
      }

      setTablaSumaDigitos(tabla)
      return
    }

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

    if (usarDiasTF && diasTF > 0) {
      // Dividir los días en años completos (360 días) y días restantes
      const aniosCompletos = Math.floor(diasTF / 360)
      const diasRestantes = diasTF % 360

      const tabla: RegistroDepreciacion[] = []
      let valorLibros = data.valorInicial
      let depreciacionAcum = 0

      // Calcular años completos
      for (let i = 1; i <= aniosCompletos; i++) {
        let depreciacionPeriodo = valorLibros * tasa

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

        // Si ya llegamos al valor residual, detener
        if (valorLibros <= data.valorResidual) {
          break
        }
      }

      // Calcular días restantes si existen y no hemos llegado al valor residual
      if (diasRestantes > 0 && valorLibros > data.valorResidual && aniosCompletos < data.vidaUtil) {
        const depreciacionAnual = valorLibros * tasa
        const depreciacionDiaria = depreciacionAnual / 360
        let depreciacionPeriodo = depreciacionDiaria * diasRestantes

        // No depreciar por debajo del valor residual
        if (valorLibros - depreciacionPeriodo < data.valorResidual) {
          depreciacionPeriodo = valorLibros - data.valorResidual
        }

        depreciacionAcum += depreciacionPeriodo
        valorLibros -= depreciacionPeriodo

        tabla.push({
          periodo: aniosCompletos + 1,
          depreciacionPeriodo,
          depreciacionAcumulada: depreciacionAcum,
          valorLibros,
        })
      }

      setTablaTasaFija(tabla)
      return
    }

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

  const exportarLineaRectaExcel = () => {
    if (tablaLineaRecta.length === 0) return

    const data: any[][] = []
    data.push(['Método de Depreciación: Línea Recta'])
    data.push([])
    data.push(['Año/Período', 'Depreciación del Período', 'Depreciación Acumulada', 'Valor en Libros'])

    tablaLineaRecta.forEach((registro) => {
      let labelPeriodo = ''
      if (usarDiasLR && diasLR > 0) {
        const aniosCompletos = Math.floor(diasLR / 360)
        const diasRestantes = diasLR % 360

        if (registro.periodo <= aniosCompletos) {
          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
          labelPeriodo = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
        } else {
          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
          const label = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
          labelPeriodo = `${label} (${diasRestantes} días)`
        }
      } else {
        const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
        labelPeriodo = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
      }

      data.push([
        labelPeriodo,
        registro.depreciacionPeriodo,
        registro.depreciacionAcumulada,
        registro.valorLibros
      ])
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(data)
    ws['!cols'] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 }
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Linea Recta')
    XLSX.writeFile(wb, `Depreciacion_LineaRecta_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`)
  }

  const exportarSumaDigitosExcel = () => {
    if (tablaSumaDigitos.length === 0) return

    const data: any[][] = []
    data.push(['Método de Depreciación: Suma de Dígitos'])
    data.push([])
    data.push(['Año/Período', 'Depreciación del Período', 'Depreciación Acumulada', 'Valor en Libros'])

    tablaSumaDigitos.forEach((registro) => {
      let labelPeriodo = ''
      if (usarDiasSD && diasSD > 0) {
        const aniosCompletos = Math.floor(diasSD / 360)
        const diasRestantes = diasSD % 360

        if (registro.periodo <= aniosCompletos) {
          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
          labelPeriodo = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
        } else {
          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
          const label = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
          labelPeriodo = `${label} (${diasRestantes} días)`
        }
      } else {
        const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
        labelPeriodo = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
      }

      data.push([
        labelPeriodo,
        registro.depreciacionPeriodo,
        registro.depreciacionAcumulada,
        registro.valorLibros
      ])
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(data)
    ws['!cols'] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 }
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Suma de Digitos')
    XLSX.writeFile(wb, `Depreciacion_SumaDigitos_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`)
  }

  const exportarTasaFijaExcel = () => {
    if (tablaTasaFija.length === 0) return

    const data: any[][] = []
    data.push(['Método de Depreciación: Tasa Fija (Saldos Decrecientes)'])
    data.push([])
    data.push(['Año/Período', 'Depreciación del Período', 'Depreciación Acumulada', 'Valor en Libros'])

    tablaTasaFija.forEach((registro) => {
      let labelPeriodo = ''
      if (usarDiasTF && diasTF > 0) {
        const aniosCompletos = Math.floor(diasTF / 360)
        const diasRestantes = diasTF % 360

        if (registro.periodo <= aniosCompletos) {
          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
          labelPeriodo = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
        } else {
          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
          const label = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
          labelPeriodo = `${label} (${diasRestantes} días)`
        }
      } else {
        const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
        labelPeriodo = registro.periodo <= 10 ? `${ordenales[registro.periodo]} año` : `${registro.periodo}º año`
      }

      data.push([
        labelPeriodo,
        registro.depreciacionPeriodo,
        registro.depreciacionAcumulada,
        registro.valorLibros
      ])
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(data)
    ws['!cols'] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 }
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Tasa Fija')
    XLSX.writeFile(wb, `Depreciacion_TasaFija_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`)
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

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="usarDiasLR"
                      checked={usarDiasLR}
                      onChange={(e) => {
                        setUsarDiasLR(e.target.checked)
                        if (!e.target.checked) {
                          setFechaInicioLR('')
                          setFechaFinLR('')
                          setDiasLR(0)
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="usarDiasLR" className="cursor-pointer">
                      Calcular para un período específico de días
                    </Label>
                  </div>

                  {usarDiasLR && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg border border-border">
                      <div className="space-y-2">
                        <Label>Fecha de Inicio</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={fechaInicioLR}
                            onChange={(e) => {
                              setFechaInicioLR(e.target.value)
                              if (fechaFinLR) {
                                setDiasLR(calcularDiasEntreFechas(e.target.value, fechaFinLR))
                              }
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha de Fin</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={fechaFinLR}
                            onChange={(e) => {
                              setFechaFinLR(e.target.value)
                              if (fechaInicioLR) {
                                setDiasLR(calcularDiasEntreFechas(fechaInicioLR, e.target.value))
                              }
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {diasLR > 0 && (
                        <div className="md:col-span-2 p-3 bg-background/50 rounded border border-border">
                          <p className="text-sm font-medium text-blue-900">
                            Período: <span className="text-lg font-bold">{diasLR}</span> días (método 30/360)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
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
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Tabla de Depreciación - Línea Recta
                    {usarDiasLR && diasLR > 0 && ` (${diasLR} días)`}
                  </CardTitle>
                  <Button onClick={exportarLineaRectaExcel} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar a Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{usarDiasLR ? 'Período' : 'Año'}</TableHead>
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

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="usarDiasSD"
                      checked={usarDiasSD}
                      onChange={(e) => {
                        setUsarDiasSD(e.target.checked)
                        if (!e.target.checked) {
                          setFechaInicioSD('')
                          setFechaFinSD('')
                          setDiasSD(0)
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="usarDiasSD" className="cursor-pointer">
                      Calcular para un período específico de días
                    </Label>
                  </div>

                  {usarDiasSD && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg border border-border">
                      <div className="space-y-2">
                        <Label>Fecha de Inicio</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={fechaInicioSD}
                            onChange={(e) => {
                              setFechaInicioSD(e.target.value)
                              if (fechaFinSD) {
                                setDiasSD(calcularDiasEntreFechas(e.target.value, fechaFinSD))
                              }
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha de Fin</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={fechaFinSD}
                            onChange={(e) => {
                              setFechaFinSD(e.target.value)
                              if (fechaInicioSD) {
                                setDiasSD(calcularDiasEntreFechas(fechaInicioSD, e.target.value))
                              }
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {diasSD > 0 && (
                        <div className="md:col-span-2 p-3 bg-background/50 rounded border border-border">
                          <p className="text-sm font-medium text-blue-900">
                            Período: <span className="text-lg font-bold">{diasSD}</span> días (método 30/360)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
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
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Tabla de Depreciación - Suma de Dígitos
                    {usarDiasSD && diasSD > 0 && ` (${diasSD} días)`}
                  </CardTitle>
                  <Button onClick={exportarSumaDigitosExcel} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar a Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{usarDiasSD && diasSD > 0 ? 'Período' : 'Año'}</TableHead>
                      <TableHead className="text-right">Depreciación del Período</TableHead>
                      <TableHead className="text-right">Depreciación Acumulada</TableHead>
                      <TableHead className="text-right">Valor en Libros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablaSumaDigitos.map((registro) => {
                      let labelPeriodo = ''
                      if (usarDiasSD && diasSD > 0) {
                        const aniosCompletos = Math.floor(diasSD / 360)
                        const diasRestantes = diasSD % 360

                        if (registro.periodo <= aniosCompletos) {
                          // Años completos
                          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
                          labelPeriodo = registro.periodo <= 10
                            ? `${ordenales[registro.periodo]} año`
                            : `${registro.periodo}º año`
                        } else {
                          // Último período con días restantes
                          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
                          const label = registro.periodo <= 10
                            ? `${ordenales[registro.periodo]} año`
                            : `${registro.periodo}º año`
                          labelPeriodo = `${label} (${diasRestantes} días)`
                        }
                      } else {
                        const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
                        labelPeriodo = registro.periodo <= 10
                          ? `${ordenales[registro.periodo]} año`
                          : `${registro.periodo}º año`
                      }

                      return (
                        <TableRow key={registro.periodo}>
                          <TableCell className="font-medium">{labelPeriodo}</TableCell>
                          <TableCell className="text-right">{formatCurrency(registro.depreciacionPeriodo)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(registro.depreciacionAcumulada)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(registro.valorLibros)}</TableCell>
                        </TableRow>
                      )
                    })}
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
                      onChange={(e) => {
                        formTasaFija.setValue('valorInicial', parseFloat(e.target.value) || 0)
                        actualizarTasaTasaFija()
                      }}
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
                      onChange={(e) => {
                        formTasaFija.setValue('valorResidual', parseFloat(e.target.value) || 0)
                        actualizarTasaTasaFija()
                      }}
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
                      onChange={(e) => {
                        formTasaFija.setValue('vidaUtil', parseFloat(e.target.value) || 0)
                        actualizarTasaTasaFija()
                      }}
                    />
                    {formTasaFija.formState.errors.vidaUtil && (
                      <p className="text-sm text-red-500">{formTasaFija.formState.errors.vidaUtil.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tasa de Depreciación (%) - Calculada</Label>
                    <Input
                      type="number"
                      {...formTasaFija.register('tasaFija', { valueAsNumber: true })}
                      value={tasaCalculada.toFixed(10)}
                      readOnly
                      className="bg-secondary/50"
                    />
                    {formTasaFija.formState.errors.tasaFija && (
                      <p className="text-sm text-red-500">{formTasaFija.formState.errors.tasaFija.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Calculada automáticamente con: Tasa = 1 - (VR/VI)^(1/n)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="usarDiasTF"
                      checked={usarDiasTF}
                      onChange={(e) => {
                        setUsarDiasTF(e.target.checked)
                        if (!e.target.checked) {
                          setFechaInicioTF('')
                          setFechaFinTF('')
                          setDiasTF(0)
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="usarDiasTF" className="cursor-pointer">
                      Calcular para un período específico de días
                    </Label>
                  </div>

                  {usarDiasTF && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Fecha de Inicio</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={fechaInicioTF}
                            onChange={(e) => {
                              setFechaInicioTF(e.target.value)
                              if (fechaFinTF) {
                                setDiasTF(calcularDiasEntreFechas(e.target.value, fechaFinTF))
                              }
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha de Fin</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={fechaFinTF}
                            onChange={(e) => {
                              setFechaFinTF(e.target.value)
                              if (fechaInicioTF) {
                                setDiasTF(calcularDiasEntreFechas(fechaInicioTF, e.target.value))
                              }
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {diasTF > 0 && (
                        <div className="md:col-span-2 p-3 bg-white rounded border border-blue-200">
                          <p className="text-sm font-medium text-blue-900">
                            Período: <span className="text-lg font-bold">{diasTF}</span> días (método 30/360)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
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
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Tabla de Depreciación - Tasa Fija
                    {usarDiasTF && diasTF > 0 && ` (${diasTF} días)`}
                  </CardTitle>
                  <Button onClick={exportarTasaFijaExcel} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar a Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{usarDiasTF && diasTF > 0 ? 'Período' : 'Año'}</TableHead>
                      <TableHead className="text-right">Depreciación del Período</TableHead>
                      <TableHead className="text-right">Depreciación Acumulada</TableHead>
                      <TableHead className="text-right">Valor en Libros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablaTasaFija.map((registro) => {
                      let labelPeriodo = ''
                      if (usarDiasTF && diasTF > 0) {
                        const aniosCompletos = Math.floor(diasTF / 360)
                        const diasRestantes = diasTF % 360

                        if (registro.periodo <= aniosCompletos) {
                          // Años completos
                          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
                          labelPeriodo = registro.periodo <= 10
                            ? `${ordenales[registro.periodo]} año`
                            : `${registro.periodo}º año`
                        } else {
                          // Último período con días restantes
                          const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
                          const label = registro.periodo <= 10
                            ? `${ordenales[registro.periodo]} año`
                            : `${registro.periodo}º año`
                          labelPeriodo = `${label} (${diasRestantes} días)`
                        }
                      } else {
                        const ordenales = ['', '1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
                        labelPeriodo = registro.periodo <= 10
                          ? `${ordenales[registro.periodo]} año`
                          : `${registro.periodo}º año`
                      }

                      return (
                        <TableRow key={registro.periodo}>
                          <TableCell className="font-medium">{labelPeriodo}</TableCell>
                          <TableCell className="text-right">{formatCurrency(registro.depreciacionPeriodo)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(registro.depreciacionAcumulada)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(registro.valorLibros)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Fórmulas:</p>
                  <p className="text-sm">Tasa = 1 - (Valor Residual / Valor Inicial)^(1 / Vida Útil)</p>
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
