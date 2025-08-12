import dapHTTP from "../models/dap-http";
import dapRoute from "../models/dap-route";
const server = new dapHTTP();

const dogs = new dapRoute("/dogs");

const middleware = async (req, next) => {
    console.log(req);
    req.cat = "heart";
    return await next();
}

dogs.get("/walk", middleware, req => {
    console.log(req);
    return Response.json({ dog: "jade", cat: req.cat});
});

console.log(dogs.routes["/dogs/walk"])

const res = await dogs.routes["/dogs/walk"].GET(new Request("http://localhost:3000/dogs/walk"));


console.log(await res.json())