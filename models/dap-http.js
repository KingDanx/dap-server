export default class dapHTTP {
  constructor(port) {
    this.port = port;
  }

  listen(port, fn) {
    Bun.serve({
      port: port || this.port
    })
  }
}
