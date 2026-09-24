import axiosInstance from "@/lib/axios";
import { Product, ProductsResponse, ProductFormData, Category } from "@/types/product.types";

class ProductService {
  // GET /products with pagination, search, and filtering
  // NOTE: DummyJSON cannot search AND filter by category simultaneously.
  // Decision: search takes priority — when search is active, category is ignored.
  async getProducts(params: {
    limit?: number;
    skip?: number;
    search?: string;
    category?: string;
    signal?: AbortSignal;
  }): Promise<ProductsResponse> {
    const { limit = 10, skip = 0, search, category, signal } = params;

    // Search takes priority over category filter
    if (search && search.trim()) {
      const response = await axiosInstance.get<ProductsResponse>(
        `/products/search?q=${encodeURIComponent(search.trim())}&limit=${limit}&skip=${skip}`,
        { signal }
      );
      return response.data;
    }

    // Category filter (no search active)
    if (category && category.trim()) {
      const response = await axiosInstance.get<ProductsResponse>(
        `/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`,
        { signal }
      );
      return response.data;
    }

    // Default: all products
    const response = await axiosInstance.get<ProductsResponse>(
      `/products?limit=${limit}&skip=${skip}`,
      { signal }
    );
    return response.data;
  }

  // GET /products/categories — returns array of {slug, name, url}
  async getCategories(): Promise<Category[]> {
    const response = await axiosInstance.get<Category[]>("/products/categories");
    return response.data;
  }

  // GET /products/:id
  async getProductById(id: number): Promise<Product> {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  }

  // POST /products/add
  // NOTE: DummyJSON does not persist this — it returns a fake response with a new id
  async addProduct(data: ProductFormData): Promise<Product> {
    const response = await axiosInstance.post<Product>("/products/add", data);
    return response.data;
  }

  // PUT /products/:id
  // NOTE: DummyJSON does not persist this — returns the updated product object
  async updateProduct(id: number, data: Partial<ProductFormData>): Promise<Product> {
    const response = await axiosInstance.put<Product>(`/products/${id}`, data);
    return response.data;
  }

  // DELETE /products/:id
  // NOTE: DummyJSON does not persist this — returns {id, isDeleted, deletedOn}
  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
    const response = await axiosInstance.delete<{ id: number; isDeleted: boolean }>(
      `/products/${id}`
    );
    return response.data;
  }
}

export default new ProductService();
