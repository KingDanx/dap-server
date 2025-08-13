import Route from "../../models/dap-route";

const dogs = new Route("/dogs");

dogs.get("/", () => Response("dogs"));

dogs.post("/", () => Response("post dogs"));

dogs.get("/walk", (req) => {
  console.log(req);
  return Response.json({ dog: "jade", ...req });
});

export default dogs;
