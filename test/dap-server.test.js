import { describe, it, beforeAll, afterAll, expect } from "bun:test";
import { Server } from "../index.js";
import sampleRoute from "./routes/sampleRoute.js";
import { echoJson } from "./middleware/middleware.js";

let server;
let port = 4567;

beforeAll(async () => {
  server = new Server();
  server.use(sampleRoute); // Register routes
  server.post("/test-mw", echoJson); // Standalone route
  await new Promise((resolve) => server.listen(port, resolve));
});

afterAll(async () => {
  if (server.server) {
    await server.server.stop(true);
  }
});

describe("Server & Route functionality", () => {
  it("should return Hello World on GET /api/hello with middleware applied", async () => {
    const res = await fetch(`http://localhost:${port}/api/hello`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello World");
    expect(res.headers.get("X-Custom")).toBe("true");
  });

  it("should return Bye World on GET /api/bye with middleware applied", async () => {
    const res = await fetch(`http://localhost:${port}/api/bye`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Bye World");
    expect(res.headers.get("X-Custom")).toBe("true");
  });

  it("should echo POST body at /api/echo", async () => {
    const payload = { msg: "hi" };
    const res = await fetch(`http://localhost:${port}/api/echo`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: payload });
  });

  it("should handle custom middleware route /test-mw", async () => {
    const res = await fetch(`http://localhost:${port}/test-mw`, {
      method: "POST",
      body: "bun-test",
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.echo).toBe("bun-test");
  });

  it("should return 404 for unknown routes", async () => {
    const res = await fetch(`http://localhost:${port}/not-found`);
    expect(res.status).toBe(404);
  });

  it("should allow OPTIONS requests when defined", async () => {
    const res = await fetch(`http://localhost:${port}/api/hello`, {
      method: "OPTIONS",
    });
    expect(res.status).toBe(204);
  });
});
