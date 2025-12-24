{
  mkShellNoCC,

  # extra tooling
  esbuild,
  nodejs,
  typescript,

  callPackage,
}:
let
  defaultPackage = callPackage ./default.nix { };
in
mkShellNoCC {
  inputsFrom = [ defaultPackage ];

  packages = [
    esbuild
    nodejs
    typescript
  ];
}
