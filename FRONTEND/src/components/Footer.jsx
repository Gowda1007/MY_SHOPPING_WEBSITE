import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Footer() {
  const [email, setSubscriptionEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setSubscriptionEmail('');
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className=' flex items-center mt-10 bg-gray-800 text-white justify-evenly w-full border-t'>
      <footer className="  ">
        <div className="container max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">ShopEase</h2>
              <p className="text-gray-300 text-sm">
                Your one-stop shop for everything you need.
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} className="space-y-2">
                <Label htmlFor="email">Subscribe to our newsletter</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setSubscriptionEmail(e.target.value)}
                    className="bg-background text-black"
                  />
                  <Button type="submit" className="text-white" variant="secondary">
                    Subscribe
                  </Button>
                </div>
                {status === 'success' && (
                  <p className="text-sm text-green-500">Thank you for subscribing!</p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-red-500">Please enter a valid email</p>
                )}
              </form>
            </div>

            {/* Navigation Sections */}
            <div className="grid grid-cols-2 gap-8 lg:col-span-3">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-secondary">Shop</h3>
                <nav className="space-y-1 text-sm gap-3 flex items-center ">
                  <Button variant="link" className="text-gray-300 hover:text-primary h-auto p-0">
                    Products
                  </Button>
                  <Button variant="link" className="text-gray-300 hover:text-primary h-auto p-0">
                    Categories
                  </Button>
                  <Button variant="link" className="text-gray-300 hover:text-primary h-auto p-0">
                    Deals
                  </Button>
                  <Button variant="link" className="text-gray-300 hover:text-primary h-auto p-0">
                    New Arrivals
                  </Button>
                </nav>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-secondary">Support</h3>
                <nav className="space-y-1 text-sm gap-3 flex items-center">
                  <Button variant="link" className="text-muted-gray-300 hover:text-primary h-auto p-0">
                    Contact Us
                  </Button>
                  <Button variant="link" className="text-muted-gray-300 hover:text-primary h-auto p-0">
                    FAQ
                  </Button>
                  <Button variant="link" className="text-muted-gray-300 hover:text-primary h-auto p-0">
                    Shipping
                  </Button>
                  <Button variant="link" className="text-muted-gray-300 hover:text-primary h-auto p-0">
                    Returns
                  </Button>
                </nav>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-secondary">Social</h3>
                <div className="flex gap-4">
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-primary">
                    <FacebookIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-primary">
                    <TwitterIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-primary">
                    <InstagramIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="mt-8 border-t pt-8 text-sm text-muted-foreground ">
            <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:justify-between">
              <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
              <div className="flex gap-4">
                <Button variant="link" className="text-muted-foreground h-auto p-0">
                  Privacy Policy
                </Button>
                <Button variant="link" className="text-muted-foreground h-auto p-0">
                  Terms of Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Social Icons
function FacebookIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}