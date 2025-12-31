{ lib, buildNpmPackage, zip }:
buildNpmPackage {
  pname = "prolific_currency_converter";
  version = (builtins.fromJSON (builtins.readFile ./package.json)).version;

  src = ./.;

  npmDepsHash = "sha256-3m3mGeHSi19xsjWymZnrBHEFF1qUoQwR4SvpWcT6vT4=";

  nativeBuildInputs = [ zip ];

  dontNpmBuild = true;

  buildPhase = ''
    runHook preBuild
    
    # Build Firefox version
    export MANIFEST_PATH=${./manifest.json}
    npm run build
    mv dist firefox-build
    
    # Build Chrome version
    export MANIFEST_PATH=${./manifest.chrome.json}
    npm run build
    mv dist chrome-build
    
    runHook postBuild
  '';

  installPhase = ''
    mkdir -p $out
    
    # Copy Firefox build
    mkdir -p $out/firefox
    cp -r firefox-build/. $out/firefox/
    
    # Copy Chrome build
    mkdir -p $out/chrome
    cp -r chrome-build/. $out/chrome/
    
    # Create Firefox XPI
    cd $out/firefox
    zip -r $out/prolific-firefox.xpi .
    cd -
    
    # Create Chrome ZIP
    cd $out/chrome
    zip -r $out/prolific-chrome.zip .
    cd -
  '';

  meta = {
    description = "A browser extension for prolific to convert currencies";
    homepage = "https://github.com/pixel-87/prolific_currency_converter";
    license = lib.licenses.gpl3Plus;
    maintainers = with lib.maintainers; [ ];
  };
}
