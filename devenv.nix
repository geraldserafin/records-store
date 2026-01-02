{ pkgs, config, ... }:

{
  env = rec {
    API_PORT = "1000";
    FRONTEND_PORT = "5173";
    FRONTEND_URL = "http://localhost:${FRONTEND_PORT}";
    VITE_API_URL = "http://localhost:${API_PORT}";
  };

  languages = {
    javascript = {
      enable = true;
      package = pkgs.nodejs;
      pnpm = {
        enable = true;
        install.enable = true;
      };
    };
    typescript.enable = true;
  };

  services.mysql = {
    enable = true;
    initialDatabases = [{ name = "vinyl_store"; }];
    ensureUsers = [{
      name = "root";
      password = "";
      ensurePermissions = { "*.*" = "ALL PRIVILEGES"; };
    }];
  };

  processes = {
    backend = {
      exec = "DB_SOCKET=$MYSQL_UNIX_PORT pnpm run start:dev";
      cwd = "${config.git.root}/apps/backend";
      process-compose = {
        depends_on = { mysql.condition = "process_started"; };
      };
    };
    frontend = {
      exec = "pnpm run dev";
      cwd = "${config.git.root}/apps/frontend";
      process-compose = {
        depends_on = { backend.condition = "process_started"; };
      };
    };
  };

  scripts = {
    "db:migrate" = {
      exec = "cd apps/backend && pnpm run migration:run";
      description = "Run database migrations";
    };
    "db:seed" = {
      exec = "cd apps/backend && pnpm run seed";
      description = "Seed the database";
    };
    "db:shell" = {
      exec = "mysql -u root vinyl_store";
      description = "Open MySQL shell";
    };
  };

  packages = with pkgs; [ stripe-cli ];

  # git-hooks.hooks = {
  #   eslint.enable = true;
  #   prettier.enable = true;
  # };
}
