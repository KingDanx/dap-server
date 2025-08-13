import Route from "./dap-route.js";

/**
 * Server class extending Route to handle routes, middleware, and static files using Bun.
 * @extends Route
 */
export default class Server extends Route {
  /**
   * Creates a new Server instance.
   * @param {Object} [options={}] - Configuration options (currently unused).
   */
  constructor({ bunServerOptions = {} } = {}) {
    super();
    /** @type {Object.<string, any>} */
    this.routes = {};
    /** @type {Map<string, Route>} */
    this.serverRoutes = new Map();
    /** @type {import("bun").Server|null} */
    this.server = null;
    /** @type {Function[]} */
    this.middleware = [];
    /** @type {Object.<string, any>} */
    this.bunServerOptions = bunServerOptions;
  }

  /**
   * Adds a middleware function or a Route instance to the server.
   * @param {Route|Function} handler - A Route object or a middleware function.
   * @returns {Promise<void>}
   */
  async use(handler) {
    if (typeof handler === "function") {
      this.middleware.push(handler);
      this.serverRoutes.forEach((route) => {
        route.addMiddleware(handler);
      });
      return;
    }
    Object.assign(this.routes, handler.routes);
    this.serverRoutes.set(handler.baseUrl, handler);
    await this.restart();
  }

  /**
   * Serves a static file at a given path.
   * @param {string} path - The URL path where the static file should be served.
   * @param {string} filePath - The filesystem path to the file to import and serve.
   * @returns {Promise<void>}
   */
  async static(path, filePath) {
    const staticFile = await import(filePath);
    this.routes[path] = staticFile.default;
    await this.restart();
  }

  /**
   * Starts the server on the specified port.
   * @param {string|number} port - Port number to listen on.
   * @param {Function} [fn=() => null] - Optional callback after the server starts.
   */
  listen(port, fn = () => null) {
    this.server = Bun.serve({
      port: port,
      ...this.bunServerOptions,
      routes: this.routes,

      fetch(req) {
        return new Response("Not Found", { status: 404 });
      },
    });
    this.serverRoutes.forEach((route) => route.setServer(this.server));
    fn();
  }

  /**
   * Restarts the server, stopping it first if already running.
   * @returns {Promise<void>}
   */
  async restart() {
    if (this.server) {
      await this.server.stop(true);
      this.listen(this.server.port);
    }
  }
}
