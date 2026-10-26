import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

export default function Dashboard() {
  const { data: movimientos, isLoading } = trpc.dashboard.getMovimientosDelDia.useQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  const totalVentas = movimientos?.totalVentas || 0;
  const cantidadVentas = movimientos?.ventasDelDia || 0;

  const chartData = [
    { name: "Ventas", valor: totalVentas },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cantidadVentas}</div>
            <p className="text-xs text-muted-foreground">transacciones completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">en el día de hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cantidadVentas > 0 ? (totalVentas / cantidadVentas).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">promedio por transacción</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Activo</div>
            <p className="text-xs text-muted-foreground">sistema funcionando</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos del Día</CardTitle>
            <CardDescription>Total de ventas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Ventas</CardTitle>
            <CardDescription>Transacciones recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movimientos?.ventasHoy && movimientos.ventasHoy.length > 0 ? (
                movimientos.ventasHoy.slice(0, 5).map((venta: any) => (
                  <div key={venta.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Comprobante: {venta.numero_comprobante}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(venta.fecha_venta).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${venta.total?.toFixed(2) || "0.00"}</p>
                      <p className="text-xs text-green-600">{venta.estado}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No hay ventas registradas hoy</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
