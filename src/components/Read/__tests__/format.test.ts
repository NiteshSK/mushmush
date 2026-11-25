import { articleTopic, formatDate, imageSrc, pageCount, pageNumber, splitPublisher } from "../format";

describe("reading page helpers", () => {
  it("reads only positive whole page numbers", () => {
    expect(pageNumber("3")).toBe(3);
    expect(pageNumber(["2", "5"])).toBe(2);
    for (const bad of [undefined, "", "0", "-1", "1.5", "abc"]) expect(pageNumber(bad)).toBe(1);
  });

  it("dates posts in Indian time", () => {
    // 22:34 UTC on 20 September is 04:04 on 21 September in Dehradun.
    expect(formatDate("2025-09-20T22:34:22.441Z")).toBe("21 September 2025");
  });

  it("normalises stored image paths and has no placeholder fallback", () => {
    expect(imageSrc("/images/blog/a.png")).toBe("/images/blog/a.png");
    expect(imageSrc("images/blog/a.png")).toBe("/images/blog/a.png");
    expect(imageSrc("public/images/blog/a.png")).toBe("/images/blog/a.png");
    expect(imageSrc("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
    expect(imageSrc("  ")).toBeNull();
    expect(imageSrc(null)).toBeNull();
  });

  it("splits the publisher off a scraped headline", () => {
    expect(splitPublisher("Potential Benefits of Turkey Tail Mushroom - Verywell Health"))
      .toEqual({ headline: "Potential Benefits of Turkey Tail Mushroom", publisher: "Verywell Health" });
    expect(splitPublisher("News - Mycelium packaging takes on polystyrene - University of Nottingham"))
      .toEqual({ headline: "News - Mycelium packaging takes on polystyrene", publisher: "University of Nottingham" });
    expect(splitPublisher("No publisher here")).toEqual({ headline: "No publisher here", publisher: null });
  });

  it("finds the mushroom an article title is about", () => {
    expect(articleTopic("Unlock the Umami: Your Guide to Growing Shiitake Mushrooms at Home")).toBe("shiitake");
    expect(articleTopic("From Spore to Plate: Growing Oyster Mushrooms at Home")).toBe("oyster");
    expect(articleTopic("Cooking with Lion's Mane")).toBe("lion’s mane");
    expect(articleTopic("Shitake stir-fry")).toBe("shiitake");
    expect(articleTopic("Storing spices in the monsoon")).toBeNull();
  });

  it("counts at least one page", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(6)).toBe(1);
    expect(pageCount(7)).toBe(2);
  });
});
