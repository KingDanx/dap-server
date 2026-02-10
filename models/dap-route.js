/**
 * Callback type for middleware functions.
 * @callback Middleware
 * @param {import("bun").BunRequest & { ip?: string }} req - The incoming request object.
 * @param {Function} next - Function to call the next middleware.
 * @returns {Promise<Response>|Response} The response, or a promise resolving to it.
 */

export default class Route {
  constructor(baseUrl = "") {
    /** @type {string} */
    this.baseUrl = baseUrl;

    /** @type {Object.<string, Object>} */
    this.routes = {};

    /** @type {Middleware[]} */
    this.middleware = [];

    /** @type {import("bun").Server|null} */
    this.server = null;

    /**
     * Prefix to all routes
     * @type {string}
     */
    this.serverBase = "";
  }

  setServer(server) {
    this.server = server;
  }

  /**
   *
   * @param {string} base - prefix to all non static routes
   */
  setServerBase(prefix) {
    this.serverBase = prefix;
  }

  setRequestIp(req) {
    if (this.server) {
      const { address } = this.server.requestIP(req);
      req.ip = address.replace("::ffff:", "");
    }
  }

  /**
   * @param {Middleware} handler
   */
  addMiddleware(handler) {
    this.middleware = [handler, ...this.middleware];
  }

  /**
   * @param {import("bun").BunRequest} req
   * @param {Middleware[]} middleware
   * @param {number} [index=0]
   * @returns {Promise<Response>}
   */
  async runMiddleware(req, middleware, index = 0) {
    if (index >= middleware.length) throw new Error("No final handler found");
    const fn = middleware[index];
    return await fn(req, () => this.runMiddleware(req, middleware, index + 1));
  }

  /**
   * @param {string} url
   * @param  {...Middleware} middleware
   */
  get(url, ...middleware) {
    if (
      (url === "/" && this.baseUrl !== "") ||
      (url === "/" && this.serverBase !== "")
    ) {
      url = "";
    }
    const route = this.serverBase + this.baseUrl + url;

    let currentRoutes = {};

    if (this.routes[route]) {
      currentRoutes = this.routes[route];
    }

    /** @type {import("bun").RouteHandler} */
    this.routes[route] = {
      ...currentRoutes,
      GET: /** @type {Middleware} */ (
        async (req) => {
          this.setRequestIp(req);
          return this.runMiddleware(req, [...this.middleware, ...middleware]);
        }
      ),
    };
  }

  /**
   * @param {string} url
   * @param  {...Middleware} middleware
   */
  post(url, ...middleware) {
    if (
      (url === "/" && this.baseUrl !== "") ||
      (url === "/" && this.serverBase !== "")
    ) {
      url = "";
    }
    const route = this.serverBase + this.baseUrl + url;

    let currentRoutes = {};

    if (this.routes[route]) {
      currentRoutes = this.routes[route];
    }

    this.routes[route] = {
      ...currentRoutes,
      POST: /** @type {Middleware} */ (
        async (req) => {
          this.setRequestIp(req);
          return this.runMiddleware(req, [...this.middleware, ...middleware]);
        }
      ),
    };
  }

  /**
   * @param {string} url
   * @param  {...Middleware} middleware
   */
  put(url, ...middleware) {
    if (
      (url === "/" && this.baseUrl !== "") ||
      (url === "/" && this.serverBase !== "")
    ) {
      url = "";
    }
    const route = this.serverBase + this.baseUrl + url;

    let currentRoutes = {};

    if (this.routes[route]) {
      currentRoutes = this.routes[route];
    }

    this.routes[route] = {
      ...currentRoutes,
      PUT: /** @type {Middleware} */ (
        async (req) => {
          this.setRequestIp(req);
          return this.runMiddleware(req, [...this.middleware, ...middleware]);
        }
      ),
    };
  }

  /**
   * @param {string} url
   * @param  {...Middleware} middleware
   */
  delete(url, ...middleware) {
    if (
      (url === "/" && this.baseUrl !== "") ||
      (url === "/" && this.serverBase !== "")
    ) {
      url = "";
    }
    const route = this.serverBase + this.baseUrl + url;

    let currentRoutes = {};

    if (this.routes[route]) {
      currentRoutes = this.routes[route];
    }

    this.routes[route] = {
      ...currentRoutes,
      DELETE: /** @type {Middleware} */ (
        async (req) => {
          this.setRequestIp(req);
          return this.runMiddleware(req, [...this.middleware, ...middleware]);
        }
      ),
    };
  }

  /**
   * @param {string} url
   * @param  {...Middleware} middleware
   */
  head(url, ...middleware) {
    if (
      (url === "/" && this.baseUrl !== "") ||
      (url === "/" && this.serverBase !== "")
    ) {
      url = "";
    }
    const route = this.serverBase + this.baseUrl + url;

    let currentRoutes = {};

    if (this.routes[route]) {
      currentRoutes = this.routes[route];
    }

    this.routes[route] = {
      ...currentRoutes,
      HEAD: /** @type {Middleware} */ (
        async (req) => {
          this.setRequestIp(req);
          return this.runMiddleware(req, [...this.middleware, ...middleware]);
        }
      ),
    };
  }

  /**
   * @param {string} url
   * @param  {...Middleware} middleware
   */
  options(url, ...middleware) {
    if (
      (url === "/" && this.baseUrl !== "") ||
      (url === "/" && this.serverBase !== "")
    ) {
      url = "";
    }
    const route = this.serverBase + this.baseUrl + url;

    let currentRoutes = {};

    if (this.routes[route]) {
      currentRoutes = this.routes[route];
    }

    this.routes[route] = {
      ...currentRoutes,
      OPTIONS: /** @type {Middleware} */ (
        async (req) => {
          this.setRequestIp(req);
          return this.runMiddleware(req, [...this.middleware, ...middleware]);
        }
      ),
    };
  }
}
