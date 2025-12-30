{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in {
        devShell = pkgs.mkShell {
          name = "leverx";
          nativeBuildInputs = with pkgs; [
            nodejs_22
            gcc12
            nodePackages.node-gyp-build
            postman
            mariadb
            nest-cli
            stripe-cli
          ];
          shellHook = ''
            export MYSQL_BASEDIR=${pkgs.mariadb}
            export MYSQL_HOME=$PWD/.mysql
            export MYSQL_DATADIR=$MYSQL_HOME/data
            export MYSQL_SOCKET=$MYSQL_HOME/mysql.sock

            export DB_SOCKET=$MYSQL_SOCKET
            export DB_DATABASE=vinyl_store
            export DB_HOSTNAME=localhost
            export DB_USERNAME=$USER
            export DB_PASSWORD=
            export DB_PORT=3306

            db:start() {
              ${pkgs.mariadb}/bin/mysqld --datadir=$MYSQL_DATADIR --socket=$MYSQL_SOCKET --pid-file=$MYSQL_HOME/mysql.pid --silent-startup &
              while [ ! -e $MYSQL_SOCKET ]; do sleep 1; done
            }

            db:stop() {
              if [ -f $MYSQL_HOME/mysql.pid ]; then
                mysqladmin -S $MYSQL_SOCKET shutdown
              fi
            }

            db:shell() {
              mysql -S $MYSQL_SOCKET -c $DB_DATABASE
            }

            if [ ! -d "$MYSQL_HOME" ]; then
              mkdir -p $MYSQL_HOME
              ${pkgs.mariadb}/bin/mysql_install_db --datadir=$MYSQL_DATADIR --basedir=$MYSQL_BASEDIR

              db:start
              ${pkgs.mariadb}/bin/mysql -S $MYSQL_SOCKET -e "CREATE DATABASE IF NOT EXISTS $DB_DATABASE;"
            fi
          '';
        };
      });

}
