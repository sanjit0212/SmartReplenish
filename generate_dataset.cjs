const fs = require('fs');

// Generate Product Grid
const products = [
  { id: 'PRD-001', name: 'Pokémon Elite Trainer Box', category: 'Cards', minOrder: 10, cluster: 'A' },
  { id: 'PRD-002', name: 'Lego Star Wars Set', category: 'Toys', minOrder: 5, cluster: 'A' },
  { id: 'PRD-003', name: 'Hot Wheels 50-Pack', category: 'Toys', minOrder: 5, cluster: 'B' },
  { id: 'PRD-004', name: 'Barbie Dreamhouse', category: 'Toys', minOrder: 2, cluster: 'C' },
  { id: 'PRD-005', name: 'Monopoly Classic', category: 'Games', minOrder: 6, cluster: 'B' },
  { id: 'PRD-006', name: 'Uno Card Game', category: 'Cards', minOrder: 20, cluster: 'C' },
  { id: 'PRD-007', name: 'Nerf Elite Blaster', category: 'Toys', minOrder: 8, cluster: 'B' },
  { id: 'PRD-008', name: 'Catan Board Game', category: 'Games', minOrder: 4, cluster: 'A' },
  { id: 'PRD-009', name: 'Squishmallows 12"', category: 'Plush', minOrder: 15, cluster: 'A' },
  { id: 'PRD-010', name: "Rubik's Cube", category: 'Games', minOrder: 12, cluster: 'C' }
];

const stores = [
  { id: 'STR-101', name: 'Milano Centro', chain: 'Chain A' },
  { id: 'STR-102', name: 'Roma Est', chain: 'Chain B' },
  { id: 'STR-103', name: 'Torino Nord', chain: 'Chain A' },
  { id: 'STR-104', name: 'Napoli Sud', chain: 'Chain C' },
  { id: 'STR-105', name: 'Firenze Novoli', chain: 'Chain B' }
];

let gridCsv = 'ProductID,ProductName,Category,MinOrder,AssignedCluster\n';
products.forEach(p => {
  gridCsv += `${p.id},"${p.name}",${p.category},${p.minOrder},${p.cluster}\n`;
});
fs.writeFileSync('product_grid.csv', gridCsv);

let selloutCsv = 'Date,StoreID,StoreName,Chain,ProductID,QuantitySold,CurrentStock\n';
const date = '2023-10-24';

stores.forEach(store => {
  products.forEach(product => {
    // Generate random sales and stock
    const sold = Math.floor(Math.random() * 20);
    let stock = Math.floor(Math.random() * 30);
    
    // Create some specific scenarios
    if (product.id === 'PRD-001' && store.id === 'STR-101') {
      stock = 2; // Needs reorder
    }
    if (product.id === 'PRD-003' && store.id === 'STR-103') {
      stock = 45; // Overstocked
    }
    
    selloutCsv += `${date},${store.id},"${store.name}",${store.chain},${product.id},${sold},${stock}\n`;
  });
});

fs.writeFileSync('weekly_sellout.csv', selloutCsv);

console.log('Datasets generated successfully: product_grid.csv and weekly_sellout.csv');
