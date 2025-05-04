import React from 'react';
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { BarChart as BarIcon, ListOrdered, Settings, ShoppingCart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useUser } from '../context/UserContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FD0'];

const SellerHome = () => {
  const navigate = useNavigate();
  const { user, sellerLogout } = useUser();

  // Dummy Data
  const dashboardData = {
    metrics: {
      totalRevenue: 154230,
      activeProducts: 67,
      totalOrders: 1234,
      conversionRate: 2.5,
      monthlyGrowth: 5.2
    },
    revenueData: [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      { month: 'Mar', revenue: 5000 },
      { month: 'Apr', revenue: 4500 },
      { month: 'May', revenue: 6000 },
      { month: 'Jun', revenue: 7000 },
    ],
    salesByCategory: [
      { category: 'Electronics', sales: 5400 },
      { category: 'Clothing', sales: 3200 },
      { category: 'Home', sales: 2900 },
      { category: 'Beauty', sales: 1800 },
      { category: 'Other', sales: 1200 },
    ],
    recentOrders: [
      { id: '#1234', customer: 'John Doe', amount: 299, status: 'Delivered', date: '2024-03-15' },
      { id: '#1235', customer: 'Jane Smith', amount: 149, status: 'Processing', date: '2024-03-14' },
      { id: '#1236', customer: 'Mike Johnson', amount: 599, status: 'Shipped', date: '2024-03-13' },
      { id: '#1237', customer: 'Sarah Wilson', amount: 199, status: 'Pending', date: '2024-03-12' },
    ],
    user: {
      username: 'store_admin',
      email: 'admin@example.com',
      image: '/avatar.png'
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-white border-r h-[100vh] sticky top-0  p-4 flex flex-col justify-between">
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
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100">
              <BarIcon className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100">
              <ListOrdered className="mr-2 h-4 w-4" />
              Products
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
        <Button onClick={sellerLogout} variant="outline" className="w-full hover:bg-gray-100">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1> <h4 className='text-lg text-secondary font-bold'>Welcome back, {user.username}!</h4>
            <div className="flex gap-3">
              <Button variant="outline" className="hover:text-white">Export Report</Button>
              <Button>Refresh Data</Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(dashboardData.metrics.totalRevenue / 1000).toFixed(1)}k
                </div>
                <div className="text-sm text-green-600 mt-1">
                  +{dashboardData.metrics.monthlyGrowth}% from last month
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.metrics.activeProducts}</div>
                <div className="text-sm text-blue-600 mt-1">5 new this week</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.metrics.totalOrders}</div>
                <div className="text-sm text-purple-600 mt-1">23 orders today</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.metrics.conversionRate}%</div>
                <div className="text-sm text-red-600 mt-1">Industry avg. 3.2%</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sales Distribution */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="sales"
                    >
                      {dashboardData.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Recent Orders */}
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>${order.amount}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </main>
    </div>
  );
};

export default SellerHome;