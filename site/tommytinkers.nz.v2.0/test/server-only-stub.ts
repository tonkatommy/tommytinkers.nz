// The real "server-only" package throws when imported outside a Next server
// build, which is its job. Database tests run in plain Node, so the test
// config points "server-only" at this empty file instead.
export {};
