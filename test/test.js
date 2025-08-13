import Server from "../models/dap-server";
import Route from "../models/dap-route";
import path from "path";

const server = new Server();

const dogs = new Route("/dogs");

const middleware = async (req, next) => {
  console.log(req);
  req.cat = "heart";
  return Response.json({ error: "Not Authorized" }, { status: 401 });
};

server.get("/", () => Response("ok"));
server.get("/param/:id", (req) => {
  const { id } = req.params;
  return Response(id);
});
dogs.get("/", () => Response("dogs"));
await server.static("/html", path.join(import.meta.dirname, "test.html"));

server.listen(3000, () => console.log("ther server has started", server));
await server.use(dogs);

// dogs.get("/walk", middleware, (req) => {
//   console.log(req);
//   return Response.json({ dog: "jade", cat: req.cat });
// });

// console.log(dogs.routes["/dogs/walk"]);

// const res = await dogs.routes["/dogs/walk"].GET(
//   new Request("http://localhost:3000/dogs/walk")
// );

// console.log(res);
