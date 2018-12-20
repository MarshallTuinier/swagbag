import formatMoney from "../lib/formatMoney";

describe("formatMoney Function", () => {
  it("works with fractional dollars", () => {
    expect(formatMoney(1)).toEqual("$0.01");
    expect(formatMoney(10)).toEqual("$0.10");
    expect(formatMoney(9)).toEqual("$0.09");
    expect(formatMoney(40)).toEqual("$0.40");
  });

  it("leaves cents off for whole dollars", () => {
    expect(formatMoney(100)).toEqual("$1");
    expect(formatMoney(1000)).toEqual("$10");
    expect(formatMoney(50000000)).toEqual("$500,000");
  });

  it("works with whole and fractional dollars", () => {
    expect(formatMoney(125)).toEqual("$1.25");
    expect(formatMoney(1001)).toEqual("$10.01");
    expect(formatMoney(50000010)).toEqual("$500,000.10");
    expect(formatMoney(79820374500010)).toEqual("$798,203,745,000.10");
  });
});
