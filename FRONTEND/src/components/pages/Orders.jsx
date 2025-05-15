import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Package, Truck, CheckCircle, ChevronRight, Info, Clock, MapPin } from 'lucide-react';
import { Progress } from "../ui/progress";

const OrdersPage = () => {
  const orders = [
    {
      id: "ORD-1234",
      date: "2024-03-15",
      status: "processing",
      total: 149.99,
      deliveryEstimate: "2024-03-20",
      items: [
        {
          id: "ITEM-1",
          name: "Premium Wireless Headphones",
          price: 149.99,
          quantity: 1,
          image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F81S-9DCV0JL._AC_SL1500_.jpg&f=1&nofb=1&ipt=d1964eadbe671d55eaf4c46b3e51babfe1c7c60fa3e101c76238aabd029b0ef5",
          color: "Black",
          warranty: "1 Year"
        }
      ]
    },
    {
      id: "ORD-1235",
      date: "2024-03-14",
      status: "shipped",
      total: 299.97,
      deliveryEstimate: "2024-03-18",
      items: [
        {
          id: "ITEM-2",
          name: "Smart Fitness Tracker",
          price: 99.99,
          quantity: 2,
          image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.bhphotovideo.com%2Fimages%2Fimages1500x1500%2Ffitbit_fb412bkbk_inspire_fitness_tracker_black_1460549.jpg&f=1&nofb=1&ipt=675a51b317da4b1b82f536d63f45faaf6e7d2cdde504ce91a8db0ad4f34f992e",
          color: "Midnight Blue",
          size: "Medium"
        },
        {
          id: "ITEM-3",
          name: "Wireless Charging Pad",
          price: 49.99,
          quantity: 2,
          image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi5.walmartimages.com%2Fasr%2F356a1dc2-9f90-406c-b811-ea5cebdb9ffa_1.16913f4f29fd6567906fe07289be855e.jpeg&f=1&nofb=1&ipt=1c8a77b9fd4c272ae15100bbe43103b4a6b2e6c58f8f3359fd1f6bf88e575d26",
          color: "White"
        }
      ]
    }
  ];

  const statusConfig = {
    processing: { 
      icon: Package, 
      color: "bg-amber-100 text-amber-800",
      progress: 30
    },
    shipped: {
      icon: Truck,
      color: "bg-blue-100 text-blue-800",
      progress: 60
    },
    delivered: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
      progress: 100
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <div className="flex gap-2">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          return (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        Ordered on {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[order.status].color} gap-2`}>
                    <StatusIcon className="h-4 w-4" />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="border rounded-lg">
                  {order.items.map((item, index) => (
                    <div key={item.id} className={`p-4 ${index !== 0 ? 'border-t' : ''}`}>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 rounded-lg">
                          <AvatarImage src={item.image} />
                          <AvatarFallback>{item.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500 space-y-1 mt-1">
                            <div>Quantity: {item.quantity}</div>
                            {item.color && <div>Color: {item.color}</div>}
                            {item.size && <div>Size: {item.size}</div>}
                            {item.warranty && <div>Warranty: {item.warranty}</div>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">${item.price} each</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Delivery Estimate</div>
                        <div>{new Date(order.deliveryEstimate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Order Progress</div>
                    <Progress value={statusConfig[order.status].progress} />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between bg-gray-50 px-4 py-3">
                <div className="text-lg font-semibold">
                  Total: ${order.total.toFixed(2)}
                </div>
                <div className="space-x-2">
                  <Button variant="outline">View Invoice</Button>
                  <Button variant="outline">Track Package</Button>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline">Previous</Button>
        <Button variant="outline">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
};

export default OrdersPage;