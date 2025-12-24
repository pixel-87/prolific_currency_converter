{ lib, buildNpmPackage }:
buildNpmPackage {
  pname = "prolific_currency_converter";
  version = "0.1.0";

  src = ./.;

  npmDepsHash = lib.fakeHash;

  installPhase = ''
    mkdir -p $out/extension
    cp -r dist/* $out/extension/
  '';

  meta = {
    description = "A browser extension for prolific to convert currencies";
    homepage = "https://github.com/pixel-87/prolific_currency_converter";
    license = lib.licenses.mit;
    maintainers = with lib.maintainers; [ ];
  };
}
