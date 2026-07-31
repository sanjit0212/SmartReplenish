const fs = require('fs');

const categories = ['Electronics', 'Furniture', 'Fitness', 'Accessories', 'Toys', 'Books', 'Home Goods', 'Apparel'];
const chains = ['TechStore', 'FurniCo', 'SportsWorld', 'MegaMart', 'BookHaven'];
const stores = ['Downtown', 'Uptown', 'Central', 'East', 'West', 'North', 'South', 'Mall', 'Plaza', 'Outlet'];
const products = [
  { name: 'Wireless Headphones', min: 30, max: 200 },
  { name: 'Ergonomic Chair', min: 10, max: 60 },
  { name: 'Mechanical Keyboard', min: 40, max: 150 },
  { name: 'Water Bottle', min: 50, max: 300 },
  { name: 'Yoga Mat', min: 20, max: 100 },
  { name: 'Bluetooth Speaker', min: 25, max: 120 },
  { name: 'Desk Lamp', min: 20, max: 80 },
  { name: 'Running Shoes', min: 40, max: 150 },
  { name: 'Coffee Maker', min: 15, max: 60 },
  { name: 'Fitness Tracker', min: 30, max: 150 },
  { name: 'Gaming Mouse', min: 40, max: 200 },
  { name: 'Laptop Stand', min: 30, max: 120 },
  { name: 'Action Figure Set', min: 15, max: 80 },
  { name: 'Sci-Fi Novel', min: 20, max: 100 },
  { name: 'Cotton T-Shirt', min: 50, max: 400 },
  { name: 'Denim Jeans', min: 30, max: 200 },
  { name: 'Throw Pillow', min: 20, max: 150 },
  { name: 'Smart Watch', min: 20, max: 100 },
  { name: 'Resistance Bands', min: 40, max: 250 },
  { name: 'Standing Desk', min: 5, max: 20 }
];

const data = [];
data.push("ProductID,ProductName,Category,QuantitySold,CurrentStock,MinOrder,StoreName,Chain");

for (let i = 1; i <= 150; i++) {
  const prod = products[Math.floor(Math.random() * products.length)];
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const chain = chains[Math.floor(Math.random() * chains.length)];
  const store = `${chain} ${stores[Math.floor(Math.random() * stores.length)]}`;
  
  // Create interesting data patterns (some high sales, some low stock)
  const qtySold = Math.floor(Math.random() * prod.max);
  let currentStock = Math.floor(Math.random() * prod.max);
  const minOrder = prod.min;
  
  // Force some alerts (High sales, low stock)
  if (i % 5 === 0) {
    currentStock = Math.floor(Math.random() * (minOrder / 2));
  }
  
  // Force some overstock transfers (Low sales, high stock)
  if (i % 7 === 0) {
    currentStock = Math.floor(Math.random() * prod.max) + (minOrder * 2);
  }

  data.push(`10${i.toString().padStart(3, '0')},${prod.name},${cat},${qtySold},${currentStock},${minOrder},${store},${chain}`);
}

fs.writeFileSync('universal_sales_data.csv', data.join('\n'));
console.log('universal_sales_data.csv created successfully with 150 rows.');
