import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { gsap } from "gsap";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { createInteraction } from "../utils/interactions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import API from "../api/API";
import ProductsBar from "../ProductsBar";

const ProductView = () => {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const sizeRefs = useRef([]);
  const { addToCart, toggleWishlist, wishListProducts, deleteFromCart } =
    useShop();

  const isWishListed = wishListProducts.some(
    (p) => product?._id && p === product._id
  );

  const ProductPageSkeleton = () => (
    <div className="p-10">
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className=" bg-gray-300 h-4 w-20" />
              <Skeleton className=" bg-gray-300 h-4 w-4" />
            </div>
          ))}
        </div>
        <div className="flex gap-8 mt-5">
          <Skeleton className=" bg-gray-300 w-[500px] h-[500px] rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className=" bg-gray-300 h-8 w-3/4" />
            <Skeleton className=" bg-gray-300 h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className=" bg-gray-300 h-4 w-24" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
            </div>
            <Skeleton className=" bg-gray-300 h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className=" bg-gray-300 h-10 w-10 rounded-full" />
              <Skeleton className=" bg-gray-300 h-10 w-32" />
            </div>
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-12 rounded-lg" />
              ))}
            </div>
            <div className="flex gap-4">
              <Skeleton className=" bg-gray-300 h-12 w-32" />
              <Skeleton className=" bg-gray-300 h-12 w-12" />
              <Skeleton className=" bg-gray-300 h-12 w-12" />
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-8">
          <Skeleton className=" bg-gray-300 h-6 w-48" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className=" bg-gray-300 h-4 w-24" />
                <Skeleton className=" bg-gray-300 h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className=" bg-gray-300 h-6 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Skeleton className=" bg-gray-300 h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className=" bg-gray-300 h-4 w-32" />
                    <Skeleton className=" bg-gray-300 h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className=" bg-gray-300 h-4 w-full" />
                  <Skeleton className=" bg-gray-300 h-4 w-4/5" />
                </div>
                <Skeleton className=" bg-gray-300 h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const controller = new AbortController();
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProduct(null);
        const [response] = await Promise.all([
          
          API.get(`/products/${id}`, {
            signal: controller.signal,
          }),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
        if (response.status === 200) {
          setProduct(response.data?.product);
          createInteraction(response.data.product._id,'view');
        } else {
          setError("Failed to fetch product");
        }
      } catch (error) {
        if (!API.isCancel(error)) {
          console.error("Error fetching product:", error);
          setError("Failed to fetch product");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
    
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    sizeRefs.current.forEach((ref) => {
      if (ref) {
        gsap.to(ref, {
          border:
            ref.innerText === selectedSize
              ? "1px solid black"
              : "1px solid gray",
          backgroundColor: ref.innerText === selectedSize ? "#f2f2f2" : "white",
          color: ref.innerText === selectedSize ? "black" : "gray",
          duration: 0.3,
          ease: "power1.out",
        });
      }
    });
  }, [selectedSize]);

  if (isLoading) return <ProductPageSkeleton />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    );

  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  const SIZES =
    product.category === "Fashion" &&
      (product.subcategory === "Men's Clothing" ||
        product.subcategory === "Women's Wear" ||
        product.subcategory === "Kids' Fashion")
      ? ["S", "M", "L", "XL"]
      : product.category === "Footwear"
        ? ["7", "8", "9", "10", "11", "12"]
        : [];

  return (
    <div className="p-10 ">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/products?category=${encodeURIComponent(
                product.category
              )}`}
            >
              {product.category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/products?category=${encodeURIComponent(
                product.category
              )}&subcategory=${encodeURIComponent(product.subcategory)}`}
            >
              {product.subcategory}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="min-h-screen flex gap-8 mt-5 mx-auto">
        {/* Product Image */}
        <div className="relative w-[500px] h-[500px] flex-none bg-background rounded-xl p-4">
          <img
            className="rounded-lg mx-auto object-contain w-full"
            src={`${import.meta.env.VITE_BASE_URL}/${product.image}`}
            alt={product.title}
            loading="lazy"
            style={{ backgroundColor: "transparent", aspectRatio: "1/1" }}
          />
          {product.discountPercentage > 0 && (
            <span className="absolute top-2 bg-amber-100 left-2 text-red-400 px-3 py-1 rounded-full text-lg font-semibold">
              {product.discountPercentage}% Off
            </span>
          )}
          <Heart
            size={30}
            onClick={() => toggleWishlist(product)}
            className={`text-pink-500 absolute right-5 top-5 ${isWishListed ? "fill-pink-500" : "fill-transparent"
              } cursor-pointer transition-colors`}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col w-[calc(100%-550px)] ml-3">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-mb font-semibold text-gray-700 mt-4">
            {product.description}
          </p>

          <div className="flex items-center gap-30 pt-4">
            <div>
              {/* Ratings */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  {[...Array(fullStars)].map((_, i) => (
                    <FaStar
                      className="text-xl text-yellow-400"
                      key={`full-${i}`}
                    />
                  ))}
                  {hasHalfStar && (
                    <FaStarHalfAlt className="text-xl text-yellow-400" />
                  )}
                  {[...Array(emptyStars)].map((_, i) => (
                    <FaRegStar
                      className="text-xl text-yellow-400"
                      key={`empty-${i}`}
                    />
                  ))}
                </div>
                <span className="text-xl font-semibold text-gray-600">
                  ({product.rating})
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                {product.tags.map((tag) => {
                  return (
                    <Badge
                      className="bg-gray-50 border border-gray-200 text-gray-500"
                      key={tag}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>

              <div>
                {product.stock && product.stock < 10 && product.stock > 0 ? (
                  <Badge
                    variant="destructive"
                    className="text-xl px-5 rounded-s-none rounded-e-2xl mt-4"
                  >
                    Only {product.stock} left in Stock{" "}
                  </Badge>
                ) : (
                  ""
                )}
              </div>

              {/* Pricing */}

              <div className="flex items-center gap-2 mt-3">
                <p className="text-green-500 text-3xl font-bold">
                  {product.price}
                </p>
                <p className="text-gray-600 text-base line-through">
                  {product.oldPrice}
                </p>
              </div>

              {product.brand && (
                <Badge className="text-gray-500 bg-background mt-2 border border-gray-200 font-semibold  px-1 py-1 rounded-xl">
                  {product.brand}
                </Badge>
              )}

              {/* Size Selection */}
              {SIZES.length > 0 && (
                <div className="mt-2">
                  <h2 className="font-light text-mb mb-2">Select Size:</h2>
                  <ToggleGroup
                    type="single"
                    onValueChange={(value) => setSelectedSize(value)}
                    value={selectedSize}
                    className="flex gap-1 rounded-lg "
                  >
                    {SIZES.map((size) => (
                      <ToggleGroupItem
                        key={size}
                        value={size}
                        className="px-4 py-2 bg-gray-100 rounded-lg text-lg font-semibold text-black hover:text-none data-[state=on]:text-white data-[state=on]:bg-black"
                      >
                        {size}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mt-5 gap-2 flex flex-col">
                <h4 className="font-light text-mb mb-2">Select Quantity:</h4>
                <div className="flex gap-3  items-center =">
                  <Button
                    onClick={() =>
                      setQuantity((prevQuantity) =>
                        Math.max(1, prevQuantity - 1)
                      )
                    }
                    className="w-12 h-w-12 font-bold shadow-md bg-background text-primary hover:bg-background border-primary border-2 flex items-center justify-center active:scale-105"
                  >
                    -
                  </Button>

                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantity}
                    onChange={(e) => {
                      let newValue = parseInt(e.target.value, 10);
                      if (!isNaN(newValue)) {
                        setQuantity(Math.min(25, Math.max(1, newValue)));
                      }
                    }}
                    className="w-20 h-9 text-center rounded-lg border-2 border-primary appearance-none"
                  />

                  <Button
                    onClick={() =>
                      setQuantity((prevQuantity) =>
                        Math.min(25, prevQuantity + 1)
                      )
                    }
                    className="w-12 h-w-12 font-bold shadow-md bg-background text-primary hover:bg-background border-primary border-2 flex items-center justify-center active:scale-105"
                  >
                    +
                  </Button>
                  <Button
                    onClick={() => {
                      deleteFromCart(product, selectedSize);
                    }}
                    className="w-12 h-w-12 font-bold shadow-md  bg-primary text-white  active:bg-background active:text-primary active:scale-105 border-primary border-2 flex items-center justify-center"
                  >
                    <RiDeleteBin6Fill />
                  </Button>
                </div>

                <div className="mt-2 flex">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      addToCart(product, quantity, selectedSize);
                      toast.success(
                        `${quantity} ${product.title
                          .split(" ")
                          .slice(0, 3)
                          .join(" ")}, Added to Cart`
                      );
                    }}
                    className="w-72 text-xl h-12 shadow-md active:bg-blue-500 text-white"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 -mt-20 flex   items-start justify-center border rounded-xl shadow-lg bg-white">
        <div className="flex-col flex w-1/2">
          <h5 className="text-lg  font-semibold mb-4">Product Details</h5>
          <Table>
            <TableBody>
              <TableRow className="hover:bg-background">
                <TableCell className="font-medium">Weight:</TableCell>
                <TableCell className="text-left">
                  {product.weight} gms
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-background">
                <TableHead className="py-3">Dimensions</TableHead>
              </TableRow>
              <TableRow className="hover:bg-background">
                <TableCell className="font-medium">Width:</TableCell>
                <TableCell className="text-left">
                  {product.dimensions.width} cm
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-background">
                <TableCell className="font-medium">Height:</TableCell>
                <TableCell className="text-left">
                  {product.dimensions.height} cm
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-background">
                <TableCell className="font-medium">Depth:</TableCell>
                <TableCell className="text-left">
                  {product.dimensions.depth} cm
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-background">
                <TableCell className="font-medium">Warranty:</TableCell>
                <TableCell className="text-left">
                  {product.warrantyInformation}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-background">
                <TableCell className="font-medium">Stock:</TableCell>
                <TableCell className="text-left">
                  {product.availabilityStatus}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="w-1/2 flex flex-wrap">
          <p className="pt-10 px-5 flex items-center justify-center h-full">
            {product.description}
          </p>
          <span className="px-5 pt-2 w-full text-center flex text-gray-700">
            {product.tags.join(", ")}
          </span>
        </div>
      </div>

      <div>
      <ProductsBar product={product}/>
      </div>

      <div className="p-5 mt-5 border rounded-xl shadow-lg bg-white">
        <h5 className="font-semibold">Reviews</h5>
        <div className="grid grid-cols-3 gap-5 mt-4">
          {product.reviews.map((review, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={`${import.meta.env.VITE_API_URL}/123`}
                      alt={review.reviewerName}
                    />
                    <AvatarFallback className="text-sm flex items-center justify-center">
                      {review.reviewerName.split("").slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {review.reviewerName}
                    <CardDescription className="text-xs font-normal mt-0.5">
                      {review.reviewerEmail}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex pb-1.5 items-center gap-2 -mt-2">
                  <div className="flex gap-1">
                    {[...Array(fullStars)].map((_, i) => (
                      <FaStar
                        className="text-base text-yellow-400"
                        key={`full-${i}`}
                      />
                    ))}
                    {hasHalfStar && (
                      <FaStarHalfAlt className="text-base text-yellow-400" />
                    )}
                    {[...Array(emptyStars)].map((_, i) => (
                      <FaRegStar
                        className="text-base text-yellow-400"
                        key={`empty-${i}`}
                      />
                    ))}
                  </div>
                  <span className="text-base font-semibold text-gray-700">
                    {product.rating}/5
                  </span>
                </div>
                <p>{review.comment}</p>
              </CardContent>
              <CardFooter className="text-gray-500 text-sm">
                <p>{new Date(review.date).toLocaleDateString()}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductView;
