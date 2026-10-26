import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Proveedores() {
  const { data: proveedores, isLoading, refetch } = trpc.proveedores.list.useQuery();
  const createMutation = trpc.proveedores.create.useMutation();
  const deleteMutation = trpc.proveedores.delete.useMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    contacto_nombre: "",
    email: "",
    telefono_fijo: "",
    direccion: "",
    rfc: "",
    tiempo_entregas_dias: 0,
    facturacion: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData as any);
      setFormData({
        nombre: "",
        contacto_nombre: "",
        email: "",
        telefono_fijo: "",
        direccion: "",
        rfc: "",
        tiempo_entregas_dias: 0,
        facturacion: false,
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Error creating proveedor:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Error deleting proveedor:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Contacto</Label>
                  <Input
                    value={formData.contacto_nombre}
                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.telefono_fijo}
                    onChange={(e) => setFormData({ ...formData, telefono_fijo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>RFC</Label>
                  <Input
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tiempo de Entregas (días)</Label>
                  <Input
                    type="number"
                    value={formData.tiempo_entregas_dias}
                    onChange={(e) => setFormData({ ...formData, tiempo_entregas_dias: parseInt(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Dirección</Label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Guardando..." : "Guardar Proveedor"}
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
          <CardTitle>Lista de Proveedores</CardTitle>
          <CardDescription>Gestiona tus proveedores</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando...</p>
          ) : proveedores && proveedores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-2">Nombre</th>
                    <th className="text-left py-3 px-2">Contacto</th>
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Teléfono</th>
                    <th className="text-left py-3 px-2">Entregas</th>
                    <th className="text-left py-3 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((proveedor: any) => (
                    <tr key={proveedor.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{proveedor.nombre}</td>
                      <td className="py-2 px-2">{proveedor.contacto_nombre || "-"}</td>
                      <td className="py-2 px-2">{proveedor.email || "-"}</td>
                      <td className="py-2 px-2">{proveedor.telefono_fijo || "-"}</td>
                      <td className="py-2 px-2">{proveedor.tiempo_entregas_dias || "-"} días</td>
                      <td className="py-2 px-2 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(proveedor.id)}
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
            <p className="text-center text-muted-foreground">No hay proveedores registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
