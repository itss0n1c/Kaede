{
  description = "kaede dev environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = {nixpkgs, ...}: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {inherit system;};

    bun_1_3_14 = pkgs.stdenv.mkDerivation {
      pname = "bun";
      version = "1.3.14";

      src = pkgs.fetchzip {
        url = "https://github.com/oven-sh/bun/releases/download/bun-v1.3.14/bun-linux-x64.zip";
        hash = "sha256-YyGDD7f0JlmiO2G3LY80p/oMUpWXcoC7x7LW/gU/LmU=";
        stripRoot = false;
      };

      nativeBuildInputs = with pkgs; [
        autoPatchelfHook
      ];

      buildInputs = with pkgs; [
        stdenv.cc.cc.lib
        zlib
      ];

      installPhase = ''
        runHook preInstall

        mkdir -p $out/bin
        cp bun-linux-x64/bun $out/bin/bun
        chmod +x $out/bin/bun

        runHook postInstall
      '';
    };
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        zsh
        bun_1_3_14
        biome
        nodejs_22
      ];
    };
  };
}
