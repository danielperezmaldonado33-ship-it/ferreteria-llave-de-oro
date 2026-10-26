import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Ventas() {
  const { data: ventas, isLoading, refetch } = trpc.ventas.list.useQuery();
  const { data: productos } = trpc.productos.list.useQuery();
  const { data: clientes } = trpc.clientes.list.useQuery();
  const createMutation = trpc.ventas.create.useMutation();
  const [showForm, setShowForm] = useState(false);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clienteId: "",
    metodo_pago: "efectivo",
    iva: "0",
  });

  const agregarAlCarrito = (productoId: number, cantidad: number, precio: number) => {
    if (cantidad <= 0) return;
    
    const existente = carrito.find((item) => item.productoId === productoId);
    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.productoId === productoId
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          productoId,
          cantidad,
          precio_unitario: precio.toString(),
          descuento: "0",
        },
      ]);
    }
  };

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter((item) => item.productoId !== productoId));
  };

  const calcularTotal = () => {
    let subtotal = 0;
    carrito.forEach((item) => {
      const precio = parseFloat(item.precio_unitario);
      const desc = parseFloat(item.descuento || "0");
      subtotal += precio * item.cantidad - desc;
    });
    const iva = parseFloat(formData.iva) || 0;
    return subtotal + iva;
  };

  const handleCrearVenta = async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    try {
      await createMutation.mutateAsync({
        clienteId: formData.clienteId ? parseInt(formData.clienteId) : undefined,
        items: carrito,
        metodo_pago: formData.metodo_pago,
        iva: formData.iva,
      });
      setCarrito([]);
      setFormData({ clienteId: "", metodo_pago: "efectivo", iva: "0" });
      setShowForm(false);
      refetch();
      alert("Venta registrada exitosamente");
    } catch (error) {
      console.error("Error creating venta:", error);
      alert("Error al registrar la venta");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ventas</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Cliente (Opcional)</Label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Sin cliente</option>
                  {clientes?.map((cliente: any) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.apellido_paterno}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Método de Pago</Label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div>
                <Label>IVA (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.iva}
                  onChange={(e) => setFormData({ ...formData, iva: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Agregar Productos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {productos?.map((prod: any) => (
                  <div key={prod.id} className="border p-2 rounded">
                    <p className="font-semibold text-sm">{prod.nombre}</p>
                    <p className="text-xs text-gray-600">${prod.precio_venta?.toFixed(2)}</p>
                    <div className="flex gap-1 mt-2">
                      <Input
                        type="number"
                        placeholder="Cant"
                        min="1"
                        className="h-8 text-xs"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const cant = parseInt((e.target as HTMLInputElement).value);
                            agregarAlCarrito(prod.id, cant, prod.precio_venta);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          const input = (event?.target as HTMLElement)?.previousElementSibling as HTMLInputElement;
                          if (input) {
                            const cant = parseInt(input.value);
                            agregarAlCarrito(prod.id, cant, prod.precio_venta);
                            input.value = "";
                          }
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Carrito de Compras</h3>
              {carrito.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {carrito.map((item) => {
                    const prod = productos?.find((p: any) => p.id === item.productoId);
                    const subtotal = parseFloat(item.precio_unitario) * item.cantidad - parseFloat(item.descuento || "0");
                    return (
                      <div key={item.productoId} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-semibold text-sm">{prod?.nombre}</p>
                          <p className="text-xs text-gray-600">
                            {item.cantidad} x ${item.precio_unitario} = ${subtotal.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => eliminarDelCarrito(item.productoId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500">Carrito vacío</p>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${calcularTotal().toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCrearVenta}
                  disabled={createMutation.isPending || carrito.length === 0}
                  className="flex-1"
                >
                  {createMutation.isPending ? "Procesando..." : "Completar Venta"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setCarrito([]);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>Todas las ventas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando...</p>
          ) : ventas && ventas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-2">Comprobante</th>
                    <th className="text-left py-3 px-2">Fecha</th>
                    <th className="text-left py-3 px-2">Cliente</th>
                    <th className="text-left py-3 px-2">Total</th>
                    <th className="text-left py-3 px-2">Método</th>
                    <th className="text-left py-3 px-2">Estado</th>
                    <th className="text-left py-3 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta: any) => {
                    const cliente = clientes?.find((c: any) => c.id === venta.clienteId);
                    return (
                      <tr key={venta.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono text-xs">{venta.numero_comprobante}</td>
                        <td className="py-2 px-2">{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                        <td className="py-2 px-2">{cliente?.nombre || "Mostrador"}</td>
                        <td className="py-2 px-2 font-bold">${venta.total?.toFixed(2) || "0.00"}</td>
                        <td className="py-2 px-2">{venta.metodo_pago || "-"}</td>
                        <td className="py-2 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {venta.estado}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No hay ventas registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
