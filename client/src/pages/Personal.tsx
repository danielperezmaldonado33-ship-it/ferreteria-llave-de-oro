import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Personal() {
  const { data: personal, isLoading, refetch } = trpc.personal.list.useQuery();
  const createMutation = trpc.personal.create.useMutation();
  const deleteMutation = trpc.personal.delete.useMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roleId: 2,
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    curp: "",
    rfc: "",
    nss: "",
    email: "",
    telefono: "",
    puesto: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    salario_base: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData as any);
      setFormData({
        roleId: 2,
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        curp: "",
        rfc: "",
        nss: "",
        email: "",
        telefono: "",
        puesto: "",
        fecha_ingreso: new Date().toISOString().split("T")[0],
        salario_base: "",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Error creating personal:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Error deleting personal:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Personal</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Empleado</CardTitle>
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
                  <Label>Apellido Paterno</Label>
                  <Input
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Apellido Materno</Label>
                  <Input
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CURP</Label>
                  <Input
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value })}
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
                  <Label>NSS</Label>
                  <Input
                    value={formData.nss}
                    onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
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
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Puesto</Label>
                  <Input
                    value={formData.puesto}
                    onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Fecha de Ingreso</Label>
                  <Input
                    type="date"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Salario Base</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.salario_base}
                    onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Guardando..." : "Guardar Empleado"}
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
          <CardTitle>Lista de Personal</CardTitle>
          <CardDescription>Gestiona tu equipo de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando...</p>
          ) : personal && personal.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-2">Nombre</th>
                    <th className="text-left py-3 px-2">Puesto</th>
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Teléfono</th>
                    <th className="text-left py-3 px-2">Salario</th>
                    <th className="text-left py-3 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.map((emp: any) => (
                    <tr key={emp.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{`${emp.nombre} ${emp.apellido_paterno}`}</td>
                      <td className="py-2 px-2">{emp.puesto}</td>
                      <td className="py-2 px-2">{emp.email || "-"}</td>
                      <td className="py-2 px-2">{emp.telefono || "-"}</td>
                      <td className="py-2 px-2">${emp.salario_base || "0.00"}</td>
                      <td className="py-2 px-2 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(emp.id)}
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
            <p className="text-center text-muted-foreground">No hay empleados registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
