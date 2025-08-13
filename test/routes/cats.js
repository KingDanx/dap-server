import Route from "../../models/dap-route";

const cats = new Route("/cats");

cats.get("/", () => Response("cats"));

cats.get("/walk", (req) => {
  console.log(req);
  return Response.json({ cat: "marshmallow", requestDenied: true, ...req });
});

export default cats;
