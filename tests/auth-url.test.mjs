import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function load(relativePath) {
  const filename = path.join(__dirname, "..", relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    window: { location: { origin: "https://tester.example" } },
    require: (name) => load(`${name.replace("@/", "")}.ts`),
  }, { filename });
  return exports;
}

const { generateAuthUrl } = load("utils/url.ts");
for (const [environment, suffix] of [["development", ".dev"], ["testing", ".test"], ["production", ""]]) {
  for (const useAuthProxy of [undefined, false, true]) {
    test(`${environment}: authorization GET with proxy ${useAuthProxy}`, () => {
      const scope = ["dpv:FraudPreventionAndDetection#device-status", "sim-swap:check"];
      const url = new URL(generateAuthUrl({
        clientId: "plusmobile", tenant: "telecom", environment,
        selectedVersions: [], scope, useAuthProxy,
      }));
      assert.equal(url.origin, `https://${useAuthProxy ? "auth" : "opengw"}${suffix}.openxpand.com`);
      assert.equal(url.pathname, "/auth/realms/telecom/protocol/openid-connect/auth");
      assert.equal(url.searchParams.get("response_type"), "code");
      assert.equal(url.searchParams.get("client_id"), "plusmobile");
      assert.equal(url.searchParams.get("redirect_uri"), "https://tester.example");
      assert.equal(url.searchParams.get("scope"), scope.join(" "));
      if (useAuthProxy) assert.equal(url.searchParams.get("prompt"), "none");
      assert.equal(url.searchParams.has("client_secret"), false);
    });
  }
}
