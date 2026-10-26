import {
  int,
  varchar,
  text,
  timestamp,
  decimal,
  date,
  mysqlEnum,
  mysqlTable,
  boolean,
  time,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Esquema de Base de Datos para Ferretería "El Gallo"
 * Incluye todas las tablas necesarias para gestión de inventario, ventas, clientes y personal
 */

// ============ USUARIOS Y ROLES ============

export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 50 }).notNull().unique(),
  descripcion: text("descripcion"),
  nivel_acceso: int("nivel_acceso").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  roleId: int("roleId").notNull().default(2), // 2 = Vendedor por defecto
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  activo: boolean("activo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ============ CLIENTES ============

export const clientes = mysqlTable(
  "clientes",
  {
    id: int("id").autoincrement().primaryKey(),
    nombre: varchar("nombre", { length: 100 }).notNull(),
    apellido_paterno: varchar("apellido_paterno", { length: 100 }).notNull(),
    apellido_materno: varchar("apellido_materno", { length: 100 }),
    email: varchar("email", { length: 100 }),
    telefono: varchar("telefono", { length: 20 }),
    direccion: text("direccion"),
    tipo_cliente: varchar("tipo_cliente", { length: 50 }).default("regular"), // regular, mayorista
    puntos_acumulados: int("puntos_acumulados").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
  })
);

// ============ PROVEEDORES ============

export const proveedores = mysqlTable(
  "proveedores",
  {
    id: int("id").autoincrement().primaryKey(),
    nombre: varchar("nombre", { length: 150 }).notNull(),
    contacto_nombre: varchar("contacto_nombre", { length: 150 }),
    email: varchar("email", { length: 100 }),
    telefono_fijo: varchar("telefono_fijo", { length: 20 }),
    direccion: text("direccion"),
    rfc: varchar("rfc", { length: 15 }),
    tiempo_entregas_dias: int("tiempo_entregas_dias"),
    facturacion: boolean("facturacion").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    rfcIdx: index("rfc_idx").on(table.rfc),
  })
);

// ============ PERSONAL ============

export const personal = mysqlTable(
  "personal",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    roleId: int("roleId").notNull(),
    nombre: varchar("nombre", { length: 100 }).notNull(),
    apellido_paterno: varchar("apellido_paterno", { length: 100 }).notNull(),
    apellido_materno: varchar("apellido_materno", { length: 100 }),
    curp: varchar("curp", { length: 18 }).unique(),
    rfc: varchar("rfc", { length: 13 }).unique(),
    nss: varchar("nss", { length: 11 }).unique(),
    fecha_nacimiento: date("fecha_nacimiento"),
    genero: varchar("genero", { length: 20 }),
    estado_civil: varchar("estado_civil", { length: 20 }),
    email: varchar("email", { length: 100 }),
    telefono: varchar("telefono", { length: 20 }),
    telefono_emergencias: varchar("telefono_emergencias", { length: 20 }),
    direccion: text("direccion"),
    fecha_ingreso: date("fecha_ingreso").notNull(),
    fecha_baja: date("fecha_baja"),
    motivo_baja: text("motivo_baja"),
    puesto: varchar("puesto", { length: 100 }).notNull(),
    salario_base: decimal("salario_base", { precision: 10, scale: 2 }),
    tipo_salario: varchar("tipo_salario", { length: 50 }), // mensual, diario, por_hora
    jornada: varchar("jornada", { length: 50 }), // completa, media, nocturna
    horario_entrada: time("horario_entrada"),
    horario_salida: time("horario_salida"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    curpIdx: index("curp_idx").on(table.curp),
    rfcIdx: index("rfc_idx").on(table.rfc),
  })
);

// ============ CATEGORÍAS ============

export const categorias = mysqlTable("categorias", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull().unique(),
  descripcion: text("descripcion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============ PRODUCTOS ============

export const productos = mysqlTable(
  "productos",
  {
    id: int("id").autoincrement().primaryKey(),
    categoriaId: int("categoriaId").notNull(),
    nombre: varchar("nombre", { length: 150 }).notNull(),
    codigo: varchar("codigo", { length: 50 }).unique(),
    codigo_barras: varchar("codigo_barras", { length: 50 }).unique(),
    marca: varchar("marca", { length: 100 }),
    unidad_medida: varchar("unidad_medida", { length: 50 }).default("pieza"),
    precio_compra: decimal("precio_compra", { precision: 10, scale: 2 }),
    precio_venta: decimal("precio_venta", { precision: 10, scale: 2 }).notNull(),
    stock_minimo: int("stock_minimo").default(5),
    stock_maximo: int("stock_maximo").default(100),
    fecha_caducidad: date("fecha_caducidad"),
    imagen_url: varchar("imagen_url", { length: 255 }),
    descripcion: text("descripcion"),
    activo: boolean("activo").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codigoIdx: index("codigo_idx").on(table.codigo),
    categoriaIdx: index("categoria_idx").on(table.categoriaId),
  })
);

// ============ INVENTARIO ============

export const inventario = mysqlTable(
  "inventario",
  {
    id: int("id").autoincrement().primaryKey(),
    productoId: int("productoId").notNull().unique(),
    stock_actual: int("stock_actual").default(0),
    ubicacion: varchar("ubicacion", { length: 100 }),
    lote: varchar("lote", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productoIdx: index("producto_idx").on(table.productoId),
  })
);

// ============ MOVIMIENTOS DE INVENTARIO ============

export const movimientos_inventario = mysqlTable(
  "movimientos_inventario",
  {
    id: int("id").autoincrement().primaryKey(),
    productoId: int("productoId").notNull(),
    tipo: mysqlEnum("tipo", ["entrada", "salida", "ajuste"]).notNull(),
    cantidad: int("cantidad").notNull(),
    referencia: varchar("referencia", { length: 100 }), // venta, compra, ajuste
    referencia_id: int("referencia_id"),
    userId: int("userId"),
    observaciones: text("observaciones"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productoIdx: index("producto_idx").on(table.productoId),
    fechaIdx: index("fecha_idx").on(table.createdAt),
  })
);

// ============ COMPRAS ============

export const compras = mysqlTable(
  "compras",
  {
    id: int("id").autoincrement().primaryKey(),
    proveedorId: int("proveedorId").notNull(),
    userId: int("userId").notNull(),
    fecha_compra: timestamp("fecha_compra").defaultNow().notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
    iva: decimal("iva", { precision: 10, scale: 2 }).default("0"),
    total: decimal("total", { precision: 10, scale: 2 }),
    estado: mysqlEnum("estado", ["pendiente", "recibida", "cancelada"]).default("pendiente"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    proveedorIdx: index("proveedor_idx").on(table.proveedorId),
    fechaIdx: index("fecha_idx").on(table.fecha_compra),
  })
);

// ============ DETALLES DE COMPRA ============

export const detalles_compra = mysqlTable(
  "detalles_compra",
  {
    id: int("id").autoincrement().primaryKey(),
    compraId: int("compraId").notNull(),
    productoId: int("productoId").notNull(),
    cantidad: int("cantidad").notNull(),
    precio_unitario: decimal("precio_unitario", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  },
  (table) => ({
    compraIdx: index("compra_idx").on(table.compraId),
  })
);

// ============ VENTAS ============

export const ventas = mysqlTable(
  "ventas",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    clienteId: int("clienteId"),
    fecha_venta: timestamp("fecha_venta").defaultNow().notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
    iva: decimal("iva", { precision: 10, scale: 2 }).default("0"),
    descuento: decimal("descuento", { precision: 10, scale: 2 }).default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    metodo_pago: varchar("metodo_pago", { length: 50 }), // efectivo, tarjeta, transferencia
    estado: mysqlEnum("estado", ["completada", "pendiente", "cancelada"]).default("completada"),
    numero_comprobante: varchar("numero_comprobante", { length: 50 }).unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    clienteIdx: index("cliente_idx").on(table.clienteId),
    fechaIdx: index("fecha_idx").on(table.fecha_venta),
  })
);

// ============ DETALLES DE VENTA ============

export const detalles_venta = mysqlTable(
  "detalles_venta",
  {
    id: int("id").autoincrement().primaryKey(),
    ventaId: int("ventaId").notNull(),
    productoId: int("productoId").notNull(),
    cantidad: int("cantidad").notNull(),
    precio_unitario: decimal("precio_unitario", { precision: 10, scale: 2 }).notNull(),
    descuento: decimal("descuento", { precision: 10, scale: 2 }).default("0"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  },
  (table) => ({
    ventaIdx: index("venta_idx").on(table.ventaId),
  })
);

// ============ FACTURACIÓN ============

export const facturacion = mysqlTable(
  "facturacion",
  {
    id: int("id").autoincrement().primaryKey(),
    ventaId: int("ventaId").notNull().unique(),
    clienteId: int("clienteId"),
    folio: varchar("folio", { length: 50 }).unique(),
    fecha_emision: timestamp("fecha_emision").defaultNow().notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
    iva: decimal("iva", { precision: 10, scale: 2 }),
    total: decimal("total", { precision: 10, scale: 2 }),
    metodo_pago: varchar("metodo_pago", { length: 50 }),
    rfc_cliente: varchar("rfc_cliente", { length: 15 }),
    razon_social: varchar("razon_social", { length: 200 }),
    estado: mysqlEnum("estado", ["activa", "cancelada", "pendiente"]).default("pendiente"),
    pdf_url: varchar("pdf_url", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    ventaIdx: index("venta_idx").on(table.ventaId),
  })
);

// ============ TIPOS DE EXPORTACIÓN ============

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

export type Proveedor = typeof proveedores.$inferSelect;
export type InsertProveedor = typeof proveedores.$inferInsert;

export type Personal = typeof personal.$inferSelect;
export type InsertPersonal = typeof personal.$inferInsert;

export type Categoria = typeof categorias.$inferSelect;
export type InsertCategoria = typeof categorias.$inferInsert;

export type Producto = typeof productos.$inferSelect;
export type InsertProducto = typeof productos.$inferInsert;

export type Inventario = typeof inventario.$inferSelect;
export type InsertInventario = typeof inventario.$inferInsert;

export type MovimientoInventario = typeof movimientos_inventario.$inferSelect;
export type InsertMovimientoInventario = typeof movimientos_inventario.$inferInsert;

export type Compra = typeof compras.$inferSelect;
export type InsertCompra = typeof compras.$inferInsert;

export type DetalleCompra = typeof detalles_compra.$inferSelect;
export type InsertDetalleCompra = typeof detalles_compra.$inferInsert;

export type Venta = typeof ventas.$inferSelect;
export type InsertVenta = typeof ventas.$inferInsert;

export type DetalleVenta = typeof detalles_venta.$inferSelect;
export type InsertDetalleVenta = typeof detalles_venta.$inferInsert;

export type Factura = typeof facturacion.$inferSelect;
export type InsertFactura = typeof facturacion.$inferInsert;
