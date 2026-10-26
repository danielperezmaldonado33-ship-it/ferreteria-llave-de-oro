import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Inventario() {
  const { data: inventario, isLoading, refetch } = trpc.inventario.list.useQuery();
  const { data: productos } = trpc.productos.list.useQuery();
  const updateMutation = trpc.inventario.updateStock.useMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productoId: 1,
    cantidad: "",
    tipo: "entrada" as "entrada" | "salida" | "ajuste",
    referencia: "",
    observaciones: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        ...formData,
        cantidad: parseInt(formData.cantidad),
      });
      setFormData({
        productoId: 1,
        cantidad: "",
        tipo: "entrada",
        referencia: "",
        observaciones: "",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const stockBajo = inventario?.filter((inv: any) => {
    const prod = productos?.find((p: any) => p.id === inv.productoId);
    return prod && inv.stock_actual! < (prod.stock_minimo || 0);
  }) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Movimiento
        </Button>
      </div>

      {stockBajo.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <CardTitle className="text-red-900">Stock Bajo</CardTitle>
              <CardDescription className="text-red-800">
                {stockBajo.length} productos tienen stock por debajo del mínimo
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Movimiento de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Producto</Label>
                  <select
                    value={formData.productoId}
                    onChange={(e) => setFormData({ ...formData, productoId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {productos?.map((prod: any) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Tipo de Movimiento</Label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                    <option value="ajuste">Ajuste</option>
                  </select>
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Referencia</Label>
                  <Input
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    placeholder="Ej: Compra #123, Venta #456"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Observaciones</Label>
                  <Input
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Registrando..." : "Registrar Movimiento"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estado del Inventario</CardTitle>
          <CardDescription>Visualiza el stock actual de todos tus productos</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando...</p>
          ) : inventario && inventario.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-2">Producto</th>
                    <th className="text-left py-3 px-2">Stock Actual</th>
                    <th className="text-left py-3 px-2">Stock Mínimo</th>
                    <th className="text-left py-3 px-2">Stock Máximo</th>
                    <th className="text-left py-3 px-2">Ubicación</th>
                    <th className="text-left py-3 px-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((inv: any) => {
                    const prod = productos?.find((p: any) => p.id === inv.productoId);
                    const estado =
                      inv.stock_actual! < (prod?.stock_minimo || 0)
                        ? "Bajo"
                        : inv.stock_actual! > (prod?.stock_maximo || 0)
                        ? "Exceso"
                        : "Normal";
                    const statusColor =
                      estado === "Bajo" ? "text-red-600" : estado === "Exceso" ? "text-yellow-600" : "text-green-600";

                    return (
                      <tr key={inv.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{prod?.nombre || "Producto desconocido"}</td>
                        <td className="py-2 px-2 font-bold">{inv.stock_actual || 0}</td>
                        <td className="py-2 px-2">{(prod?.stock_minimo || 0)}</td>
                        <td className="py-2 px-2">{(prod?.stock_maximo || 0)}</td>
                        <td className="py-2 px-2">{inv.ubicacion || "-"}</td>
                        <td className={`py-2 px-2 font-semibold ${statusColor}`}>{estado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No hay datos de inventario</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
