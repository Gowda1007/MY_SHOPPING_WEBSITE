import React, { useState, useEffect } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Users, Package, ShoppingCart, Settings, LogOut, ChartBar, Plus, Search, Edit, Trash2, Sliders } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useUser } from '../context/UserContext';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

const AdminDashboard = () => {
  const { user, adminLogout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Dummy Data with real-time simulation
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalUsers: 2458,
      activeProducts: 892,
      pendingOrders: 56,
      totalRevenue: 154230,
      conversionRate: 4.1
    },
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
      // ... more users
    ],
    products: [
      { id: 1, name: 'Premium Headphones', price: 299, stock: 45, category: 'Electronics' },
      { id: 2, name: 'Designer T-Shirt', price: 89, stock: 120, category: 'Fashion' },
      // ... more products
    ],
    orders: [
      { id: '#1234', customer: 'Mike Johnson', amount: 499, status: 'processing', date: '2024-03-15' },
      { id: '#1235', customer: 'Sarah Wilson', amount: 199, status: 'shipped', date: '2024-03-14' },
      // ... more orders
    ],
    analytics: {
      revenueData: [
        { month: 'Jan', revenue: 6500 },
        { month: 'Feb', revenue: 8300 },
        // ... more months
      ],
      trafficSources: [
        { source: 'Direct', value: 45 },
        { source: 'Social', value: 25 },
        { source: 'Search', value: 30 }
      ]
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          totalRevenue: prev.metrics.totalRevenue + Math.floor(Math.random() * 100)
        }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUserAction = (action, userId) => {
    // Implement user actions
  };

  const handleProductAction = (action, productId) => {
    // Implement product actions
  };

  const handleOrderUpdate = (orderId, newStatus) => {
    // Implement order status updates
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">User Management</h2>
              <Button onClick={() => setIsUserModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New User
              </Button>
            </div>
            <Input 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Product Management</h2>
              <Button onClick={() => setIsProductModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Product
              </Button>
            </div>
            <Table>
              {/* Product table similar to users */}
            </Table>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.analytics.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.analytics.trafficSources}
                        dataKey="value"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {dashboardData.analytics.trafficSources.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(dashboardData.metrics).map(([key, value]) => (
                <Card key={key} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Real-time Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" /> Live Sales Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.analytics.revenueData}>
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
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-white border-r h-screen sticky top-0 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Avatar>
            <AvatarImage src={user?.image} />
            <AvatarFallback>{user?.name?.slice(0,2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <Button
            variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('dashboard')}
          >
            <ChartBar className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'users' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('users')}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === 'products' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('products')}
          >
            <Package className="mr-2 h-4 w-4" />
            Products
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('analytics')}
          >
            <Sliders className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </nav>

        <Button 
          variant="outline" 
          className="w-full mt-auto"
          onClick={adminLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h1>
            <div className="flex gap-3">
              <Button variant="outline">Export Data</Button>
              <Button>Refresh</Button>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      <UserModal 
        open={isUserModalOpen} 
        onOpenChange={setIsUserModalOpen}
        user={selectedUser}
      />
      
      <ProductModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={selectedProduct}
      />
    </div>
  );
};

// Example Modal Component
const UserModal = ({ open, onOpenChange, user }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input placeholder="Full Name" defaultValue={user?.name} />
        <Input placeholder="Email" defaultValue={user?.email} />
        <Input placeholder="Role" defaultValue={user?.role} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button>{user ? 'Save Changes' : 'Create User'}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AdminDashboard;