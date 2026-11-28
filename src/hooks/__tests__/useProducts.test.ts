import { renderHook, waitFor } from "@testing-library/react";
import { productsApi, type Product } from "@/lib/api";
import { useProducts } from "../useProducts";

jest.mock("@/lib/api", () => ({ productsApi: { getAll: jest.fn() } }));
const getAll = productsApi.getAll as jest.Mock;
const cumin = { id: 1, slug: "cumin-seeds", title: "Cumin Seeds" } as Product;
const pepper = { id: 2, slug: "black-pepper", title: "Black Pepper" } as Product;

describe("useProducts", () => {
  beforeEach(() => getAll.mockResolvedValue({ products: [pepper], pagination: { page: 1, limit: 100, total: 1, totalPages: 1 } }));

  it("renders server products at once and does not fetch them again", () => {
    const { result } = renderHook(() => useProducts({ limit: 100 }, [cumin]));
    expect(result.current.products).toEqual([cumin]);
    expect(result.current.loading).toBe(false);
    expect(getAll).not.toHaveBeenCalled();
  });

  it("fetches when the params change after the server data", async () => {
    const { result, rerender } = renderHook(({ category }) => useProducts({ limit: 100, category }, [cumin]), { initialProps: { category: undefined as string | undefined } });
    rerender({ category: "spices" });
    await waitFor(() => expect(result.current.products).toEqual([pepper]));
    expect(getAll).toHaveBeenCalledWith({ limit: 100, category: "spices" });
  });

  it("fetches in the browser without server data", async () => {
    const { result } = renderHook(() => useProducts({ limit: 100 }));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.products).toEqual([pepper]));
    expect(result.current.loading).toBe(false);
  });
});
