import * as React from "react";
import * as ReactIs from "react-is";
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    typescript({
      useTsconfigDeclarationDir: true,
      rollupCommonJSResolveHack: true,
      exclude: "test",
      clean: true,
    }),
    commonjs({
      include: ["node_modules/**"],
      namedExports: {
        react: Object.keys(React),
        "react-is": Object.keys(ReactIs),
      },
    }),
  ],
};
