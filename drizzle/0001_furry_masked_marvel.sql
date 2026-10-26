CREATE TABLE `categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`descripcion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categorias_id` PRIMARY KEY(`id`),
	CONSTRAINT `categorias_nombre_unique` UNIQUE(`nombre`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido_paterno` varchar(100) NOT NULL,
	`apellido_materno` varchar(100),
	`email` varchar(100),
	`telefono` varchar(20),
	`direccion` text,
	`tipo_cliente` varchar(50) DEFAULT 'regular',
	`puntos_acumulados` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proveedorId` int NOT NULL,
	`userId` int NOT NULL,
	`fecha_compra` timestamp NOT NULL DEFAULT (now()),
	`subtotal` decimal(10,2),
	`iva` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2),
	`estado` enum('pendiente','recibida','cancelada') DEFAULT 'pendiente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detalles_compra` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compraId` int NOT NULL,
	`productoId` int NOT NULL,
	`cantidad` int NOT NULL,
	`precio_unitario` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2),
	CONSTRAINT `detalles_compra_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detalles_venta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ventaId` int NOT NULL,
	`productoId` int NOT NULL,
	`cantidad` int NOT NULL,
	`precio_unitario` decimal(10,2) NOT NULL,
	`descuento` decimal(10,2) DEFAULT '0',
	`subtotal` decimal(10,2),
	CONSTRAINT `detalles_venta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facturacion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ventaId` int NOT NULL,
	`clienteId` int,
	`folio` varchar(50),
	`fecha_emision` timestamp NOT NULL DEFAULT (now()),
	`subtotal` decimal(10,2),
	`iva` decimal(10,2),
	`total` decimal(10,2),
	`metodo_pago` varchar(50),
	`rfc_cliente` varchar(15),
	`razon_social` varchar(200),
	`estado` enum('activa','cancelada','pendiente') DEFAULT 'pendiente',
	`pdf_url` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `facturacion_id` PRIMARY KEY(`id`),
	CONSTRAINT `facturacion_ventaId_unique` UNIQUE(`ventaId`),
	CONSTRAINT `facturacion_folio_unique` UNIQUE(`folio`)
);
--> statement-breakpoint
CREATE TABLE `inventario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productoId` int NOT NULL,
	`stock_actual` int DEFAULT 0,
	`ubicacion` varchar(100),
	`lote` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventario_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventario_productoId_unique` UNIQUE(`productoId`)
);
--> statement-breakpoint
CREATE TABLE `movimientos_inventario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productoId` int NOT NULL,
	`tipo` enum('entrada','salida','ajuste') NOT NULL,
	`cantidad` int NOT NULL,
	`referencia` varchar(100),
	`referencia_id` int,
	`userId` int,
	`observaciones` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movimientos_inventario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`roleId` int NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido_paterno` varchar(100) NOT NULL,
	`apellido_materno` varchar(100),
	`curp` varchar(18),
	`rfc` varchar(13),
	`nss` varchar(11),
	`fecha_nacimiento` date,
	`genero` varchar(20),
	`estado_civil` varchar(20),
	`email` varchar(100),
	`telefono` varchar(20),
	`telefono_emergencias` varchar(20),
	`direccion` text,
	`fecha_ingreso` date NOT NULL,
	`fecha_baja` date,
	`motivo_baja` text,
	`puesto` varchar(100) NOT NULL,
	`salario_base` decimal(10,2),
	`tipo_salario` varchar(50),
	`jornada` varchar(50),
	`horario_entrada` time,
	`horario_salida` time,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personal_id` PRIMARY KEY(`id`),
	CONSTRAINT `personal_curp_unique` UNIQUE(`curp`),
	CONSTRAINT `personal_rfc_unique` UNIQUE(`rfc`),
	CONSTRAINT `personal_nss_unique` UNIQUE(`nss`)
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoriaId` int NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`codigo` varchar(50),
	`codigo_barras` varchar(50),
	`marca` varchar(100),
	`unidad_medida` varchar(50) DEFAULT 'pieza',
	`precio_compra` decimal(10,2),
	`precio_venta` decimal(10,2) NOT NULL,
	`stock_minimo` int DEFAULT 5,
	`stock_maximo` int DEFAULT 100,
	`fecha_caducidad` date,
	`imagen_url` varchar(255),
	`descripcion` text,
	`activo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productos_id` PRIMARY KEY(`id`),
	CONSTRAINT `productos_codigo_unique` UNIQUE(`codigo`),
	CONSTRAINT `productos_codigo_barras_unique` UNIQUE(`codigo_barras`)
);
--> statement-breakpoint
CREATE TABLE `proveedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`contacto_nombre` varchar(150),
	`email` varchar(100),
	`telefono_fijo` varchar(20),
	`direccion` text,
	`rfc` varchar(15),
	`tiempo_entregas_dias` int,
	`facturacion` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proveedores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(50) NOT NULL,
	`descripcion` text,
	`nivel_acceso` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_nombre_unique` UNIQUE(`nombre`)
);
--> statement-breakpoint
CREATE TABLE `ventas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clienteId` int,
	`fecha_venta` timestamp NOT NULL DEFAULT (now()),
	`subtotal` decimal(10,2),
	`iva` decimal(10,2) DEFAULT '0',
	`descuento` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`metodo_pago` varchar(50),
	`estado` enum('completada','pendiente','cancelada') DEFAULT 'completada',
	`numero_comprobante` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ventas_id` PRIMARY KEY(`id`),
	CONSTRAINT `ventas_numero_comprobante_unique` UNIQUE(`numero_comprobante`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `roleId` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `activo` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `clientes` (`email`);--> statement-breakpoint
CREATE INDEX `proveedor_idx` ON `compras` (`proveedorId`);--> statement-breakpoint
CREATE INDEX `fecha_idx` ON `compras` (`fecha_compra`);--> statement-breakpoint
CREATE INDEX `compra_idx` ON `detalles_compra` (`compraId`);--> statement-breakpoint
CREATE INDEX `venta_idx` ON `detalles_venta` (`ventaId`);--> statement-breakpoint
CREATE INDEX `venta_idx` ON `facturacion` (`ventaId`);--> statement-breakpoint
CREATE INDEX `producto_idx` ON `inventario` (`productoId`);--> statement-breakpoint
CREATE INDEX `producto_idx` ON `movimientos_inventario` (`productoId`);--> statement-breakpoint
CREATE INDEX `fecha_idx` ON `movimientos_inventario` (`createdAt`);--> statement-breakpoint
CREATE INDEX `curp_idx` ON `personal` (`curp`);--> statement-breakpoint
CREATE INDEX `rfc_idx` ON `personal` (`rfc`);--> statement-breakpoint
CREATE INDEX `codigo_idx` ON `productos` (`codigo`);--> statement-breakpoint
CREATE INDEX `categoria_idx` ON `productos` (`categoriaId`);--> statement-breakpoint
CREATE INDEX `rfc_idx` ON `proveedores` (`rfc`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `ventas` (`userId`);--> statement-breakpoint
CREATE INDEX `cliente_idx` ON `ventas` (`clienteId`);--> statement-breakpoint
CREATE INDEX `fecha_idx` ON `ventas` (`fecha_venta`);