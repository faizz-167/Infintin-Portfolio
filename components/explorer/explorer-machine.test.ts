import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type ExplorerState,
  initialExplorerState as initial,
  explorerReducer as reduce,
} from "./explorer-machine.ts";

describe("explorer reducer", () => {
  it("explodes and assembles", () => {
    const exploded = reduce(initial, { type: "EXPLODE" });
    assert.equal(exploded.exploded, true);
    assert.equal(reduce(exploded, { type: "ASSEMBLE" }).exploded, false);
  });

  it("isolates while assembled and keeps the explode state on clear", () => {
    const isolated = reduce(initial, { type: "ISOLATE", part: "rotor" });
    assert.equal(isolated.isolated, "rotor");
    assert.equal(isolated.exploded, false);

    const explodedIsolated = reduce(reduce(initial, { type: "EXPLODE" }), {
      type: "ISOLATE",
      part: "stator",
    });
    const cleared = reduce(explodedIsolated, { type: "CLEAR" });
    assert.equal(cleared.isolated, null);
    assert.equal(cleared.exploded, true);
  });

  it("switches isolation directly from one part to another", () => {
    const rotor = reduce(initial, { type: "ISOLATE", part: "rotor" });
    assert.equal(
      reduce(rotor, { type: "ISOLATE", part: "shaft" }).isolated,
      "shaft",
    );
  });

  it("keeps mode and section independent of explode and isolate", () => {
    let state: ExplorerState = reduce(initial, {
      type: "SET_MODE",
      mode: "xray",
    });
    state = reduce(state, { type: "TOGGLE_SECTION" });
    state = reduce(state, { type: "EXPLODE" });
    state = reduce(state, { type: "ISOLATE", part: "windings" });
    assert.equal(state.mode, "xray");
    assert.equal(state.section.on, true);
    state = reduce(state, { type: "CLEAR" });
    assert.equal(state.mode, "xray");
    assert.equal(state.section.on, true);
  });

  it("clamps the section position and keeps it across toggles", () => {
    let state = reduce(initial, { type: "TOGGLE_SECTION" });
    assert.equal(reduce(state, { type: "SET_SECTION", t: 2 }).section.t, 1);
    assert.equal(reduce(state, { type: "SET_SECTION", t: -1 }).section.t, 0);
    state = reduce(state, { type: "SET_SECTION", t: 0.3 });
    state = reduce(reduce(state, { type: "TOGGLE_SECTION" }), {
      type: "TOGGLE_SECTION",
    });
    assert.equal(state.section.t, 0.3);
  });

  it("returns the same object for no-op actions", () => {
    assert.equal(reduce(initial, { type: "ASSEMBLE" }), initial);
    assert.equal(reduce(initial, { type: "CLEAR" }), initial);
    assert.equal(
      reduce(initial, { type: "SET_MODE", mode: "shaded" }),
      initial,
    );
    assert.equal(reduce(initial, { type: "SET_SECTION", t: 0.5 }), initial);
    const rotor = reduce(initial, { type: "ISOLATE", part: "rotor" });
    assert.equal(reduce(rotor, { type: "ISOLATE", part: "rotor" }), rotor);
  });

  it("resets everything", () => {
    let state = reduce(initial, { type: "EXPLODE" });
    state = reduce(state, { type: "ISOLATE", part: "rotor" });
    state = reduce(state, { type: "SET_MODE", mode: "drawing" });
    state = reduce(state, { type: "TOGGLE_SECTION" });
    assert.deepEqual(reduce(state, { type: "RESET" }), initial);
  });
});
