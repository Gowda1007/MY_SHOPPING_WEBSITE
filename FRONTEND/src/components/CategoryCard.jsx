import React from 'react'
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"

const CategoryCard = ({ category }) => {
    const navigate = useNavigate();

    const handleCategoryClick = () => {
        navigate(`/products?category=${encodeURIComponent(category.name)}`);
    };

    return (
        <Link
            to={`/products?category=${encodeURIComponent(category.name)}`}
            className="flex-shrink-0"
            onClick={handleCategoryClick}
        >
            <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                <CardContent className="p-0">
                    <div className="aspect-square relative flex items-center justify-center">
                        <img
                            src={category.imagePath}
                            alt={category.name}
                            className="object-cover w-full h-full rounded-lg"
                            style={{
                                width: '200px',
                                height: '200px', 
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                    <div className="p-4 text-center">
                        <h3 className="font-medium">{category.name}</h3>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default CategoryCard;