import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
{
    files: ["**/*.ts"],
    ignores: ["**/node_modules/**", "**/dist/**", "**/out/**", "**/*.d.ts"],
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        // TypeScript specific rules
        "@typescript-eslint/naming-convention": ["warn", {
            selector: "import",
            format: ["camelCase", "PascalCase"],
        }],
        "@typescript-eslint/no-unused-vars": ["error", { 
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_" 
        }],
        "@typescript-eslint/explicit-function-return-type": ["warn", {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
        }],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/await-thenable": "error",

        // General rules
        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",
        "prefer-const": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-template": "error",
        "no-console": "warn",
        "no-debugger": "error",
        "no-duplicate-imports": "error",
        "consistent-return": "error",
        "no-else-return": "warn",
        "no-useless-concat": "error",
        "prefer-arrow-callback": "error",
    },
},
{
    // JavaScript files (webpack config, etc.)
    files: ["**/*.js", "**/*.mjs"],
    ignores: ["**/node_modules/**", "**/dist/**", "**/out/**"],
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        globals: {
            require: "readonly",
            module: "readonly",
            __dirname: "readonly",
            process: "readonly",
        },
    },
    rules: {
        // General rules for JS files
        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",
        "prefer-const": "error",
        "no-var": "error",
        "no-console": "warn",
        "no-debugger": "error",
    },
}];