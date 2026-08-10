export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Firebase Admin is initialized lazily in lib/firebase-admin.ts
    // This file ensures the module is imported on the server at startup.
    await import("./lib/firebase-admin");
  }
}
