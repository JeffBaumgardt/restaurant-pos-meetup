import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

/** Rules only — Next.js config already registers the `jsx-a11y` plugin. */
const jsxA11yRecommendedRules = jsxA11y.flatConfigs.recommended.rules;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "jsx-a11y/recommended-plus",
    files: ["src/**/*.{js,jsx,ts,tsx}", "e2e/**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...jsxA11yRecommendedRules,
      // Align with eslint-config-next’s Next/Image-aware alt rule
      "jsx-a11y/alt-text": [
        "warn",
        {
          elements: ["img"],
          img: ["Image"],
        },
      ],
      // Interaction coverage for modal overlays and custom controls
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
