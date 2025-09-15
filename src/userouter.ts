import type { Component } from "ripple";

// -------------------- ROUTER STORE --------------------
class RouterStore {
  $path: string;
  $query: URLSearchParams;
  $params: Record<string, string> = {};

  constructor() {
    this.$path = location.pathname;
    this.$query = new URLSearchParams(location.search);

    window.addEventListener("popstate", () => {
      this.$path = location.pathname;
      this.$query = new URLSearchParams(location.search);
    });
  }

  push(url: string) {
    const [path, search = ""] = url.split("?");
    window.history.pushState({}, "", url);
    this.$path = path;
    this.$query = new URLSearchParams(search);
    window.dispatchEvent(new Event("popstate"));
  }

  replace(url: string) {
    const [path, search = ""] = url.split("?");
    window.history.replaceState({}, "", url);
    this.$path = path;
    this.$query = new URLSearchParams(search);
    window.dispatchEvent(new Event("popstate"));
  }

  // optional: parse dynamic params from path pattern
  matchRoute(pathPattern: string) {
    const patternParts = pathPattern.split("/").filter(Boolean);
    const pathParts = this.$path.split("/").filter(Boolean);

    const params: Record<string, string> = {};
    if (patternParts.length !== pathParts.length) return null;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    this.$params = params;
    return true;
  }
}

export const routerStore = new RouterStore();

// -------------------- useRouter HOOK --------------------
export function useRouter() {
  // just return the store itself; reactive reads happen in components
  return {
    get path() {
      return routerStore.$path;
    },
    get query() {
      return routerStore.$query;
    },
    get params() {
      return routerStore.$params;
    },
    push: (url: string) => routerStore.push(url),
    replace: (url: string) => routerStore.replace(url),
    match: (pattern: string) => routerStore.matchRoute(pattern),
  };
}
