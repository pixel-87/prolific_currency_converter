{
  description = "NodeJS Project Template";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system: function nixpkgs.legacyPackages.${system}
        );
    in
    {
      packages = forAllSystems (pkgs: let
        firefoxPkg = pkgs.callPackage ./default.nix { 
          manifestFile = ./manifest.json;
          archiveName = "prolific-firefox.xpi";
        };
        chromePkg = pkgs.callPackage ./default.nix { 
          manifestFile = ./manifest.chrome.json;
          archiveName = "prolific-chrome.zip";
        };
      in {
        firefox = firefoxPkg;
        chrome = chromePkg;
        default = firefoxPkg;
      });

      devShells = forAllSystems (pkgs: {
        default = pkgs.callPackage ./shell.nix { };
      });

      overlays.default = final: _: {
        firefox = final.callPackage ./default.nix { 
          manifestFile = ./manifest.json;
          archiveName = "prolific-firefox.xpi";
        };
        chrome = final.callPackage ./default.nix { 
          manifestFile = ./manifest.chrome.json;
          archiveName = "prolific-chrome.zip";
        };
      };
    };
}
