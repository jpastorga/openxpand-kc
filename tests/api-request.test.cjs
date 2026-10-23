const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadClient(fetch) {
  function load(relativePath) {
    const filename = path.join(__dirname, "..", relativePath);
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    });
    const exports = {};
    vm.runInNewContext(outputText, {
      exports,
      fetch,
      require: () => load("utils/CustomError.ts"),
    }, { filename });
    return exports;
  }
  return load("lib/api.tsx").makeRequest;
}

for (const method of ["GET", "POST", "DELETE"]) {
  test(`${method} operations reach the POST proxy with their upstream method intact`, async () => {
    const options = {
      method,
      url: "https://api.test.openxpand.com/api/camara/sandbox/number-verification/v0/device-phone-number",
      data: {},
      headers: { Authorization: "Bearer test-token" },
    };
    const makeRequest = loadClient(async (url, config) => {
      const request = new Request(new URL(url, "https://app.example"), config);
      assert.equal(request.method, "POST");
      assert.equal(request.url, "https://app.example/api/request");
      assert.deepEqual(await request.json(), options);
      return Response.json({ devicePhoneNumber: "+541100000000" });
    });
    const response = await makeRequest(options);
    assert.equal(response.devicePhoneNumber, "+541100000000");
  });
}
