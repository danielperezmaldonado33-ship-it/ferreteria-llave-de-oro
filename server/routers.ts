import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { users, roles, personal, clientes, proveedores, categorias, productos, inventario, ventas, detalles_venta, movimientos_inventario } from "../drizzle/schema";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user.length) throw new Error("User not found");
      
      const role = await db.select().from(roles).where(eq(roles.id, user[0].roleId)).limit(1);
      
      return {
        ...user[0],
        role: role[0] || null,
      };
    }),
  }),

  // ============ ROLES ============
  roles: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(roles);
    }),
  }),

  // ============ CLIENTES ============
  clientes: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(clientes);
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(clientes).where(eq(clientes.id, input)).limit(1);
        return result[0] || null;
      }),

    create: protectedProcedure
      .input(z.object({
        nombre: z.string().min(1),
        apellido_paterno: z.string().min(1),
        apellido_materno: z.string().optional(),
        email: z.string().email().optional(),
        telefono: z.string().optional(),
        direccion: z.string().optional(),
        tipo_cliente: z.string().default("regular"),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(clientes).values(input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nombre: z.string().optional(),
        apellido_paterno: z.string().optional(),
        apellido_materno: z.string().optional(),
        email: z.string().email().optional(),
        telefono: z.string().optional(),
        direccion: z.string().optional(),
        tipo_cliente: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        await db.update(clientes).set(data as any).where(eq(clientes.id, id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(clientes).where(eq(clientes.id, input));
        return { success: true };
      }),
  }),

  // ============ PROVEEDORES ============
  proveedores: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(proveedores);
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(proveedores).where(eq(proveedores.id, input)).limit(1);
        return result[0] || null;
      }),

    create: protectedProcedure
      .input(z.object({
        nombre: z.string().min(1),
        contacto_nombre: z.string().optional(),
        email: z.string().email().optional(),
        telefono_fijo: z.string().optional(),
        direccion: z.string().optional(),
        rfc: z.string().optional(),
        tiempo_entregas_dias: z.number().optional(),
        facturacion: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(proveedores).values(input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nombre: z.string().optional(),
        contacto_nombre: z.string().optional(),
        email: z.string().email().optional(),
        telefono_fijo: z.string().optional(),
        direccion: z.string().optional(),
        rfc: z.string().optional(),
        tiempo_entregas_dias: z.number().optional(),
        facturacion: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        await db.update(proveedores).set(data as any).where(eq(proveedores.id, id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(proveedores).where(eq(proveedores.id, input));
        return { success: true };
      }),
  }),

  // ============ PERSONAL ============
  personal: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(personal);
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(personal).where(eq(personal.id, input)).limit(1);
        return result[0] || null;
      }),

    create: protectedProcedure
      .input(z.object({
        roleId: z.number(),
        nombre: z.string().min(1),
        apellido_paterno: z.string().min(1),
        apellido_materno: z.string().optional(),
        curp: z.string().optional(),
        rfc: z.string().optional(),
        nss: z.string().optional(),
        fecha_nacimiento: z.string().optional(),
        genero: z.string().optional(),
        estado_civil: z.string().optional(),
        email: z.string().email().optional(),
        telefono: z.string().optional(),
        telefono_emergencias: z.string().optional(),
        direccion: z.string().optional(),
        fecha_ingreso: z.string(),
        puesto: z.string().min(1),
        salario_base: z.string().optional(),
        tipo_salario: z.string().optional(),
        jornada: z.string().optional(),
        horario_entrada: z.string().optional(),
        horario_salida: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const data: any = {
          ...input,
          fecha_ingreso: new Date(input.fecha_ingreso),
        };
        if (input.fecha_nacimiento) data.fecha_nacimiento = new Date(input.fecha_nacimiento);
        if (input.salario_base) data.salario_base = parseFloat(input.salario_base);
        
        await db.insert(personal).values(data);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nombre: z.string().optional(),
        apellido_paterno: z.string().optional(),
        apellido_materno: z.string().optional(),
        email: z.string().email().optional(),
        telefono: z.string().optional(),
        puesto: z.string().optional(),
        salario_base: z.string().optional(),
        fecha_baja: z.string().optional(),
        motivo_baja: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.fecha_baja) updateData.fecha_baja = new Date(data.fecha_baja);
        if (data.salario_base) updateData.salario_base = parseFloat(data.salario_base);
        
        await db.update(personal).set(updateData).where(eq(personal.id, id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(personal).where(eq(personal.id, input));
        return { success: true };
      }),
  }),

  // ============ CATEGORÍAS ============
  categorias: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(categorias);
    }),

    create: protectedProcedure
      .input(z.object({
        nombre: z.string().min(1),
        descripcion: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(categorias).values(input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nombre: z.string().optional(),
        descripcion: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        await db.update(categorias).set(data as any).where(eq(categorias.id, id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(categorias).where(eq(categorias.id, input));
        return { success: true };
      }),
  }),

  // ============ PRODUCTOS ============
  productos: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(productos);
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(productos).where(eq(productos.id, input)).limit(1);
        return result[0] || null;
      }),

    create: protectedProcedure
      .input(z.object({
        categoriaId: z.number(),
        nombre: z.string().min(1),
        codigo: z.string().optional(),
        codigo_barras: z.string().optional(),
        marca: z.string().optional(),
        unidad_medida: z.string().default("pieza"),
        precio_compra: z.string().optional(),
        precio_venta: z.string().min(1),
        stock_minimo: z.number().default(5),
        stock_maximo: z.number().default(100),
        fecha_caducidad: z.string().optional(),
        imagen_url: z.string().optional(),
        descripcion: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const data: any = {
          ...input,
          precio_venta: parseFloat(input.precio_venta),
        };
        if (input.precio_compra) data.precio_compra = parseFloat(input.precio_compra);
        if (input.fecha_caducidad) data.fecha_caducidad = new Date(input.fecha_caducidad);
        
        await db.insert(productos).values(data);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nombre: z.string().optional(),
        precio_compra: z.string().optional(),
        precio_venta: z.string().optional(),
        stock_minimo: z.number().optional(),
        stock_maximo: z.number().optional(),
        fecha_caducidad: z.string().optional(),
        activo: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.precio_compra) updateData.precio_compra = parseFloat(data.precio_compra);
        if (data.precio_venta) updateData.precio_venta = parseFloat(data.precio_venta);
        if (data.fecha_caducidad) updateData.fecha_caducidad = new Date(data.fecha_caducidad);
        
        await db.update(productos).set(updateData).where(eq(productos.id, id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(productos).where(eq(productos.id, input));
        return { success: true };
      }),
  }),

  // ============ INVENTARIO ============
  inventario: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(inventario);
    }),

    getByProducto: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(inventario).where(eq(inventario.productoId, input)).limit(1);
        return result[0] || null;
      }),

    updateStock: protectedProcedure
      .input(z.object({
        productoId: z.number(),
        cantidad: z.number(),
        tipo: z.enum(["entrada", "salida", "ajuste"]),
        referencia: z.string().optional(),
        referencia_id: z.number().optional(),
        observaciones: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Registrar movimiento
        await db.insert(movimientos_inventario).values({
          productoId: input.productoId,
          tipo: input.tipo,
          cantidad: input.cantidad,
          referencia: input.referencia,
          referencia_id: input.referencia_id,
          userId: ctx.user.id,
          observaciones: input.observaciones,
        } as any);
        
        // Actualizar stock
        const inv = await db.select().from(inventario).where(eq(inventario.productoId, input.productoId)).limit(1);
        if (inv.length) {
          const newStock = inv[0].stock_actual! + (input.tipo === "salida" ? -input.cantidad : input.cantidad);
          await db.update(inventario).set({ stock_actual: newStock }).where(eq(inventario.productoId, input.productoId));
        }
        
        return { success: true };
      }),
  }),

  // ============ VENTAS ============
  ventas: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(ventas);
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const venta = await db.select().from(ventas).where(eq(ventas.id, input)).limit(1);
        if (!venta.length) return null;
        
        const detalles = await db.select().from(detalles_venta).where(eq(detalles_venta.ventaId, input));
        
        return {
          ...venta[0],
          detalles,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        clienteId: z.number().optional(),
        items: z.array(z.object({
          productoId: z.number(),
          cantidad: z.number(),
          precio_unitario: z.string(),
          descuento: z.string().optional(),
        })),
        metodo_pago: z.string().optional(),
        iva: z.string().optional(),
        descuento: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Calcular totales
        let subtotal = 0;
        for (const item of input.items) {
          const unitPrice = parseFloat(item.precio_unitario);
          const desc = item.descuento ? parseFloat(item.descuento) : 0;
          subtotal += (unitPrice * item.cantidad) - desc;
        }
        
        const ivaAmount = input.iva ? parseFloat(input.iva) : 0;
        const descuentoTotal = input.descuento ? parseFloat(input.descuento) : 0;
        const total = subtotal + ivaAmount - descuentoTotal;
        const numeroComprobante = `V-${Date.now()}`;
        
        // Crear venta
        await db.insert(ventas).values({
          userId: ctx.user.id,
          clienteId: input.clienteId || undefined,
          subtotal,
          iva: ivaAmount,
          descuento: descuentoTotal,
          total,
          metodo_pago: input.metodo_pago,
          numero_comprobante: numeroComprobante,
        } as any);
        
        // Obtener la venta creada
        const ventasCreadas = await db.select().from(ventas).where(eq(ventas.numero_comprobante, numeroComprobante)).limit(1);
        if (!ventasCreadas.length) throw new Error("Failed to create venta");
        const ventaId = ventasCreadas[0].id;
        
        // Crear detalles de venta y actualizar inventario
        for (const item of input.items) {
          const unitPrice = parseFloat(item.precio_unitario);
          const desc = item.descuento ? parseFloat(item.descuento) : 0;
          const itemSubtotal = (unitPrice * item.cantidad) - desc;
          
          await db.insert(detalles_venta).values({
            ventaId: ventaId,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio_unitario: unitPrice,
            descuento: desc,
            subtotal: itemSubtotal,
          } as any);
          
          // Registrar movimiento de inventario
          await db.insert(movimientos_inventario).values({
            productoId: item.productoId,
            tipo: "salida",
            cantidad: item.cantidad,
            referencia: "venta",
            referencia_id: ventaId,
            userId: ctx.user.id,
          } as any);
          
          // Actualizar stock
          const inv = await db.select().from(inventario).where(eq(inventario.productoId, item.productoId)).limit(1);
          if (inv.length) {
            const newStock = inv[0].stock_actual! - item.cantidad;
            await db.update(inventario).set({ stock_actual: newStock }).where(eq(inventario.productoId, item.productoId));
          }
        }
        
        return { id: ventaId, numero_comprobante: numeroComprobante };
      }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    getMovimientosDelDia: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const ventasHoy = await db.select().from(ventas);
      const totalVentas = ventasHoy.reduce((sum, v) => sum + (parseFloat(v.total?.toString() || "0")), 0);
      
      return {
        ventasDelDia: ventasHoy.length,
        totalVentas,
        ventasHoy,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
