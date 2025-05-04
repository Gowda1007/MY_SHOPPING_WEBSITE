import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { BarChart, ListOrdered, Settings, ShoppingCart, LogOut } from 'lucide-react';
import axios from "axios";
import { useShop } from "../context/ShopContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from 'react-router-dom';


const Analytics = () => {
  const navigate = useNavigate();
  const { } = useShop();
  const { user, sellerLogout } = useUser();
  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-white border-r p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Avatar>
              <AvatarImage
                className="border border-gray-300 rounded-full w-30"
                src={`${import.meta.env.VITE_BASE_URL}${user.image}`}
              />
              <AvatarFallback className="text-sm bg-primary-foreground border-2 border-black flex items-center justify-center">
                {user?.username.split("").slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-3 ">
            <Button onClick={()=>navigate("/anlytics")} variant="ghost" className="w-full justify-start hover:text-white">
              <BarChart  className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button onClick={()=>navigate("/manage-products")} variant="ghost" className="w-full justify-start hover:text-white">
              <ListOrdered  className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
            <Button onClick={()=>navigate("/orders")} variant="ghost" className="w-full justify-start hover:text-white">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button onClick={()=>navigate("/settings")} variant="ghost" className="w-full justify-start hover:text-white">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
        <Button onClick={sellerLogout} variant="outline" className="w-full mb-3 hover:text-white hover:border-gray-400">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="p-6 space-y-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold">Welcome back, {user.username}!</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$1,540</p>
              <p className="text-sm text-gray-500">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$23,450</p>
              <p className="text-sm text-gray-500">+8.4% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">18</p>
              <p className="text-sm text-gray-500">5 new since yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Stylish Hoodie</span>
              <span>$4500</span>
            </div>
            <div className="flex justify-between">
              <span>Running Shoes</span>
              <span>$3900</span>
            </div>
            <div className="flex justify-between">
              <span>Casual T-Shirt</span>
              <span>$3200</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">#1001</td>
                  <td className="px-4 py-2">John Doe</td>
                  <td className="px-4 py-2">$150</td>
                  <td className="px-4 py-2">Shipped</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">#1002</td>
                  <td className="px-4 py-2">Alice Smith</td>
                  <td className="px-4 py-2">$240</td>
                  <td className="px-4 py-2">Pending</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">#1003</td>
                  <td className="px-4 py-2">Mark Lee</td>
                  <td className="px-4 py-2">$99</td>
                  <td className="px-4 py-2">Delivered</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
