// Stubs for Next internal metadata type imports that may not be present
// on some build environments. These allow building when the internal
// JS type files are not resolved.

declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  const value: any;
  export default value;
}

declare module "next/dist/lib/metadata/types/*" {
  const value: any;
  export default value;
}

declare module "next/dist/lib/metadata/*" {
  const value: any;
  export default value;
}
