import type { nProgress } from "nprogress";
declare module "nprogress" {
  interface NProgress extends nProgress {
    setColor: (color: string) => void;
    [key: string]: any;
  }
}