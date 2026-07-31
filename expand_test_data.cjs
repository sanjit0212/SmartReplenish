const fs = require('fs');
const path = require('path');

const gridPath = 'c:/Users/sanji/OneDrive/Desktop/test_client_grid.csv';
const selloutPath = 'c:/Users/sanji/OneDrive/Desktop/test_client_sellout.csv';

// Expanded product grid
const products = [
  { id: 'PRD-900', name: 'PlayStation 5 Console', category: 'Games', min: 2, cluster: 'A' },
  { id: 'PRD-901', name: 'Monopoly Vintage Edition', category: 'Games', min: 5, cluster: 'B' },
  { id: 'PRD-902', name: 'Magic The Gathering Booster', category: 'Cards', min: 20, cluster: 'A' },
  { id: 'PRD-903', name: 'Lego Millennium Falcon', category: 'Toys', min: 1, cluster: 'C' },
  { id: 'PRD-904', name: 'Nerf Pro Gelfire', category: 'Toys', min: 10, cluster: 'B' },
  { id: 'PRD-905', name: 'Catan Board Game', category: 'Games', min: 4, cluster: 'A' },
  { id: 'PRD-906', name: 'Squishmallows 16"', category: 'Plush', min: 15, cluster: 'B' },
  { id: 'PRD-907', name: 'Pokemon TCG Elite Box', category: 'Cards', min: 8, cluster: 'A' },
  { id: 'PRD-908', name: 'Barbie Dreamhouse', category: 'Toys', min: 2, cluster: 'C' },
  { id: 'PRD-909', name: 'Nintendo Switch OLED', category: 'Games', min: 3, cluster: 'A' },
  { id: 'PRD-910', name: 'Jenga Classic', category: 'Games', min: 12, cluster: 'B' },
  { id: 'PRD-911', name: 'Hot Wheels 20-Car Pack', category: 'Toys', min: 15, cluster: 'B' },
  { id: 'PRD-912', name: 'Uno Flip!', category: 'Cards', min: 30, cluster: 'A' },
  { id: 'PRD-913', name: 'Giant Teddy Bear', category: 'Plush', min: 3, cluster: 'C' },
  { id: 'PRD-914', name: 'Rubiks Cube 3x3', category: 'Toys', min: 25, cluster: 'A' }
];

let gridCsv = 'ProductID,ProductName,Category,MinOrder,AssignedCluster\n';
products.forEach(p => {
  gridCsv += `${p.id},${p.name},${p.category},${p.min},${p.cluster}\n`;
});

// Expanded sellout data across multiple stores
const chains = ['GameStop', 'Target', 'Walmart'];
const stores = [
  { name: 'NYC Flagship', chain: 'GameStop' },
  { name: 'Brooklyn Center', chain: 'Target' },
  { name: 'Queens Plaza', chain: 'Walmart' },
  { name: 'Hoboken Mall', chain: 'Target' },
  { name: 'Jersey City', chain: 'GameStop' }
];

let selloutCsv = 'ProductID,StoreName,Chain,QuantitySold,CurrentStock\n';

products.forEach(p => {
  // Generate random data for each product in 2-3 stores
  const numStores = Math.floor(Math.random() * 3) + 2; 
  const shuffledStores = stores.sort(() => 0.5 - Math.random()).slice(0, numStores);

  shuffledStores.forEach(store => {
    // Randomize sold and stock based on min order to trigger different rules
    const qtySold = Math.floor(Math.random() * (p.min * 3));
    const stock = Math.floor(Math.random() * (p.min * 2));
    
    selloutCsv += `${p.id},${store.name},${store.chain},${qtySold},${stock}\n`;
  });
});

fs.writeFileSync(gridPath, gridCsv);
fs.writeFileSync(selloutPath, selloutCsv);

console.log('Successfully expanded test CSV files!');
