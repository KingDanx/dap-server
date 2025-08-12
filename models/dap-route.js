export default class dapRoute {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.routes = {};
  }

  async runMiddleware(req, middleware, index = 0) {
    if (index >= middleware.length) throw new Error("No final handler found");
  
    const fn = middleware[index];
  
    //? Call middleware with (req, next)
    return await fn(req, () => this.runMiddleware(req, middleware, index + 1));
  }

  get(url, ...middleware) {
    const route = this.baseUrl + url;
  
    this.routes[route] = {
      GET: async (req) => {
        return this.runMiddleware(req, middleware);
      }
    };
  }

  post(url, ...middleware) {}

  put(url, ...midleware) {}

  delete(url, ...middleware) {}
}
