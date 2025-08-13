import Route from "./dap-route.js";

export default class Server extends Route {
  constructor({} = {}) {
    super();
    this.routes = {};
    this.server = null;
  }

  /**
   *
   * @param {Route} route
   */
  async use(route) {
    Object.assign(this.routes, route.routes);
    await this.restart();
  }

  async static(path, filePath) {
    const staticFile = await import(filePath);
    this.routes[path] = staticFile.default;
    await this.restart();
  }

  listen(port, fn = () => null) {
    this.server = Bun.serve({
      port: port,
      routes: this.routes,

      fetch(req) {
        return new Response("Not Found", { status: 404 });
      },
    });
    fn();
  }

  async restart() {
    if (this.server) {
      await this.server.stop(true);
      this.listen(this.server.port);
    }
  }
}
