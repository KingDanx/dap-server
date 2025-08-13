import { Server } from "../index";
import dogs from "./routes/dogs";
import cats from "./routes/cats";
import { addCat, addDog } from "./middleware/middleware";
import path from "path";

const server = new Server();

server.use(dogs);
server.use(cats);
server.get("/", () => Response("ok"));
server.get("/param/:id", (req) => {
  const { id } = req.params;
  return Response.json({ id, ...req });
});
server.delete("/", (req) => Response.json(req));
server.head("/", () => Response());
server.options("/", () => Response());
server.use(addCat);
server.use(addDog);

await server.static("/html", path.join(import.meta.dirname, "test.html"));

server.listen(3000, () => console.log("the server has started"));

console.log(server);
