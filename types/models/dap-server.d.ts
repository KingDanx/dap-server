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
    constructor({ bunServerOptions }?: {
        bunServerOptions?: Bun.Serve.Options<T, R> | undefined;
    });
    /**
     * Map of path strings to Route instances (preserves insertion order and allows complex keys).
     * @type {Map<string, Route>}
     * @private
     */
    private serverRoutes;
    /**
     * Configuration options for Bun.serve().
     * @type {import("bun").Serve.Options<T, R>}
     */
    bunServerOptions: import("bun").Serve.Options<T, R>;
    /**
     * Enable websockets
     * @type {boolean}
     */
    websockets: boolean;
    /**
     * Adds a middleware function or a Route instance to the server.
     * @param {Route|Function} handler - A Route object or a middleware function.
     * @returns {Promise<void>}
     */
    use(handler: Route | Function): Promise<void>;
    /**
     * Serves a static file at a given path.
     * @param {string} path - The URL path where the static file should be served.
     * @param {string} filePath - The filesystem path to the file to import and serve.
     * @returns {Promise<void>}
     */
    static(path: string, filePath: string): Promise<void>;
    /**
     * Starts the server on the specified port.
     * @param {string|number} port - Port number to listen on.
     * @param {Function} [fn=() => null] - Optional callback after the server starts.
     */
    listen(port: string | number, fn?: Function): void;
    /**
     * Restarts the server, stopping it first if already running.
     * @returns {Promise<void>}
     */
    restart(): Promise<void>;
}
import Route from "./dap-route.js";
