import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Productos() {
  const { data: productos, isLoading, refetch } = trpc.productos.list.useQuery();
  const { data: categorias } = trpc.categorias.list.useQuery();
  const createMutation = trpc.productos.create.useMutation();
  const deleteMutation = trpc.productos.delete.useMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoriaId: 1,
    nombre: "",
    codigo: "",
    marca: "",
    precio_compra: "",
    precio_venta: "",
    stock_minimo: "5",
    stock_maximo: "100",
    fecha_caducidad: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData as any);
      setFormData({
        categoriaId: 1,
        nombre: "",
        codigo: "",
        marca: "",
        precio_compra: "",
        precio_venta: "",
        stock_minimo: "5",
        stock_maximo: "100",
        fecha_caducidad: "",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Error creating producto:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Error deleting producto:", error);
      }
    }
  };

  const productosProximos = productos?.filter((p: any) => {
    if (!p.fecha_caducidad) return false;
    const dias = Math.floor((new Date(p.fecha_caducidad).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return dias >= 0 && dias <= 30;
  }) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {productosProximos.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <CardTitle className="text-yellow-900">Productos Próximos a Caducar</CardTitle>
              <CardDescription className="text-yellow-800">{productosProximos.length} productos caducan en los próximos 30 días</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <select
                    value={formData.categoriaId}
                    onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {categorias?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Código</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Marca</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Precio de Compra</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.precio_compra}
                    onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Precio de Venta</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Stock Mínimo</Label>
                  <Input
                    type="number"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Stock Máximo</Label>
                  <Input
                    type="number"
                    value={formData.stock_maximo}
                    onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Fecha de Caducidad</Label>
                  <Input
                    type="date"
                    value={formData.fecha_caducidad}
                    onChange={(e) => setFormData({ ...formData, fecha_caducidad: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Guardando..." : "Guardar Producto"}
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
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Gestiona tu catálogo de productos</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando...</p>
          ) : productos && productos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-2">Nombre</th>
                    <th className="text-left py-3 px-2">Código</th>
                    <th className="text-left py-3 px-2">Marca</th>
                    <th className="text-left py-3 px-2">Precio Venta</th>
                    <th className="text-left py-3 px-2">Caducidad</th>
                    <th className="text-left py-3 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod: any) => (
                    <tr key={prod.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{prod.nombre}</td>
                      <td className="py-2 px-2">{prod.codigo || "-"}</td>
                      <td className="py-2 px-2">{prod.marca || "-"}</td>
                      <td className="py-2 px-2">${prod.precio_venta?.toFixed(2) || "0.00"}</td>
                      <td className="py-2 px-2">
                        {prod.fecha_caducidad ? new Date(prod.fecha_caducidad).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-2 px-2 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(prod.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No hay productos registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
