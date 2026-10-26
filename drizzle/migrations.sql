-- Migración de base de datos para El Gallo Ferretería
-- Todas las tablas necesarias para el sistema de gestión

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(50) NOT NULL,
	`descripcion` text,
	`nivel_acceso` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_nombre_unique` UNIQUE(`nombre`)
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL UNIQUE,
	`name` text,
	`email` varchar(320) NOT NULL UNIQUE,
	`loginMethod` varchar(64),
	`role` enum('user', 'admin') DEFAULT 'user' NOT NULL,
	`roleId` int DEFAULT 2 NOT NULL,
	`activo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS `categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`descripcion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categorias_id` PRIMARY KEY(`id`),
	CONSTRAINT `categorias_nombre_unique` UNIQUE(`nombre`)
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
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
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`),
	INDEX `email_idx` (`email`)
);

-- Tabla de Proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
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
	CONSTRAINT `proveedores_id` PRIMARY KEY(`id`),
	INDEX `rfc_idx` (`rfc`)
);

-- Tabla de Personal
CREATE TABLE IF NOT EXISTS `personal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleId` int NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido_paterno` varchar(100) NOT NULL,
	`apellido_materno` varchar(100),
	`curp` varchar(18) UNIQUE,
	`rfc` varchar(13) UNIQUE,
	`nss` varchar(11) UNIQUE,
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
	INDEX `curp_idx` (`curp`),
	INDEX `rfc_idx` (`rfc`)
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS `productos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoriaId` int NOT NULL,
	`nombre` varchar(150) NOT NULL,
	`codigo` varchar(50) UNIQUE,
	`codigo_barras` varchar(50) UNIQUE,
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
	INDEX `codigo_idx` (`codigo`),
	INDEX `categoria_idx` (`categoriaId`)
);

-- Tabla de Inventario
CREATE TABLE IF NOT EXISTS `inventario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productoId` int NOT NULL,
	`stock_actual` int DEFAULT 0,
	`ubicacion` varchar(100),
	`lote` varchar(50),
	`fecha_ultimo_movimiento` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventario_id` PRIMARY KEY(`id`),
	INDEX `producto_idx` (`productoId`)
);

-- Tabla de Movimientos de Inventario
CREATE TABLE IF NOT EXISTS `movimientos_inventario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productoId` int NOT NULL,
	`tipo` enum('entrada', 'salida', 'ajuste') NOT NULL,
	`cantidad` int NOT NULL,
	`referencia` varchar(50),
	`referencia_id` int,
	`userId` int,
	`observaciones` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movimientos_inventario_id` PRIMARY KEY(`id`),
	INDEX `producto_idx` (`productoId`),
	INDEX `fecha_idx` (`createdAt`)
);

-- Tabla de Compras
CREATE TABLE IF NOT EXISTS `compras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proveedorId` int NOT NULL,
	`userId` int NOT NULL,
	`fecha_compra` timestamp NOT NULL DEFAULT (now()),
	`subtotal` decimal(10,2),
	`iva` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2),
	`estado` enum('pendiente', 'recibida', 'cancelada') DEFAULT 'pendiente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compras_id` PRIMARY KEY(`id`),
	INDEX `proveedor_idx` (`proveedorId`),
	INDEX `fecha_idx` (`fecha_compra`)
);

-- Tabla de Detalles de Compra
CREATE TABLE IF NOT EXISTS `detalles_compra` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compraId` int NOT NULL,
	`productoId` int NOT NULL,
	`cantidad` int NOT NULL,
	`precio_unitario` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2),
	CONSTRAINT `detalles_compra_id` PRIMARY KEY(`id`),
	INDEX `compra_idx` (`compraId`)
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS `ventas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clienteId` int,
	`fecha_venta` timestamp NOT NULL DEFAULT (now()),
	`subtotal` decimal(10,2),
	`iva` decimal(10,2) DEFAULT '0',
	`descuento` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`metodo_pago` varchar(50),
	`estado` enum('completada', 'pendiente', 'cancelada') DEFAULT 'completada',
	`numero_comprobante` varchar(50) UNIQUE,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ventas_id` PRIMARY KEY(`id`),
	INDEX `user_idx` (`userId`),
	INDEX `cliente_idx` (`clienteId`),
	INDEX `fecha_idx` (`fecha_venta`)
);

-- Tabla de Detalles de Venta
CREATE TABLE IF NOT EXISTS `detalles_venta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ventaId` int NOT NULL,
	`productoId` int NOT NULL,
	`cantidad` int NOT NULL,
	`precio_unitario` decimal(10,2) NOT NULL,
	`descuento` decimal(10,2) DEFAULT '0',
	`subtotal` decimal(10,2),
	CONSTRAINT `detalles_venta_id` PRIMARY KEY(`id`),
	INDEX `venta_idx` (`ventaId`)
);

-- Tabla de Facturación
CREATE TABLE IF NOT EXISTS `facturacion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ventaId` int NOT NULL,
	`numero_factura` varchar(50),
	`fecha_factura` timestamp NOT NULL DEFAULT (now()),
	`rfc_cliente` varchar(13),
	`razon_social` varchar(255),
	`domicilio` text,
	`concepto` text,
	`subtotal` decimal(10,2),
	`iva` decimal(10,2),
	`total` decimal(10,2),
	`estado` enum('borrador', 'emitida', 'cancelada') DEFAULT 'borrador',
	`archivo_pdf` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `facturacion_id` PRIMARY KEY(`id`),
	INDEX `venta_idx` (`ventaId`)
);

-- Insertar roles por defecto
INSERT IGNORE INTO `roles` (`id`, `nombre`, `descripcion`, `nivel_acceso`) VALUES
(1, 'Administrador', 'Acceso total al sistema', 3),
(2, 'Vendedor', 'Acceso a ventas e inventario', 2),
(3, 'Almacenista', 'Acceso a inventario y movimientos', 1);
