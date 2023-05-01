{
  inputs = {
  	flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
  	flake-utils.lib.eachDefaultSystem (system:
	  let pkgs = nixpkgs.legacyPackages.${system}; in
	  {
	    # SHELL
	    devShells.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [
          nodejs
        ];
      };
	  }
  );
}