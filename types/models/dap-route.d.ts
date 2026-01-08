/**
 * Callback type for middleware functions.
 * @callback Middleware
 * @param {Request} req - The incoming request object.
 * @param {Function} next - Function to call the next middleware.
 * @returns {Promise<Response>|Response} The response, or a promise resolving to it.
 */
export default class Route {
    constructor(baseUrl?: string);
    /** @type {string} */
    baseUrl: string;
    /** @type {Object.<string, Object>} */
    routes: {
        [x: string]: Object;
    };
    /** @type {Middleware[]} */
    middleware: Middleware[];
    /** @type {import("bun").Server|null} */
    server: import("bun").Server | null;
    setServer(server: any): void;
    setRequestIp(req: any): void;
    /**
     * @param {Middleware} handler
     */
    addMiddleware(handler: Middleware): void;
    /**
     * @param {import("bun").BunRequest} req
     * @param {Middleware[]} middleware
     * @param {number} [index=0]
     * @returns {Promise<Response>}
     */
    runMiddleware(req: import("bun").BunRequest, middleware: Middleware[], index?: number): Promise<Response>;
    /**
     * @param {string} url
     * @param  {...Middleware} middleware
     */
    get(url: string, ...middleware: Middleware[]): void;
    /**
     * @param {string} url
     * @param  {...Middleware} middleware
     */
    post(url: string, ...middleware: Middleware[]): void;
    /**
     * @param {string} url
     * @param  {...Middleware} middleware
     */
    put(url: string, ...middleware: Middleware[]): void;
    /**
     * @param {string} url
     * @param  {...Middleware} middleware
     */
    delete(url: string, ...middleware: Middleware[]): void;
    /**
     * @param {string} url
     * @param  {...Middleware} middleware
     */
    head(url: string, ...middleware: Middleware[]): void;
    /**
     * @param {string} url
     * @param  {...Middleware} middleware
     */
    options(url: string, ...middleware: Middleware[]): void;
}
/**
 * Callback type for middleware functions.
 */
export type Middleware = (req: Request, next: Function) => Promise<Response> | Response;
