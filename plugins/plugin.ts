import fs from "fs";
import path from "path";
import type { PluginOption, ResolvedConfig } from "vite";

/**
 * A copy of the plugin vite-plugin-splash-screen
 * https://github.com/Temzasse/vite-plugin-splash-screen/commit/2982d266cf8a7e64b62befb187347058d72ff56a
 */
type LoaderType = "line" | "dots" | "none";

type PluginOptions = {
  logoSrc: string;
  splashBg?: string;
  loaderBg?: string;
  loaderType?: LoaderType;
  minDurationMs?: number;
};

export function splashScreen(options: PluginOptions) {
  if (!options.logoSrc) {
    throw new Error(
      "The `logoSrc` option is required for vite-plugin-splash-screen!"
    );
  }

  const {
    logoSrc,
    minDurationMs,
    loaderType = "line",
    loaderBg = "#1eb6c3",
    splashBg = "#ffffff",
  } = options;

  let config: ResolvedConfig;

  return {
    name: "vite-plugin-splash-screen",
    configResolved(resolvedConfig: any) {
      config = resolvedConfig;
    },
    transformIndexHtml(html: string) {
      const baseStyles = readPluginFile("styles.css");

      let loaderStyles = "";

      if (loaderType === "line") {
        loaderStyles = readPluginFile("loaders/line.css");
      } else if (loaderType === "dots") {
        loaderStyles = readPluginFile("loaders/dots.css");
      }

      const logoHtml = fs.readFileSync(
        path.resolve(config.publicDir, logoSrc),
        "utf8"
      );

      const splash = splashTemplate({
        logoHtml,
        loaderType,
        minDurationMs,
      });

      const styles = `
        <style id="vpss-style">
          ${baseStyles.replace("/*BG_SPLASH*/", splashBg)}
          ${loaderStyles.replace("/*BG_LOADER*/", loaderBg)}
        </style>
      `;

      return (
        html
          // Add styles to end of head
          .replace("</head>", `${styles}</head>`)
          // Add splash screen to end of body
          .replace("</body>", `${splash}</body>`)
      );
    },
  } satisfies PluginOption;
}

function splashTemplate({
                          logoHtml,
                          loaderType,
                          minDurationMs,
                        }: {
  logoHtml: string;
  loaderType: LoaderType;
  minDurationMs?: number;
}) {
  /**
   * TODO: add more loader options.
   * Inspiration: https://cssloaders.github.io/
   */
  let loaderHtml = "";

  if (loaderType === "line") {
    loaderHtml = readPluginFile("loaders/line.html");
  } else if (loaderType === "dots") {
    loaderHtml = readPluginFile("loaders/dots.html");
  }

  return /*html*/ `
    <div id="vpss">
      <div class="vpss-logo">${logoHtml}</div>
      ${loaderHtml}
    </div>
    <script>
      (function () {
        window.__VPSS__ = {
          renderedAt: new Date().getTime(),
          minDurationMs: ${minDurationMs || 0},
        };
      })();
    </script>
  `;
}

// TODO: is there an easier way to resolve static files relative to the plugin?
const pluginPath = "src/plugins/dev-splashscreen";

function readPluginFile(filePath: string) {
  return fs.readFileSync(path.resolve(pluginPath, filePath), "utf8");
}
