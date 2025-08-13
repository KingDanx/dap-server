# DAP Server

A fast, middleware-driven HTTP server built on top of **Bun.serve**. DAP Server provides a tiny routing layer with an Express-like middleware pattern `(req, next)` while embracing Bun’s native `Response` return model for speed.

> Requires **Bun v1.2.3+** for the `routes` option in `Bun.serve`.

---

## Features

- **Lightweight routing** for `GET`, `POST`, `PUT`, `DELETE`, `HEAD`, and `OPTIONS`.
- **Express-style middleware** `(req, next)` with async support and short-circuiting.
- **Sub-routers** via `Route(baseUrl)` and `Server.use(route)`.
- **Global middleware** via `Server.use(fn)` applied to every route.
- **Dynamic static mounts** via `Server.static(path, filePath)` (module default export must be a handler object compatible with Bun’s `routes` map).
- **Automatic client IP** assignment with `req.ip` using `server.requestIP(req)` (handles IPv4-mapped IPv6).
- **Hot route updates**: adding routes after `listen()` triggers a graceful server **restart** under the hood.

---

## Project Structure (suggested)

```
.
├─ src/
│  ├─ dap-route.js      # Route class: defines routes + middleware chaining
│  └─ dap-server.js     # Server class: wraps Bun.serve, manages routes, restart
├─ test/
│  ├─ middleware/       # Test middleware
│  ├─ routes/           # Test route modules
│  └─ dap-serve.test.js # Bun tests for server/route behavior
└─ README.md
```

> Your repository may vary slightly; this README focuses on the public API and usage patterns extracted from the code you shared in chat.

---

## Quick Start

### 1) Install & run

```bash
# Requires Bun: https://bun.sh
bun --version
```

```bash
npm install @kingdanx/dap-server
```

Create a server:

```js
// server.js
import Server from "./src/dap-server.js";
import api from "./src/routes/api.js"; // a Route instance (see below)

const app = new Server();

// Mount a sub-router (Route)
await app.use(api);

// Optionally: global middleware (runs before all Route-level handlers)
await app.use(async (req, next) => {
  // e.g., add timing, auth, or headers here
  return next();
});

app.listen(3000, () => {
  console.log("DAP Server listening on http://localhost:3000");
});
```

Run it:

```bash
bun run server.js
```

---

## Defining Routes

Create a `Route` with a base URL and register handlers. Handlers and middleware **must return a `Response`** (or a `Promise<Response>`).

```js
// src/routes/api.js
import Route from "../dap-route.js";

const api = new Route("/api");

api.get("/hello", async (req) => {
  return Response.json({ message: "Hello, World!" });
});

api.post("/echo", async (req) => {
  const data = await req.json().catch(() => ({}));
  return Response.json({ received: data });
});

// Optional: explicit OPTIONS (useful for custom CORS)
api.options("/hello", async () => new Response(null, { status: 204 }));

export default api;
```

> Handlers are wired into Bun via `Server.listen()` using the `routes` map under the hood.

---

## Middleware

### Signature

```js
/**
 * @callback Middleware
 * @param {Request} req
 * @param {Function} next
 * @returns {Response|Promise<Response>}
 */
```

### Global Middleware

Add middleware at the **Server** level using `server.use(fn)` (before or after mounting routes). When adding after `listen()`, the server restarts gracefully to apply changes.

```js
await app.use(async (req, next) => {
  // Example: simple logger
  console.log(`${req.method} ${new URL(req.url).pathname}`);
  const res = await next();
  return res; // pass-through
});
```

### Route-level Middleware

Route methods accept one or more middleware followed by a final handler (also a middleware by signature). The **last** function should produce the `Response`.

```js
const addHeader = async (req, next) => {
  const res = await next();
  res.headers.set("X-Custom", "true");
  return res;
};

api.get("/with-header", addHeader, async (req) => {
  return new Response("ok");
});
```

`Route.addMiddleware(fn)` prepends a middleware to the Route’s internal chain (used by `Server.use(fn)` to broadcast global middleware to all mounted routes).

---

## Request IP

`Route#setRequestIp(req)` attaches `req.ip` using Bun’s `server.requestIP(req)`. It also strips the IPv4-mapped IPv6 prefix (`::ffff:`) when present, so you’ll see `"127.0.0.1"` instead of `"::ffff:127.0.0.1"`.

```js
api.get("/ip", (req) => {
  // req.ip is set automatically before your handler runs
  return Response.json({ ip: req.ip || null });
});
```

---

## Static Mounts

Use `Server.static(path, filePath)` to mount a module’s default export at a path. The module should export a routes object compatible with Bun’s `routes` shape (e.g., `{ GET, POST, ... }`).

```js
// mounts the module’s default export at "/favicon.ico", etc.
await app.static("/favicon.ico", "./src/static/favicon.js");
```

> `static()` is `async` because it uses dynamic `import()` and then restarts the server to apply changes.

---

## CORS & OPTIONS

Bun will only respond to `OPTIONS` automatically when the matching path exists in `routes`. If you need custom CORS headers, define an explicit `OPTIONS` handler:

```js
api.options("/hello", () =>
  new Response(null, {
    status: 204,
    headers: {
      "Allow": "GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  })
);
```

Make sure you register all methods for the **exact route key** you intend to serve (`/path` vs `/path/`).

---

## Testing

This project is set up to use **Bun’s test runner** (`bun:test`). Place tests in `test/` and run:

```bash
bun test
```

### What to test

- **HTTP methods**: GET/POST/PUT/DELETE/HEAD/OPTIONS return expected status and body.
- **Middleware order**: state changes before/after `next()`, header mutations, short-circuiting.
- **404 behavior**: unknown routes return 404.
- **CORS**: explicit `OPTIONS` returns expected headers.
- **IP detection**: `req.ip` is set (and IPv4-mapped IPv6 is normalized).

Example (snippet):

```js
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import Server from "../src/dap-server.js";
import api from "./routes/sample-route.js";

let app;
const port = 3456;

beforeAll(async () => {
  app = new Server();
  await app.use(api);
  await new Promise((resolve) => app.listen(port, resolve));
});

afterAll(async () => {
  if (app.server) await app.server.stop(true);
});

describe("GET /api/hello", () => {
  it("returns hello json", async () => {
    const res = await fetch(`http://localhost:${port}/api/hello`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "Hello, World!" });
  });
});
```

---

## API (Summary)

### `class Server extends Route`

- **Properties**
  - `routes: Record<string, object>` – Bun routes map.
  - `serverRoutes: Map<string, Route>` – Mounted Route instances keyed by `baseUrl`.
  - `server: import("bun").Server | null` – Active Bun server.
  - `middleware: Middleware[]` – Global middleware.

- **Methods**
  - `async use(handler: Route | Middleware)` – Mount a Route or register global middleware. Triggers restart when needed.
  - `async static(path: string, filePath: string)` – Dynamically import a module and mount its default export at `path`. Restarts server.
  - `listen(port: number|string, fn?: Function)` – Start Bun.serve with the current `routes` map.
  - `async restart()` – Stop and re-listen on the same port if running.

### `class Route`

- **Constructor**: `new Route(baseUrl = "")`
- **Methods**
  - `setServer(server)` – Called by `Server.listen()` to enable IP detection.
  - `setRequestIp(req)` – Attaches `req.ip` (handles IPv4-mapped IPv6).
  - `addMiddleware(fn)` – Prepend route-level middleware.
  - `runMiddleware(req, middleware, index = 0)` – Internal recursive executor.
  - `get/post/put/delete/head/options(url, ...middleware)` – Register route handlers. Each method merges into `this.routes[route]` so multiple methods can coexist under the same path.

---

## Notes & Tips

- When adding new routes **after** `listen()`, the server will restart internally; consider batching registrations before `listen()` for best startup behavior.
- Paths must match **exactly** in Bun’s routing map (watch out for trailing slashes).
- The final handler in a middleware chain **must return a `Response`**.

---

## License

MIT © KingDanx
