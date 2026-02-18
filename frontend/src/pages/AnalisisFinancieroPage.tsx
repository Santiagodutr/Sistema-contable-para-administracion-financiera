import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Check, X, FileSpreadsheet, Plus } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import * as XLSX from 'xlsx'

interface FilaHorizontal {
  id: string
  concepto: string
  valores: number[]
}

interface FilaVertical {
  id: string
  concepto: string
  valor: number
}

const AnalisisFinancieroPage = () => {
  const [numAnios, setNumAnios] = useState(2)
  const [activosH, setActivosH] = useState<FilaHorizontal[]>([])
  const [pasivosH, setPasivosH] = useState<FilaHorizontal[]>([])
  const [patrimonioH, setPatrimonioH] = useState<FilaHorizontal[]>([])
  const [ingresosH, setIngresosH] = useState<FilaHorizontal[]>([])
  const [gastosH, setGastosH] = useState<FilaHorizontal[]>([])

  const [datosVertical, setDatosVertical] = useState<FilaVertical[]>([])

  const [editandoH, setEditandoH] = useState<string | null>(null)
  const [editandoV, setEditandoV] = useState<string | null>(null)

  const agregarFilaH = (
    tabla: FilaHorizontal[],
    setTabla: React.Dispatch<React.SetStateAction<FilaHorizontal[]>>,
    concepto: string,
    valores: number[]
  ) => {
    if (!concepto) {
      alert('Ingrese el concepto')
      return
    }
    setTabla([...tabla, { id: Date.now().toString(), concepto, valores }])
  }

  const editarFilaH = (
    tabla: FilaHorizontal[],
    setTabla: React.Dispatch<React.SetStateAction<FilaHorizontal[]>>,
    id: string,
    concepto: string,
    valores: number[]
  ) => {
    setTabla(tabla.map(f => f.id === id ? { ...f, concepto, valores } : f))
    setEditandoH(null)
  }

  const eliminarFilaH = (
    tabla: FilaHorizontal[],
    setTabla: React.Dispatch<React.SetStateAction<FilaHorizontal[]>>,
    id: string
  ) => {
    setTabla(tabla.filter(f => f.id !== id))
  }

  const agregarFilaV = (concepto: string, valor: number) => {
    if (!concepto) {
      alert('Ingrese el concepto')
      return
    }
    setDatosVertical([...datosVertical, { id: Date.now().toString(), concepto, valor }])
  }

  const editarFilaV = (id: string, concepto: string, valor: number) => {
    setDatosVertical(datosVertical.map(f => f.id === id ? { ...f, concepto, valor } : f))
    setEditandoV(null)
  }

  const eliminarFilaV = (id: string) => {
    setDatosVertical(datosVertical.filter(f => f.id !== id))
  }

  const agregarAnio = () => {
    setNumAnios(numAnios + 1)
  }

  const calcularTotalH = (tabla: FilaHorizontal[]): number[] => {
    const totales = Array(numAnios).fill(0)
    tabla.forEach(fila => {
      fila.valores.forEach((valor, i) => {
        totales[i] += valor
      })
    })
    return totales
  }

  const calcularVariaciones = (valores: number[]): { absoluta: number; porcentual: number }[] => {
    const variaciones = []
    for (let i = 1; i < valores.length; i++) {
      const valorAnterior = valores[i - 1]
      const valorActual = valores[i]
      const variacionAbs = valorActual - valorAnterior
      const variacionPorc = valorAnterior !== 0 ? (variacionAbs / valorAnterior) * 100 : 0
      variaciones.push({ absoluta: variacionAbs, porcentual: variacionPorc })
    }
    return variaciones
  }

  const totalVertical = datosVertical.reduce((acc, fila) => acc + fila.valor, 0)


  const exportarTodoAExcel = () => {
    const wb = XLSX.utils.book_new()

    // Helper para crear hoja de tabla horizontal
    const crearHojaHorizontal = (tabla: FilaHorizontal[], nombre: string) => {
      const encabezados = ['Concepto']
      for (let i = 0; i < numAnios; i++) {
        encabezados.push(`Año ${i + 1}`)
      }
      for (let i = 1; i < numAnios; i++) {
        encabezados.push(`Var. Absoluta ${i}-${i + 1}`)
        encabezados.push(`Var. % ${i}-${i + 1}`)
      }

      const datos: any[] = [[nombre.toUpperCase()], [], encabezados]

      tabla.forEach(fila => {
        const filaData: any[] = [fila.concepto, ...fila.valores]
        const variaciones = calcularVariaciones(fila.valores)
        variaciones.forEach(v => {
          filaData.push(v.absoluta, v.porcentual)
        })
        datos.push(filaData)
      })

      const totales = calcularTotalH(tabla)
      const filaTotal: any[] = ['TOTAL', ...totales]
      const variacionesTotales = calcularVariaciones(totales)
      variacionesTotales.forEach(v => {
        filaTotal.push(v.absoluta, v.porcentual)
      })
      datos.push(filaTotal)

      const ws = XLSX.utils.aoa_to_sheet(datos)
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: encabezados.length - 1 } }]
      return ws
    }

    // Agregar hojas de análisis horizontal
    if (activosH.length > 0) {
      XLSX.utils.book_append_sheet(wb, crearHojaHorizontal(activosH, 'Activos'), 'Activos')
    }
    if (pasivosH.length > 0) {
      XLSX.utils.book_append_sheet(wb, crearHojaHorizontal(pasivosH, 'Pasivos'), 'Pasivos')
    }
    if (patrimonioH.length > 0) {
      XLSX.utils.book_append_sheet(wb, crearHojaHorizontal(patrimonioH, 'Patrimonio'), 'Patrimonio')
    }
    if (ingresosH.length > 0) {
      XLSX.utils.book_append_sheet(wb, crearHojaHorizontal(ingresosH, 'Ingresos'), 'Ingresos')
    }
    if (gastosH.length > 0) {
      XLSX.utils.book_append_sheet(wb, crearHojaHorizontal(gastosH, 'Gastos'), 'Gastos')
    }

    // Agregar hoja de análisis vertical
    if (datosVertical.length > 0) {
      const datosV: any[] = [
        ['ANÁLISIS VERTICAL'],
        [],
        ['Concepto', 'Valor', '% del Total']
      ]

      datosVertical.forEach(fila => {
        const porcentaje = totalVertical > 0 ? (fila.valor / totalVertical) * 100 : 0
        datosV.push([fila.concepto, fila.valor, porcentaje])
      })

      datosV.push(['TOTAL', totalVertical, 100])

      const wsV = XLSX.utils.aoa_to_sheet(datosV)
      wsV['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]
      XLSX.utils.book_append_sheet(wb, wsV, 'Análisis Vertical')
    }

    // Exportar solo si hay datos
    if (wb.SheetNames.length > 0) {
      XLSX.writeFile(wb, 'analisis_financiero_completo.xlsx')
    } else {
      alert('No hay datos para exportar')
    }
  }

  const TablaHorizontal = ({
    titulo,
    tabla,
    setTabla
  }: {
    titulo: string
    tabla: FilaHorizontal[]
    setTabla: React.Dispatch<React.SetStateAction<FilaHorizontal[]>>
  }) => {
    const [nuevoConcepto, setNuevoConcepto] = useState('')
    const [nuevosValores, setNuevosValores] = useState<string[]>(Array(numAnios).fill(''))
    const [editConcepto, setEditConcepto] = useState('')
    const [editValores, setEditValores] = useState<string[]>([])

    const totales = calcularTotalH(tabla)

    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  {Array.from({ length: numAnios }, (_, i) => (
                    <TableHead key={i} className="text-right">Año {i + 1}</TableHead>
                  ))}
                  {Array.from({ length: numAnios - 1 }, (_, i) => (
                    <>
                      <TableHead key={`var-abs-${i}`} className="text-right">Var. $ ({i + 1}-{i + 2})</TableHead>
                      <TableHead key={`var-porc-${i}`} className="text-right">Var. % ({i + 1}-{i + 2})</TableHead>
                    </>
                  ))}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Input
                      value={nuevoConcepto}
                      onChange={(e) => setNuevoConcepto(e.target.value)}
                      placeholder="Concepto"
                      className="min-w-[150px]"
                    />
                  </TableCell>
                  {Array.from({ length: numAnios }, (_, i) => (
                    <TableCell key={i}>
                      <Input
                        type="number"
                        value={nuevosValores[i]}
                        onChange={(e) => {
                          const newVals = [...nuevosValores]
                          newVals[i] = e.target.value
                          setNuevosValores(newVals)
                        }}
                        placeholder="0"
                        className="text-right min-w-[100px]"
                      />
                    </TableCell>
                  ))}
                  {Array.from({ length: (numAnios - 1) * 2 }, (_, i) => (
                    <TableCell key={i} className="text-muted-foreground text-right">-</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      onClick={() => {
                        agregarFilaH(
                          tabla,
                          setTabla,
                          nuevoConcepto,
                          nuevosValores.map(v => parseFloat(v) || 0)
                        )
                        setNuevoConcepto('')
                        setNuevosValores(Array(numAnios).fill(''))
                      }}
                      size="sm"
                    >
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>

                {tabla.map(fila => {
                  const esEdicion = editandoH === fila.id
                  const variaciones = calcularVariaciones(fila.valores)

                  return (
                    <TableRow key={fila.id}>
                      <TableCell>
                        {esEdicion ? (
                          <Input
                            value={editConcepto}
                            onChange={(e) => setEditConcepto(e.target.value)}
                            className="min-w-[150px]"
                          />
                        ) : (
                          fila.concepto
                        )}
                      </TableCell>
                      {fila.valores.map((valor, i) => (
                        <TableCell key={i} className="text-right">
                          {esEdicion ? (
                            <Input
                              type="number"
                              value={editValores[i] || ''}
                              onChange={(e) => {
                                const newVals = [...editValores]
                                newVals[i] = e.target.value
                                setEditValores(newVals)
                              }}
                              className="text-right min-w-[100px]"
                            />
                          ) : (
                            formatCurrency(valor)
                          )}
                        </TableCell>
                      ))}
                      {variaciones.map((v, i) => (
                        <>
                          <TableCell key={`abs-${i}`} className={`text-right font-semibold ${v.absoluta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(v.absoluta)}
                          </TableCell>
                          <TableCell key={`porc-${i}`} className={`text-right font-semibold ${v.porcentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(v.porcentual)}
                          </TableCell>
                        </>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {esEdicion ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  editarFilaH(
                                    tabla,
                                    setTabla,
                                    fila.id,
                                    editConcepto,
                                    editValores.map(v => parseFloat(v) || 0)
                                  )
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setEditandoH(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditandoH(fila.id)
                                  setEditConcepto(fila.concepto)
                                  setEditValores(fila.valores.map(v => v.toString()))
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => eliminarFilaH(tabla, setTabla, fila.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {tabla.length > 0 && (
                  <TableRow className="bg-primary/10 font-bold border-t-2">
                    <TableCell>TOTAL</TableCell>
                    {totales.map((total, i) => (
                      <TableCell key={i} className="text-right">{formatCurrency(total)}</TableCell>
                    ))}
                    {calcularVariaciones(totales).map((v, i) => (
                      <>
                        <TableCell key={`tot-abs-${i}`} className={`text-right ${v.absoluta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(v.absoluta)}
                        </TableCell>
                        <TableCell key={`tot-porc-${i}`} className={`text-right ${v.porcentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(v.porcentual)}
                        </TableCell>
                      </>
                    ))}
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análisis Financiero</h1>
        <p className="text-muted-foreground mt-2">
          Análisis horizontal y vertical de estados financieros
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis Horizontal</CardTitle>
            <CardDescription>Comparación de períodos contables</CardDescription>
            <div className="flex justify-end gap-2">
              <Button onClick={exportarTodoAExcel} variant="default">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Todo a Excel
              </Button>
              <Button onClick={agregarAnio} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Año
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                Años configurados: {numAnios}
              </span>
            </div>
          </CardHeader>
        </Card>

        <TablaHorizontal titulo="Activos" tabla={activosH} setTabla={setActivosH} />
        <TablaHorizontal titulo="Pasivos" tabla={pasivosH} setTabla={setPasivosH} />
        <TablaHorizontal titulo="Patrimonio" tabla={patrimonioH} setTabla={setPatrimonioH} />
        <TablaHorizontal titulo="Ingresos" tabla={ingresosH} setTabla={setIngresosH} />
        <TablaHorizontal titulo="Gastos" tabla={gastosH} setTabla={setGastosH} />

        <Card>
          <CardHeader>
            <CardTitle>Análisis Vertical</CardTitle>
            <CardDescription>
              Estructura porcentual - Ingrese conceptos y valores para calcular el % del total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">% del Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50">
                    <TableCell>
                      <Input
                        id="nuevo-concepto-v"
                        placeholder="Concepto"
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        id="nuevo-valor-v"
                        type="number"
                        placeholder="0"
                        className="text-right min-w-[120px]"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">-</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => {
                          const conceptoInput = document.getElementById('nuevo-concepto-v') as HTMLInputElement
                          const valorInput = document.getElementById('nuevo-valor-v') as HTMLInputElement
                          agregarFilaV(conceptoInput.value, parseFloat(valorInput.value) || 0)
                          conceptoInput.value = ''
                          valorInput.value = ''
                        }}
                        size="sm"
                      >
                        Agregar
                      </Button>
                    </TableCell>
                  </TableRow>

                  {datosVertical.map(fila => {
                    const esEdicion = editandoV === fila.id
                    const porcentaje = totalVertical > 0 ? (fila.valor / totalVertical) * 100 : 0

                    return (
                      <TableRow key={fila.id}>
                        <TableCell>
                          {esEdicion ? (
                            <Input
                              id={`edit-concepto-${fila.id}`}
                              defaultValue={fila.concepto}
                              className="min-w-[200px]"
                            />
                          ) : (
                            fila.concepto
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {esEdicion ? (
                            <Input
                              id={`edit-valor-${fila.id}`}
                              type="number"
                              defaultValue={fila.valor}
                              className="text-right min-w-[120px]"
                            />
                          ) : (
                            formatCurrency(fila.valor)
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPercentage(porcentaje)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {esEdicion ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const conceptoInput = document.getElementById(`edit-concepto-${fila.id}`) as HTMLInputElement
                                    const valorInput = document.getElementById(`edit-valor-${fila.id}`) as HTMLInputElement
                                    editarFilaV(fila.id, conceptoInput.value, parseFloat(valorInput.value) || 0)
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setEditandoV(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="outline" size="sm" onClick={() => setEditandoV(fila.id)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => eliminarFilaV(fila.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {datosVertical.length > 0 && (
                    <TableRow className="bg-primary/10 font-bold border-t-2">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalVertical)}</TableCell>
                      <TableCell className="text-right">100.00%</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalisisFinancieroPage
