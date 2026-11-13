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
const { steps } = load("app/constants.ts");

test("authorization curl example leaves prompt unspecified to allow consent", () => {
  const authorizationStep = steps.find(step => step.method === "GET");
  const url = new URL(authorizationStep.url.replace(":host", "https://auth.test.openxpand.com"));
  assert.equal(url.searchParams.has("prompt"), false);
});
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
      assert.equal(url.searchParams.has("prompt"), false);
      assert.equal(url.searchParams.has("client_secret"), false);
      assert.equal(url.searchParams.has("login_hint"), false);
    });
  }

  for (const tenant of ["aggregator", "aggregatorpy", "aggregator-other", "tma", "telecom"]) {
    test(`${environment}: proxy sends login_hint for ${tenant}`, () => {
      const url = new URL(generateAuthUrl({
        clientId: "plusmobile", tenant, environment,
        selectedVersions: [], scope: ["sim-swap:check"],
        useAuthProxy: true, loginHint: "541134823456",
      }));
      assert.equal(url.origin, `https://auth${suffix}.openxpand.com`);
      assert.equal(url.searchParams.get("login_hint"), "541134823456");
      assert.equal(url.searchParams.has("prompt"), false);
      assert.ok(url.search.endsWith("&login_hint=541134823456"));
    });
  }
}

test("login_hint is trimmed and encoded as a single query value", () => {
  const url = new URL(generateAuthUrl({
    clientId: "plusmobile", tenant: "aggregator", environment: "testing",
    selectedVersions: [], scope: [], useAuthProxy: true,
    loginHint: "  +541134823456&prompt=login  ",
  }));
  assert.equal(url.searchParams.get("login_hint"), "+541134823456&prompt=login");
  assert.equal(url.searchParams.has("prompt"), false);
});

for (const useAuthProxy of [undefined, false, true]) {
  for (const loginHint of [undefined, "", "   ", "541134823456"]) {
    if (useAuthProxy && loginHint?.trim()) continue;
    test(`omits login_hint with proxy ${useAuthProxy} and value ${JSON.stringify(loginHint)}`, () => {
      const url = new URL(generateAuthUrl({
        clientId: "plusmobile", tenant: "telecom", environment: "development",
        selectedVersions: [], scope: [], useAuthProxy, loginHint,
      }));
      assert.equal(url.searchParams.has("login_hint"), false);
    });
  }
}
