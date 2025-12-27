{ lib, buildNpmPackage, manifestFile ? ./manifest.json, archiveName ? "prolific-extension.zip", zip }:
buildNpmPackage {
  pname = "prolific_currency_converter";
  version = "0.1.1";

  src = ./.;

  npmDepsHash = "sha256-3m3mGeHSi19xsjWymZnrBHEFF1qUoQwR4SvpWcT6vT4=";

  nativeBuildInputs = [ zip ];

  npmBuildPhase = ''
    export MANIFEST_PATH=${manifestFile}
    npm run build
  '';

  installPhase = ''
    mkdir -p $out/extension
    cp -r dist/* $out/extension/
    
    # Create archive for distribution
    cd $out/extension
    zip -r $out/${archiveName} .
    cd -
  '';

  meta = {
    description = "A browser extension for prolific to convert currencies";
    homepage = "https://github.com/pixel-87/prolific_currency_converter";
    license = lib.licenses.gpl3Plus;
    maintainers = with lib.maintainers; [ ];
  };
}
