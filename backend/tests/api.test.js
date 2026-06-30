const request = require("supertest");
const app = require("../server");

// =========================================================
// Tests del Backend - Innovatech Chile
// Estos tests validan los endpoints básicos sin depender
// de una base de datos real (mockean el comportamiento)
// =========================================================

describe("Endpoint de salud", () => {
  test("GET /api/health debe responder 200 con status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("message");
  });
});

describe("Validación de payload en POST /api/productos", () => {
  test("Debe rechazar producto sin nombre con 400", async () => {
    const res = await request(app)
      .post("/api/productos")
      .send({ precio: 1000, stock: 5 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Debe rechazar producto sin precio con 400", async () => {
    const res = await request(app)
      .post("/api/productos")
      .send({ nombre: "Test", stock: 5 });
    expect(res.statusCode).toBe(400);
  });

  test("Debe rechazar producto sin stock con 400", async () => {
    const res = await request(app)
      .post("/api/productos")
      .send({ nombre: "Test", precio: 1000 });
    expect(res.statusCode).toBe(400);
  });
});

describe("Validación de payload en PUT /api/productos/:id", () => {
  test("Debe rechazar update sin nombre con 400", async () => {
    const res = await request(app)
      .put("/api/productos/1")
      .send({ precio: 1000, stock: 5 });
    expect(res.statusCode).toBe(400);
  });
});

describe("Estructura de respuesta del health check", () => {
  test("La respuesta debe ser JSON válido", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});
