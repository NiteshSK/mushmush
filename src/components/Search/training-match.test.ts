import { couldMatchTraining, matchesTraining } from "./training-match";

const oyster = { name: "Oyster Mushroom Training", type: "OYSTER", slug: "oyster-mushroom-training" };
const shiitake = { name: "Shiitake Mushroom Training", type: "SHIITAKE", slug: "shiitake-mushroom-training" };
const programs = [oyster, shiitake];

describe("couldMatchTraining", () => {
  it("is true for a training word anywhere in the query, in any case", () => {
    ["training", "Mushroom TRAINING", "oyster course", "how to grow mushrooms", "classes", "workshop", "prashikshan", "sikhna", "learn farming"]
      .forEach(query => expect([query, couldMatchTraining(query)]).toEqual([query, true]));
  });

  it("is true when every word is a programme word, so a course name alone finds the course", () => {
    expect(couldMatchTraining("shiitake")).toBe(true);
    expect(couldMatchTraining("oyster mushrooms")).toBe(true);
  });

  it("is false for product searches, so they never load the courses", () => {
    ["", "  ", "cumin", "walnuts", "dried mushrooms", "king oyster eryngii", "trainer", "grower kit"]
      .forEach(query => expect([query, couldMatchTraining(query)]).toEqual([query, false]));
  });
});

describe("matchesTraining", () => {
  it("shows every course for a pure training query", () => {
    expect(matchesTraining("training", programs)).toEqual(programs);
    expect(matchesTraining("mushroom training course", programs)).toEqual(programs);
    expect(matchesTraining("how to grow mushrooms", programs)).toEqual(programs);
  });

  it("narrows to the course whose name or type has the other words", () => {
    expect(matchesTraining("oyster training", programs)).toEqual([oyster]);
    expect(matchesTraining("Shiitake course", programs)).toEqual([shiitake]);
    expect(matchesTraining("shiitake mushrooms classes", programs)).toEqual([shiitake]);
  });

  it("shows every course when the training intent is clear but no course has the other words", () => {
    expect(matchesTraining("button mushroom training", programs)).toEqual(programs);
  });

  it("matches a course name without a training word only when all words match", () => {
    expect(matchesTraining("shiitake", programs)).toEqual([shiitake]);
    expect(matchesTraining("oyster mushrooms", programs)).toEqual([oyster]);
    expect(matchesTraining("dried mushrooms", programs)).toEqual([]);
    expect(matchesTraining("cumin", programs)).toEqual([]);
  });

  it("matches nothing for an empty query or when there are no courses", () => {
    expect(matchesTraining("", programs)).toEqual([]);
    expect(matchesTraining("training", [])).toEqual([]);
  });
});
