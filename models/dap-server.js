import Route from "./dap-route.js";

/**
 * Server class extending Route to handle routes, middleware, and static files using Bun.
 * @extends Route
 */
export default class Server extends Route {
  /**
   * Creates a new Server instance.
   *
   * @constructor
   * @param {Object} [options={}] - Configuration options for the server.
   * @param {import("bun").Serve.Options<T, R>} [options.bunServerOptions={}] - Options passed directly to Bun.serve().
   *   See: https://bun.sh/docs/api/http#bun-serve
   */
  constructor({ bunServerOptions = {} } = {}) {
    super();

    /**
     * Registered routes by path (for quick lookup).
     * @type {Object.<string, any>}
     * @private
     */
    this.routes = {};

    /**
     * Map of path strings to Route instances (preserves insertion order and allows complex keys).
     * @type {Map<string, Route>}
     * @private
     */
    this.serverRoutes = new Map();

    /**
     * The underlying Bun HTTP server instance, or null if not started.
     * @type {import("bun").Server | null}
     * @readonly
     */
    this.server = null;

    /**
     * Array of global middleware functions to execute before route handlers.
     * @type {Function[]}
     * @private
     */
    this.middleware = [];

    /**
     * Configuration options for Bun.serve().
     * @type {import("bun").Serve.Options<T, R>}
     */
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

      fetch() {
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
