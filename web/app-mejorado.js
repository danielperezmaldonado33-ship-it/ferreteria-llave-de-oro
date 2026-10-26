// DATOS GLOBALES
let usuarioActual = null;
let carrito = [];
let clientes = [];
let proveedores = [];
let personal = [];
let categorias = [];
let productos = [];
let inventario = [];
let facturas = [];
let usuarios = [];
let editandoId = null;
let editandoTipo = null;

// FUNCIONES DE PERSISTENCIA
function guardarDatos() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('proveedores', JSON.stringify(proveedores));
    localStorage.setItem('personal', JSON.stringify(personal));
    localStorage.setItem('categorias', JSON.stringify(categorias));
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('inventario', JSON.stringify(inventario));
    localStorage.setItem('facturas', JSON.stringify(facturas));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function cargarDatosGuardados() {
    clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    proveedores = JSON.parse(localStorage.getItem('proveedores')) || [];
    personal = JSON.parse(localStorage.getItem('personal')) || [];
    categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    inventario = JSON.parse(localStorage.getItem('inventario')) || [];
    facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
}

// VALIDACIÓN DE CAMPOS
function validarCamposRequeridos(campos) {
    const camposVacios = campos.filter(campo => !campo.value || campo.value.trim() === '');
    if (camposVacios.length > 0) {
        mostrarAlerta('Por favor completa todos los campos requeridos', 'error');
        return false;
    }
    return true;
}

function mostrarAlerta(mensaje, tipo, seccion) {
    const alertaId = seccion ? `alerta${seccion.charAt(0).toUpperCase() + seccion.slice(1)}` : 'alertaGeneral';
    const alerta = document.getElementById(alertaId);
    if (alerta) {
        alerta.textContent = mensaje;
        alerta.className = `alert show ${tipo}`;
        setTimeout(() => {
            alerta.classList.remove('show');
        }, 3000);
    }
}

// LOGIN
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (email && password) {
        usuarioActual = { email, nombre: 'Administrador' };
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainApp').classList.add('active');
        actualizarReloj();
        cargarDatosGuardados();
        cargarDatos();
    }
}

// CERRAR SESIÓN
function confirmLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        logout();
    }
}

function logout() {
    usuarioActual = null;
    carrito = [];
    guardarDatos();
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('mainApp').classList.remove('active');
}

// RELOJ
function actualizarReloj() {
    setInterval(() => {
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString('es-MX');
        const hora = ahora.toLocaleTimeString('es-MX');
        document.getElementById('datetime').textContent = `${fecha} ${hora}`;
    }, 1000);
}

// SECCIONES
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    document.getElementById('pageTitle').textContent = event.target.textContent;
}

// MODALES
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    editandoId = null;
    editandoTipo = null;
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    limpiarFormulario(modalId);
    editandoId = null;
    editandoTipo = null;
}

function limpiarFormulario(modalId) {
    const inputs = document.querySelectorAll(`#${modalId} input, #${modalId} textarea, #${modalId} select`);
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
}

// FILTROS
function filtrarTabla(tipo) {
    const filtroId = `filtro${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    const filtro = document.getElementById(filtroId).value.toLowerCase();
    const tableId = `${tipo}Table`;
    const table = document.getElementById(tableId);
    const filas = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    let filasVisibles = 0;
    Array.from(filas).forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        if (texto.includes(filtro)) {
            fila.style.display = '';
            filasVisibles++;
        } else {
            fila.style.display = 'none';
        }
    });

    const noDataId = `no${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Data`;
    const noDataDiv = document.getElementById(noDataId);
    if (noDataDiv) {
        noDataDiv.textContent = filasVisibles === 0 ? 'No se encontraron resultados' : '';
    }
}

function limpiarFiltro(tipo) {
    const filtroId = `filtro${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    document.getElementById(filtroId).value = '';
    filtrarTabla(tipo);
}

// CLIENTES
function guardarCliente() {
    const campos = [
        document.getElementById('clienteNombre'),
        document.getElementById('clienteApellidoP'),
        document.getElementById('clienteApellidoM'),
        document.getElementById('clienteTelefono'),
        document.getElementById('clienteEmail'),
        document.getElementById('clienteDireccion')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const cliente = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('clienteNombre').value,
        apellidoP: document.getElementById('clienteApellidoP').value,
        apellidoM: document.getElementById('clienteApellidoM').value,
        telefono: document.getElementById('clienteTelefono').value,
        email: document.getElementById('clienteEmail').value,
        direccion: document.getElementById('clienteDireccion').value
    };

    if (editandoId) {
        clientes = clientes.map(c => c.id === editandoId ? cliente : c);
        mostrarAlerta('Cliente actualizado correctamente', 'success', 'clientes');
    } else {
        clientes.push(cliente);
        mostrarAlerta('Cliente agregado correctamente', 'success', 'clientes');
    }

    guardarDatos();
    actualizarTablaClientes();
    closeModal('clienteModal');
}

function actualizarTablaClientes() {
    const tbody = document.querySelector('#clientesTable tbody');
    tbody.innerHTML = '';
    if (clientes.length === 0) {
        document.getElementById('noClientesData').textContent = 'No hay clientes registrados';
    } else {
        document.getElementById('noClientesData').textContent = '';
        clientes.forEach(c => {
            tbody.innerHTML += `<tr>
                <td>${c.nombre}</td>
                <td>${c.apellidoP}</td>
                <td>${c.apellidoM}</td>
                <td>${c.telefono}</td>
                <td>${c.email}</td>
                <td>${c.direccion}</td>
                <td>
                    <button class="btn-edit" onclick="editarCliente(${c.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarCliente(${c.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('totalClientes').textContent = clientes.length;
}

function editarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        document.getElementById('clienteNombre').value = cliente.nombre;
        document.getElementById('clienteApellidoP').value = cliente.apellidoP;
        document.getElementById('clienteApellidoM').value = cliente.apellidoM;
        document.getElementById('clienteTelefono').value = cliente.telefono;
        document.getElementById('clienteEmail').value = cliente.email;
        document.getElementById('clienteDireccion').value = cliente.direccion;
        editandoId = id;
        editandoTipo = 'cliente';
        openModal('clienteModal');
    }
}

function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        clientes = clientes.filter(c => c.id !== id);
        guardarDatos();
        actualizarTablaClientes();
        mostrarAlerta('Cliente eliminado correctamente', 'success', 'clientes');
    }
}

// PROVEEDORES
function guardarProveedor() {
    const campos = [
        document.getElementById('proveedorNombre'),
        document.getElementById('proveedorTelefono'),
        document.getElementById('proveedorEmail'),
        document.getElementById('proveedorDireccion'),
        document.getElementById('proveedorRFC')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const proveedor = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('proveedorNombre').value,
        telefono: document.getElementById('proveedorTelefono').value,
        email: document.getElementById('proveedorEmail').value,
        direccion: document.getElementById('proveedorDireccion').value,
        rfc: document.getElementById('proveedorRFC').value
    };

    if (editandoId) {
        proveedores = proveedores.map(p => p.id === editandoId ? proveedor : p);
        mostrarAlerta('Proveedor actualizado correctamente', 'success', 'proveedores');
    } else {
        proveedores.push(proveedor);
        mostrarAlerta('Proveedor agregado correctamente', 'success', 'proveedores');
    }

    guardarDatos();
    actualizarTablaProveedores();
    closeModal('proveedorModal');
}

function actualizarTablaProveedores() {
    const tbody = document.querySelector('#proveedoresTable tbody');
    tbody.innerHTML = '';
    if (proveedores.length === 0) {
        document.getElementById('noProveedoresData').textContent = 'No hay proveedores registrados';
    } else {
        document.getElementById('noProveedoresData').textContent = '';
        proveedores.forEach(p => {
            tbody.innerHTML += `<tr>
                <td>${p.nombre}</td>
                <td>${p.telefono}</td>
                <td>${p.email}</td>
                <td>${p.direccion}</td>
                <td>${p.rfc}</td>
                <td>
                    <button class="btn-edit" onclick="editarProveedor(${p.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarProveedor(${p.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
}

function editarProveedor(id) {
    const proveedor = proveedores.find(p => p.id === id);
    if (proveedor) {
        document.getElementById('proveedorNombre').value = proveedor.nombre;
        document.getElementById('proveedorTelefono').value = proveedor.telefono;
        document.getElementById('proveedorEmail').value = proveedor.email;
        document.getElementById('proveedorDireccion').value = proveedor.direccion;
        document.getElementById('proveedorRFC').value = proveedor.rfc;
        editandoId = id;
        editandoTipo = 'proveedor';
        openModal('proveedorModal');
    }
}

function eliminarProveedor(id) {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
        proveedores = proveedores.filter(p => p.id !== id);
        guardarDatos();
        actualizarTablaProveedores();
        mostrarAlerta('Proveedor eliminado correctamente', 'success', 'proveedores');
    }
}

// PERSONAL
function guardarPersonal() {
    const campos = [
        document.getElementById('personalNombre'),
        document.getElementById('personalCURP'),
        document.getElementById('personalRFC'),
        document.getElementById('personalNSS'),
        document.getElementById('personalSalario'),
        document.getElementById('personalDireccion')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const pers = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('personalNombre').value,
        curp: document.getElementById('personalCURP').value,
        rfc: document.getElementById('personalRFC').value,
        nss: document.getElementById('personalNSS').value,
        salario: document.getElementById('personalSalario').value,
        direccion: document.getElementById('personalDireccion').value
    };

    if (editandoId) {
        personal = personal.map(p => p.id === editandoId ? pers : p);
        mostrarAlerta('Personal actualizado correctamente', 'success', 'personal');
    } else {
        personal.push(pers);
        mostrarAlerta('Personal agregado correctamente', 'success', 'personal');
    }

    guardarDatos();
    actualizarTablaPersonal();
    closeModal('personalModal');
}

function actualizarTablaPersonal() {
    const tbody = document.querySelector('#personalTable tbody');
    tbody.innerHTML = '';
    if (personal.length === 0) {
        document.getElementById('noPersonalData').textContent = 'No hay personal registrado';
    } else {
        document.getElementById('noPersonalData').textContent = '';
        personal.forEach(p => {
            tbody.innerHTML += `<tr>
                <td>${p.nombre}</td>
                <td>${p.curp}</td>
                <td>${p.rfc}</td>
                <td>${p.nss}</td>
                <td>$${parseFloat(p.salario).toFixed(2)}</td>
                <td>${p.direccion}</td>
                <td>
                    <button class="btn-edit" onclick="editarPersonal(${p.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarPersonal(${p.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
}

function editarPersonal(id) {
    const pers = personal.find(p => p.id === id);
    if (pers) {
        document.getElementById('personalNombre').value = pers.nombre;
        document.getElementById('personalCURP').value = pers.curp;
        document.getElementById('personalRFC').value = pers.rfc;
        document.getElementById('personalNSS').value = pers.nss;
        document.getElementById('personalSalario').value = pers.salario;
        document.getElementById('personalDireccion').value = pers.direccion;
        editandoId = id;
        editandoTipo = 'personal';
        openModal('personalModal');
    }
}

function eliminarPersonal(id) {
    if (confirm('¿Estás seguro de eliminar este personal?')) {
        personal = personal.filter(p => p.id !== id);
        guardarDatos();
        actualizarTablaPersonal();
        mostrarAlerta('Personal eliminado correctamente', 'success', 'personal');
    }
}

// CATEGORÍAS
function guardarCategoria() {
    const campos = [
        document.getElementById('categoriaNombre'),
        document.getElementById('categoriaDescripcion')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const categoria = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('categoriaNombre').value,
        descripcion: document.getElementById('categoriaDescripcion').value,
        fechaCreacion: editandoId ? categorias.find(c => c.id === editandoId).fechaCreacion : new Date().toLocaleDateString('es-MX'),
        fechaEdicion: new Date().toLocaleDateString('es-MX')
    };

    if (editandoId) {
        categorias = categorias.map(c => c.id === editandoId ? categoria : c);
        mostrarAlerta('Categoría actualizada correctamente', 'success', 'categorias');
    } else {
        categorias.push(categoria);
        mostrarAlerta('Categoría agregada correctamente', 'success', 'categorias');
    }

    guardarDatos();
    actualizarTablaCategorias();
    actualizarSelectProductos();
    closeModal('categoriaModal');
}

function actualizarTablaCategorias() {
    const tbody = document.querySelector('#categoriasTable tbody');
    tbody.innerHTML = '';
    if (categorias.length === 0) {
        document.getElementById('noCategoriesData').textContent = 'No hay categorías registradas';
    } else {
        document.getElementById('noCategoriesData').textContent = '';
        categorias.forEach(c => {
            tbody.innerHTML += `<tr>
                <td>${c.nombre}</td>
                <td>${c.descripcion}</td>
                <td>${c.fechaCreacion}</td>
                <td>${c.fechaEdicion}</td>
                <td>
                    <button class="btn-edit" onclick="editarCategoria(${c.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarCategoria(${c.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
}

function editarCategoria(id) {
    const categoria = categorias.find(c => c.id === id);
    if (categoria) {
        document.getElementById('categoriaNombre').value = categoria.nombre;
        document.getElementById('categoriaDescripcion').value = categoria.descripcion;
        editandoId = id;
        editandoTipo = 'categoria';
        openModal('categoriaModal');
    }
}

function eliminarCategoria(id) {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
        categorias = categorias.filter(c => c.id !== id);
        guardarDatos();
        actualizarTablaCategorias();
        actualizarSelectProductos();
        mostrarAlerta('Categoría eliminada correctamente', 'success', 'categorias');
    }
}

// PRODUCTOS
function guardarProducto() {
    const campos = [
        document.getElementById('productoCodigo'),
        document.getElementById('productoNombre'),
        document.getElementById('productoPrecioCompra'),
        document.getElementById('productoPrecioVenta'),
        document.getElementById('productoFechaCaducidad'),
        document.getElementById('productoStock')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const producto = {
        id: editandoId || Date.now(),
        codigo: document.getElementById('productoCodigo').value,
        nombre: document.getElementById('productoNombre').value,
        categoria: document.getElementById('productoCategoria').value,
        precioCompra: parseFloat(document.getElementById('productoPrecioCompra').value),
        precioVenta: parseFloat(document.getElementById('productoPrecioVenta').value),
        fechaCaducidad: document.getElementById('productoFechaCaducidad').value,
        stock: parseInt(document.getElementById('productoStock').value)
    };

    if (editandoId) {
        productos = productos.map(p => p.id === editandoId ? producto : p);
        mostrarAlerta('Producto actualizado correctamente', 'success', 'productos');
    } else {
        productos.push(producto);
        mostrarAlerta('Producto agregado correctamente', 'success', 'productos');
    }

    guardarDatos();
    actualizarTablaProductos();
    actualizarSelectProductos();
    closeModal('productoModal');
}

function actualizarTablaProductos() {
    const tbody = document.querySelector('#productosTable tbody');
    tbody.innerHTML = '';
    if (productos.length === 0) {
        document.getElementById('noProductosData').textContent = 'No hay productos registrados';
    } else {
        document.getElementById('noProductosData').textContent = '';
        productos.forEach(p => {
            tbody.innerHTML += `<tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>$${p.precioCompra.toFixed(2)}</td>
                <td>$${p.precioVenta.toFixed(2)}</td>
                <td>${p.fechaCaducidad}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-edit" onclick="editarProducto(${p.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('totalProductos').textContent = productos.length;
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        document.getElementById('productoCodigo').value = producto.codigo;
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoCategoria').value = producto.categoria;
        document.getElementById('productoPrecioCompra').value = producto.precioCompra;
        document.getElementById('productoPrecioVenta').value = producto.precioVenta;
        document.getElementById('productoFechaCaducidad').value = producto.fechaCaducidad;
        document.getElementById('productoStock').value = producto.stock;
        editandoId = id;
        editandoTipo = 'producto';
        openModal('productoModal');
    }
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        actualizarTablaProductos();
        actualizarSelectProductos();
        mostrarAlerta('Producto eliminado correctamente', 'success', 'productos');
    }
}

function actualizarSelectProductos() {
    const select = document.getElementById('productoCategoria');
    select.innerHTML = '<option>Seleccionar categoría</option>';
    categorias.forEach(c => {
        const option = document.createElement('option');
        option.value = c.nombre;
        option.textContent = c.nombre;
        select.appendChild(option);
    });

    const selectMov = document.getElementById('movimientoProducto');
    selectMov.innerHTML = '<option>Seleccionar producto</option>';
    productos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.codigo} - ${p.nombre}`;
        selectMov.appendChild(option);
    });
}

// INVENTARIO
function guardarMovimiento() {
    const campos = [
        document.getElementById('movimientoProducto'),
        document.getElementById('movimientoTipo'),
        document.getElementById('movimientoCantidad')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const productoId = parseInt(document.getElementById('movimientoProducto').value);
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
        mostrarAlerta('Selecciona un producto válido', 'error', 'inventario');
        return;
    }
    const cantidad = parseInt(document.getElementById('movimientoCantidad').value);
    const tipo = document.getElementById('movimientoTipo').value;

    if (tipo === 'Salida' && cantidad > producto.stock) {
        mostrarAlerta('Stock insuficiente', 'error', 'inventario');
        return;
    }

    if (tipo === 'Entrada') producto.stock += cantidad;
    else if (tipo === 'Salida') producto.stock -= cantidad;

    const movimiento = {
        id: Date.now(),
        productoId: productoId,
        productoNombre: producto.nombre,
        tipo: tipo,
        cantidad: cantidad,
        stockActual: producto.stock,
        fecha: new Date().toLocaleDateString('es-MX'),
        observaciones: document.getElementById('movimientoObservaciones').value
    };
    inventario.push(movimiento);
    guardarDatos();
    actualizarTablaInventario();
    actualizarTablaProductos();
    mostrarAlerta('Movimiento registrado correctamente', 'success', 'inventario');
    closeModal('movimientoModal');
}

function actualizarTablaInventario() {
    const tbody = document.querySelector('#inventarioTable tbody');
    tbody.innerHTML = '';
    if (inventario.length === 0) {
        document.getElementById('noInventarioData').textContent = 'No hay movimientos registrados';
    } else {
        document.getElementById('noInventarioData').textContent = '';
        inventario.forEach(m => {
            tbody.innerHTML += `<tr>
                <td>${m.productoNombre}</td>
                <td>${m.tipo}</td>
                <td>${m.cantidad}</td>
                <td>${m.stockActual}</td>
                <td>${m.fecha}</td>
                <td>
                    <button class="btn-delete" onclick="eliminarMovimiento(${m.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
}

function eliminarMovimiento(id) {
    if (confirm('¿Estás seguro?')) {
        inventario = inventario.filter(m => m.id !== id);
        guardarDatos();
        actualizarTablaInventario();
        mostrarAlerta('Movimiento eliminado correctamente', 'success', 'inventario');
    }
}

// VENTAS
function buscarProducto() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const div = document.getElementById('productosDisponibles');
    div.innerHTML = '';
    productos.filter(p => (p.nombre.toLowerCase().includes(busqueda) || p.codigo.toLowerCase().includes(busqueda)) && p.stock > 0).forEach(p => {
        div.innerHTML += `<div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ddd;">
            <strong>${p.codigo} - ${p.nombre}</strong><br>
            Precio: $${p.precioVenta.toFixed(2)} | Stock: ${p.stock}
            <button onclick="agregarAlCarrito(${p.id})" style="float: right; padding: 5px 10px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer;">Agregar</button>
        </div>`;
    });
}

function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock <= 0) {
        mostrarAlerta('Producto sin stock disponible', 'error', 'ventas');
        return;
    }
    const itemCarrito = carrito.find(c => c.id === productoId);
    if (itemCarrito) {
        if (itemCarrito.cantidad < producto.stock) {
            itemCarrito.cantidad++;
        } else {
            mostrarAlerta('Stock insuficiente', 'error', 'ventas');
        }
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarCarrito();
}

function actualizarCarrito() {
    const div = document.getElementById('carritoProductos');
    div.innerHTML = '';
    carrito.forEach((item, index) => {
        const subtotal = item.precioVenta * item.cantidad;
        div.innerHTML += `<div class="carrito-item">
            <div>
                <strong>${item.nombre}</strong><br>
                Precio: $${item.precioVenta.toFixed(2)}<br>
                Cantidad: <input type="number" value="${item.cantidad}" min="1" max="${item.stock}" onchange="cambiarCantidad(${index}, this.value)" style="width: 60px; padding: 5px;">
                <br>Subtotal: $${subtotal.toFixed(2)}
            </div>
            <button class="btn-delete" onclick="eliminarDelCarrito(${index})">Eliminar</button>
        </div>`;
    });
    calcularTotales();
}

function cambiarCantidad(index, cantidad) {
    carrito[index].cantidad = parseInt(cantidad);
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function calcularTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
    const tipoDescuento = document.querySelector('input[name="tipoDescuento"]:checked').value;
    const descuentoInput = parseFloat(document.getElementById('descuentoVenta').value) || 0;
    let descuentoMonto = 0;
    if (tipoDescuento === 'porcentaje') {
        descuentoMonto = (subtotal * descuentoInput) / 100;
    } else {
        descuentoMonto = descuentoInput;
    }
    const subtotalDesc = subtotal - descuentoMonto;
    const iva = subtotalDesc * 0.16;
    const total = subtotalDesc + iva;

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('descuentoMonto').textContent = '$' + descuentoMonto.toFixed(2);
    document.getElementById('subtotalDesc').textContent = '$' + subtotalDesc.toFixed(2);
    document.getElementById('iva').textContent = '$' + iva.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);

    const metodoPago = document.getElementById('metodoPago').value;
    const cambioDiv = document.getElementById('cambioDiv');
    if (metodoPago === 'Efectivo') {
        cambioDiv.style.display = 'block';
    } else {
        cambioDiv.style.display = 'none';
        document.getElementById('montoPagado').value = '';
        document.getElementById('cambio').value = '';
    }
}

function abrirOpcionesVenta() {
    if (carrito.length === 0) {
        mostrarAlerta('El carrito está vacío', 'error', 'ventas');
        return;
    }
    openModal('opcionesVentaModal');
}

function procesarVenta() {
    if (carrito.length === 0) {
        mostrarAlerta('El carrito está vacío', 'error', 'ventas');
        return;
    }

    const metodoPago = document.getElementById('metodoPago').value;
    if (metodoPago === 'Efectivo') {
        const montoPagado = parseFloat(document.getElementById('montoPagado').value);
        if (!montoPagado || montoPagado <= 0) {
            mostrarAlerta('Ingresa el monto pagado', 'error', 'ventas');
            return;
        }
    }

    const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
    const tipoDescuento = document.querySelector('input[name="tipoDescuento"]:checked').value;
    const descuentoInput = parseFloat(document.getElementById('descuentoVenta').value) || 0;
    let descuentoMonto = 0;
    if (tipoDescuento === 'porcentaje') {
        descuentoMonto = (subtotal * descuentoInput) / 100;
    } else {
        descuentoMonto = descuentoInput;
    }
    const subtotalDesc = subtotal - descuentoMonto;
    const iva = subtotalDesc * 0.16;
    const total = subtotalDesc + iva;

    const montoPagado = parseFloat(document.getElementById('montoPagado').value) || total;
    const cambio = montoPagado - total;

    const clienteNombre = document.getElementById('clienteVenta').value || 'Cliente General';
    const rfcCliente = document.getElementById('rfcCliente').value || 'N/A';
    const notas = document.getElementById('notasVenta').value;

    // Actualizar stock
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock -= item.cantidad;
        }
    });

    // Generar comprobante
    let comprobante = `
╔════════════════════════════════════════════╗
║         EL GALLO FERRETERÍA                ║
║      RFC: MTI1234567890                    ║
║     Salinas Victoría N.L.                  ║
╚════════════════════════════════════════════╝

FOLIO: V-${Date.now().toString().slice(-6)}
FECHA: ${new Date().toLocaleDateString('es-MX')}
HORA: ${new Date().toLocaleTimeString('es-MX')}

CLIENTE: ${clienteNombre}
RFC CLIENTE: ${rfcCliente}

════════════════════════════════════════════
CANT | PRODUCTO           | P.U.    | IMPORTE
════════════════════════════════════════════`;

    carrito.forEach(item => {
        const cantidad = item.cantidad.toString().padEnd(4);
        const nombre = item.nombre.substring(0, 18).padEnd(18);
        const precio = ('$' + item.precioVenta.toFixed(2)).padStart(7);
        const importe = ('$' + (item.precioVenta * item.cantidad).toFixed(2)).padStart(7);
        comprobante += `\n${cantidad}| ${nombre} | ${precio} | ${importe}`;
    });

    comprobante += `
════════════════════════════════════════════
SUBTOTAL:                          $${subtotal.toFixed(2)}
DESCUENTO (${tipoDescuento === 'porcentaje' ? descuentoInput + '%' : '$' + descuentoInput}):                     -$${descuentoMonto.toFixed(2)}
SUBTOTAL C/DESC:                   $${subtotalDesc.toFixed(2)}
IVA (16%):                         $${iva.toFixed(2)}
════════════════════════════════════════════
TOTAL:                             $${total.toFixed(2)}
════════════════════════════════════════════

MÉTODO DE PAGO: ${metodoPago}`;

    if (metodoPago === 'Efectivo') {
        comprobante += `
MONTO PAGADO:                      $${montoPagado.toFixed(2)}
CAMBIO:                            $${cambio.toFixed(2)}`;
    }

    comprobante += `

NOTAS: ${notas}

════════════════════════════════════════════
¡GRACIAS POR SU COMPRA!
════════════════════════════════════════════`;

    document.getElementById('comprobanteVenta').innerHTML = `
        <div class="comprobante">${comprobante}</div>
        <button class="print-btn" onclick="window.print()">🖨️ Imprimir Comprobante</button>
    `;

    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    closeModal('opcionesVentaModal');
    actualizarTablaProductos();
    guardarDatos();
    mostrarAlerta('Venta procesada correctamente', 'success', 'ventas');
}

function limpiarCarrito() {
    if (confirm('¿Estás seguro de limpiar el carrito?')) {
        carrito = [];
        actualizarCarrito();
        document.getElementById('comprobanteVenta').innerHTML = '';
        mostrarAlerta('Carrito limpiado', 'success', 'ventas');
    }
}

// FACTURAS
function guardarFactura() {
    const campos = [
        document.getElementById('facturaFolio'),
        document.getElementById('facturaCliente'),
        document.getElementById('facturaRFC'),
        document.getElementById('facturaDireccion'),
        document.getElementById('facturaTelefono'),
        document.getElementById('facturaTotal')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const factura = {
        id: Date.now(),
        folio: document.getElementById('facturaFolio').value,
        cliente: document.getElementById('facturaCliente').value,
        rfc: document.getElementById('facturaRFC').value,
        direccion: document.getElementById('facturaDireccion').value,
        telefono: document.getElementById('facturaTelefono').value,
        total: parseFloat(document.getElementById('facturaTotal').value),
        fecha: new Date().toLocaleDateString('es-MX')
    };
    facturas.push(factura);
    guardarDatos();
    actualizarTablaFacturas();
    mostrarAlerta('Factura emitida correctamente', 'success', 'facturas');
    closeModal('facturaModal');
}

function actualizarTablaFacturas() {
    const tbody = document.querySelector('#facturasTable tbody');
    tbody.innerHTML = '';
    if (facturas.length === 0) {
        document.getElementById('noFacturasData').textContent = 'No hay facturas registradas';
    } else {
        document.getElementById('noFacturasData').textContent = '';
        facturas.forEach(f => {
            tbody.innerHTML += `<tr>
                <td>${f.folio}</td>
                <td>${f.cliente}</td>
                <td>${f.rfc}</td>
                <td>${f.fecha}</td>
                <td>$${f.total.toFixed(2)}</td>
                <td>
                    <button class="btn-edit" onclick="imprimirFactura(${f.id})">Imprimir</button>
                    <button class="btn-delete" onclick="eliminarFactura(${f.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
}

function imprimirFactura(id) {
    const factura = facturas.find(f => f.id === id);
    if (factura) {
        const contenido = `
╔════════════════════════════════════════════╗
║         FACTURA ELECTRÓNICA                ║
║      EL GALLO FERRETERÍA S.A. DE C.V.      ║
║      RFC: MTI1234567890                    ║
║      Salinas Victoría N.L.                 ║
╚════════════════════════════════════════════╝

FOLIO: ${factura.folio}
FECHA: ${factura.fecha}

CLIENTE: ${factura.cliente}
RFC CLIENTE: ${factura.rfc}
DIRECCIÓN: ${factura.direccion}
TELÉFONO: ${factura.telefono}

════════════════════════════════════════════
TOTAL: $${factura.total.toFixed(2)}
════════════════════════════════════════════

¡GRACIAS POR SU COMPRA!`;
        const ventana = window.open();
        ventana.document.write('<pre>' + contenido + '</pre>');
        ventana.print();
    }
}

function eliminarFactura(id) {
    if (confirm('¿Estás seguro?')) {
        facturas = facturas.filter(f => f.id !== id);
        guardarDatos();
        actualizarTablaFacturas();
        mostrarAlerta('Factura eliminada correctamente', 'success', 'facturas');
    }
}

// USUARIOS
function guardarUsuario() {
    const campos = [
        document.getElementById('usuarioNombre'),
        document.getElementById('usuarioEmail'),
        document.getElementById('usuarioPassword')
    ];

    if (!validarCamposRequeridos(campos)) return;

    const usuario = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('usuarioNombre').value,
        email: document.getElementById('usuarioEmail').value,
        password: document.getElementById('usuarioPassword').value,
        permisos: Array.from(document.querySelectorAll('#usuarioModal input[type="checkbox"]:checked')).map(c => c.value),
        estado: 'Activo'
    };

    if (editandoId) {
        usuarios = usuarios.map(u => u.id === editandoId ? usuario : u);
        mostrarAlerta('Usuario actualizado correctamente', 'success', 'usuarios');
    } else {
        usuarios.push(usuario);
        mostrarAlerta('Usuario agregado correctamente', 'success', 'usuarios');
    }

    guardarDatos();
    actualizarTablaUsuarios();
    closeModal('usuarioModal');
}

function actualizarTablaUsuarios() {
    const tbody = document.querySelector('#usuariosTable tbody');
    tbody.innerHTML = '';
    if (usuarios.length === 0) {
        document.getElementById('noUsuariosData').textContent = 'No hay usuarios registrados';
    } else {
        document.getElementById('noUsuariosData').textContent = '';
        usuarios.forEach(u => {
            tbody.innerHTML += `<tr>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${u.permisos.join(', ')}</td>
                <td>${u.estado}</td>
                <td>
                    <button class="btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
}

function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        document.getElementById('usuarioNombre').value = usuario.nombre;
        document.getElementById('usuarioEmail').value = usuario.email;
        document.getElementById('usuarioPassword').value = usuario.password;
        document.querySelectorAll('#usuarioModal input[type="checkbox"]').forEach(c => {
            c.checked = usuario.permisos.includes(c.value);
        });
        editandoId = id;
        editandoTipo = 'usuario';
        openModal('usuarioModal');
    }
}

function eliminarUsuario(id) {
    if (confirm('¿Estás seguro?')) {
        usuarios = usuarios.filter(u => u.id !== id);
        guardarDatos();
        actualizarTablaUsuarios();
        mostrarAlerta('Usuario eliminado correctamente', 'success', 'usuarios');
    }
}

// CARGAR DATOS
function cargarDatos() {
    actualizarTablaClientes();
    actualizarTablaProveedores();
    actualizarTablaPersonal();
    actualizarTablaCategorias();
    actualizarSelectProductos();
    actualizarTablaProductos();
    actualizarTablaInventario();
    actualizarTablaFacturas();
    actualizarTablaUsuarios();
    mostrarAlertasStock();
}

function mostrarAlertasStock() {
    const alertas = productos.filter(p => p.stock <= 10);
    const div = document.getElementById('stockAlerts');
    if (alertas.length > 0) {
        div.innerHTML = '<div class="stock-alert"><strong>⚠️ Alertas de Stock Bajo:</strong><br>' + alertas.map(p => `${p.nombre}: ${p.stock} unidades`).join('<br>') + '</div>';
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('descuentoVenta').addEventListener('change', calcularTotales);
    document.getElementById('montoPagado').addEventListener('change', () => {
        const montoPagado = parseFloat(document.getElementById('montoPagado').value) || 0;
        const total = parseFloat(document.getElementById('total').textContent.replace('$', ''));
        const cambio = montoPagado - total;
        document.getElementById('cambio').value = cambio.toFixed(2);
    });
    document.querySelectorAll('input[name="tipoDescuento"]').forEach(r => r.addEventListener('change', calcularTotales));
    document.getElementById('metodoPago').addEventListener('change', calcularTotales);
});
