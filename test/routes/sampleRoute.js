import Route from "../../models/dap-route.js";
import { logger, addCustomHeader } from "../middleware/middleware.js";

const route = new Route("/api");

route.get("/hello", logger, addCustomHeader, async (req) => {
  return new Response("Hello World", { status: 200 });
});

route.get("/bye", logger, addCustomHeader, async (req) => {
  return new Response("Bye World", { status: 200 });
});

route.options("/hello", () => {
  return new Response(null, { status: 204 });
});

route.post("/echo", async (req) => {
  const data = await req.json();
  return new Response(JSON.stringify({ received: data }), {
    headers: { "Content-Type": "application/json" },
  });
});

export default route;
