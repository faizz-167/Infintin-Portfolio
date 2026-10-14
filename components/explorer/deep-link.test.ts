import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PartId } from "../../data/types.ts";
import { readExplorerParams, writeExplorerParams } from "./deep-link.ts";
import { explorerReducer, initialExplorerState } from "./explorer-machine.ts";

const parts: PartId[] = ["rotor", "stator"];

const restore = (query: string) =>
  readExplorerParams(new URLSearchParams(query), parts).reduce(
    explorerReducer,
    initialExplorerState,
  );

describe("explorer deep links", () => {
  it("restores view, part and mode", () => {
    const state = restore("view=exploded&part=rotor&mode=xray");
    assert.equal(state.exploded, true);
    assert.equal(state.isolated, "rotor");
    assert.equal(state.mode, "xray");
  });

  it("ignores unknown values", () => {
    assert.deepEqual(
      restore("view=sideways&part=flux-capacitor&mode=neon"),
      initialExplorerState,
    );
  });

  it("round-trips a state and leaves other params alone", () => {
    const state = restore("part=stator&mode=drawing");
    const params = writeExplorerParams(
      state,
      new URLSearchParams("utm_source=mail&view=exploded"),
    );
    assert.equal(params.get("utm_source"), "mail");
    assert.equal(params.has("view"), false);
    assert.deepEqual(restore(params.toString()), state);
  });

  it("writes nothing for the default state", () => {
    assert.equal(
      writeExplorerParams(
        initialExplorerState,
        new URLSearchParams(),
      ).toString(),
      "",
    );
  });
});
