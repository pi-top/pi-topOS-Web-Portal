import isSingleOption from "../isSingleOption";

describe("isSingleOption", () => {
  const option = { value: "only_option", label: "I'm a good option ;)" };

  it("returns false when passed an array of options", () => {
    expect(isSingleOption([option, option])).toEqual(false);
  });

  it("returns false when not passed anything", () => {
    expect(isSingleOption()).toEqual(false);
  });

  it("returns false when passed null", () => {
    expect(isSingleOption()).toEqual(false);
  });

  it("returns false when passed an empty object", () => {
    expect(isSingleOption({})).toEqual(false);
  });

  it("returns true when passed a valid option", () => {
    expect(isSingleOption(option)).toEqual(true);
  });
});
