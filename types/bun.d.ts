// bun.d.ts
declare module "bun" {
  interface Request {
    ip?: string;
  }
}
