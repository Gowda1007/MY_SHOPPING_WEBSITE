import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import ProductsGrid from "../ProductsGrid";
import FilterSideBar from "../FilterSideBar";
import { IoFilter } from "react-icons/io5";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import API from "../api/API";

const allCategories = {
  Fashion: [
    "Men's Clothing",
    "Women's Wear",
    "Kids' Fashion",
    "Jewelry",
    "Watches",
  ],
  Electronics: ["Computers", "Mobile Phones", "Wearables", "Home Appliances"],
  "Home & Living": ["Furniture", "Decor", "Kitchenware", "Lighting"],
  "Sports & Outdoors": ["Fitness", "Camping", "Cycling", "Team Sports"],
  "Beauty & Care": ["Skincare", "Haircare", "Personal Care", "Baby Care"],
  Groceries: ["Fresh Produce", "Pantry Staples", "Snacks", "Pet Food"],
  "Electrical Appliances": [
    "Kitchen Appliances",
    "Cleaning Appliances",
    "Laundry Appliances",
  ],
  "Bags & Luggage": ["Handbags", "Backpacks", "Travel Luggage"],
  Footwear: ["Men's Footwear", "Women's Footwear", "Kids Footwear"],
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const itemsPerPage = 15;

  const selectedCategory = searchParams.get("category") || "";
  const selectedSubcategories = useMemo(
    () => searchParams.getAll("subcategory") || [],
    [searchParams]
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          pageSize: itemsPerPage,
        });

        if (selectedCategory) params.append("category", selectedCategory);
        selectedSubcategories.forEach((sub) =>
          params.append("subcategory", sub)
        );

        const response = await API.get(
          `/products`,
          {
            signal: controller.signal,
            params: Object.fromEntries(params),
          }
        );

        setProducts(response.data.products);
        setTotalProducts(response.data.totalProducts);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        if (!API.isCancel(error)) {
          console.error("Error fetching products:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [currentPage, selectedCategory, selectedSubcategories]);

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams();
    if (category) newParams.set("category", category);
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (subcategory) => {
    const newParams = new URLSearchParams(searchParams);
    const currentSubs = newParams.getAll("subcategory");

    if (currentSubs.includes(subcategory)) {
      newParams.delete("subcategory");
      currentSubs
        .filter((sub) => sub !== subcategory)
        .forEach((sub) => newParams.append("subcategory", sub));
    } else {
      newParams.append("subcategory", subcategory);
    }

    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleClearSubcategories = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("subcategory");
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  return (
    <div className="overflow-x-hidden w-full mx-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <Breadcrumb>
        {" "}
        <BreadcrumbList>
          {" "}
          <BreadcrumbItem>
            {" "}
            <BreadcrumbLink href="/">Home</BreadcrumbLink>{" "}
          </BreadcrumbItem>{" "}
          <BreadcrumbSeparator />{" "}
          <BreadcrumbItem>
            {" "}
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>{" "}
          </BreadcrumbItem>{" "}
          {selectedCategory && (
            <>
              {" "}
              <BreadcrumbSeparator />{" "}
              <BreadcrumbItem>
                {" "}
                <BreadcrumbLink
                  href={`/products?category=${encodeURIComponent(
                    selectedCategory
                  )}`}
                >
                  {" "}
                  {selectedCategory}{" "}
                </BreadcrumbLink>{" "}
              </BreadcrumbItem>{" "}
            </>
          )}{" "}
          {selectedSubcategories.length > 0 && (
            <>
              {" "}
              <BreadcrumbSeparator />{" "}
              <BreadcrumbItem>
                {" "}
                <BreadcrumbPage>
                  {" "}
                  {selectedSubcategories.join(", ")}{" "}
                </BreadcrumbPage>{" "}
              </BreadcrumbItem>{" "}
            </>
          )}{" "}
        </BreadcrumbList>{" "}
      </Breadcrumb>
      <div
        className={`flex flex-col mt-5 sm:flex-row ${
          isDesktopSidebarOpen ? "gap-8" : "gap-0"
        }`}
      >
        {/* Mobile Filters */}
        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <div className="gap-2 flex shadow-md px-2 py-2 items-center justify-center rounded-lg">
              <IoFilter className="h-10 w-10" />
              Filters
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-4">
            <FilterSideBar
              categories={allCategories}
              selectedCategory={selectedCategory}
              selectedSubcategories={selectedSubcategories}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
              onClearSubcategories={handleClearSubcategories}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Filters */}
        <div
          className={`hidden sm:block overflow-hidden transition-all duration-300 ${
            isDesktopSidebarOpen ? "w-72" : "w-0"
          }`}
        >
          <div className="w-72">
            <div className="rounded-lg border p-4">
              <FilterSideBar
                categories={allCategories}
                selectedCategory={selectedCategory}
                selectedSubcategories={selectedSubcategories}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
                onClearSubcategories={handleClearSubcategories}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="lg:text-2xl text-mb mt-0 font-semibold lg:font-bold">
              {isLoading
                ? "Loading products..."
                : `Showing ${products.length} of ${totalProducts} products`}
            </h1>
            <button
              className="gap-2 hidden sm:flex shadow-md px-2 py-2 items-center justify-center rounded-lg"
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            >
              <IoFilter className="h-5 w-5" />
            </button>
          </div>

          <ProductsGrid products={products} isLoading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 2), currentPage + 1)
                .map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

              <Button
                variant="outline"
                disabled={currentPage === totalPages || isLoading}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
