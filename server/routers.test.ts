import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock del contexto de usuario autenticado
function createAuthContext() {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("appRouter - Clientes", () => {
  it("should list clientes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Esta prueba verifica que el procedimiento se ejecuta sin errores
    const result = await caller.clientes.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get cliente by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Prueba con un ID que probablemente no existe
    const result = await caller.clientes.getById(9999);
    expect(result).toBeNull();
  });
});

describe("appRouter - Proveedores", () => {
  it("should list proveedores", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.proveedores.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("appRouter - Personal", () => {
  it("should list personal", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.personal.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("appRouter - Categorías", () => {
  it("should list categorias", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categorias.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("appRouter - Productos", () => {
  it("should list productos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.productos.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get producto by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.productos.getById(9999);
    expect(result).toBeNull();
  });
});

describe("appRouter - Inventario", () => {
  it("should list inventario", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.inventario.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get inventario by producto", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.inventario.getByProducto(9999);
    expect(result).toBeNull();
  });
});

describe("appRouter - Ventas", () => {
  it("should list ventas", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ventas.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get venta by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ventas.getById(9999);
    expect(result).toBeNull();
  });
});

describe("appRouter - Dashboard", () => {
  it("should get movimientos del dia", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getMovimientosDelDia();
    expect(result).toHaveProperty("ventasDelDia");
    expect(result).toHaveProperty("totalVentas");
    expect(result).toHaveProperty("ventasHoy");
    expect(typeof result.ventasDelDia).toBe("number");
    expect(typeof result.totalVentas).toBe("number");
    expect(Array.isArray(result.ventasHoy)).toBe(true);
  });
});

describe("appRouter - Auth", () => {
  it("should get current user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toEqual(ctx.user);
  });

  it("should logout user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
