const fs = require('fs');

const data = [
  "ProductID,ProductName,Category,QuantitySold,CurrentStock,MinOrder,StoreName,Chain",
  "1001,Premium Wireless Headphones,Electronics,45,10,30,TechStore Downtown,TechStore",
  "1002,Ergonomic Office Chair,Furniture,12,50,15,FurniCo Mall,FurniCo",
  "1003,Mechanical Keyboard,Electronics,85,5,40,TechStore Uptown,TechStore",
  "1004,Stainless Steel Water Bottle,Accessories,120,200,50,SportsWorld Central,SportsWorld",
  "1005,Yoga Mat Pro,Fitness,0,45,20,SportsWorld Central,SportsWorld",
  "1006,Bluetooth Speaker,Electronics,60,15,25,TechStore Downtown,TechStore",
  "1007,LED Desk Lamp,Furniture,30,60,20,FurniCo Mall,FurniCo",
  "1008,Running Shoes,Fitness,95,12,50,SportsWorld East,SportsWorld"
];

fs.writeFileSync('universal_sales_data.csv', data.join('\n'));
console.log('universal_sales_data.csv created successfully.');
