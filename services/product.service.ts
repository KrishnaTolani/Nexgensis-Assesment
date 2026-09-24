import axiosInstance from "@/lib/axios";
import { Product, ProductsResponse, ProductFormData } from "@/types/product.types";

class ProductService {
  // GET /products with pagination, search, and filtering
  async getProducts(params: {
    limit?: number;
    skip?: number;
    search?: string;
    category?: string;
  }): Promise<ProductsResponse> {
    const { limit = 10, skip = 0, search, category } = params;

    // If search is provided, use search endpoint
    if (search && search.trim()) {
      const response = await axiosInstance.get<ProductsResponse>(
        `/products/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`
      );
      return response.data;
    }

    // If category is provided (and no search), use category endpoint
    if (category && category.trim()) {
      const response = await axiosInstance.get<ProductsResponse>(
        `/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`
      );
      return response.data;
    }

    // Default: get all products
    const response = await axiosInstance.get<ProductsResponse>(
      `/products?limit=${limit}&skip=${skip}`
    );
    return response.data;
  }

  // GET /products/categories
  async getCategories(): Promise<string[]> {
    const response = await axiosInstance.get<string[]>("/products/categories");
    return response.data;
  }

  // GET /products/:id
  async getProductById(id: number): Promise<Product> {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  }

  // POST /products/add
  async addProduct(data: ProductFormData): Promise<Product> {
    const response = await axiosInstance.post<Product>("/products/add", data);
    return response.data;
  }

  // PUT /products/:id
  async updateProduct(id: number, data: ProductFormData): Promise<Product> {
    const response = await axiosInstance.put<Product>(`/products/${id}`, data);
    return response.data;
  }

  // DELETE /products/:id
  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
    const response = await axiosInstance.delete<{ id: number; isDeleted: boolean }>(
      `/products/${id}`
    );
    return response.data;
  }
}

export default new ProductService();
