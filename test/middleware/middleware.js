/**
 * Callback type for middleware functions.
 * @callback Middleware
 * @param {Request} req - The incoming request object.
 * @param {Function} next - Function to call the next middleware.
 * @returns {Promise<Response>|Response} The response, or a promise resolving to it.
 */

/**
 * @type {Middleware}
 */
export async function addCat(req, next) {
  console.log(req);
  req.cat = "heart";
  return await next();
}

/**
 * @type {Middleware}
 */
export async function addDog(req, next) {
  req.dog = "bones";
  return await next();
}

/**
 * @type {Middleware}
 */
export async function logger(req, next) {
  req.logs = req.logs || [];
  req.logs.push("logger-start");
  const res = await next();
  req.logs.push("logger-end");
  return res;
}

/**
 * @type {Middleware}
 */
export async function addCustomHeader(req, next) {
  const res = await next();
  if (res instanceof Response) {
    res.headers.set("X-Custom", "true");
  }
  return res;
}

/**
 * @type {Middleware}
 */
export async function echoJson(req, next) {
  const body = await req.text();
  return new Response(JSON.stringify({ echo: body }), {
    headers: { "Content-Type": "application/json" },
  });
}
