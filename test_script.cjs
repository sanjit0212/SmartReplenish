const Papa = require('papaparse');
const fs = require('fs');

const gridText = fs.readFileSync('c:/Users/sanji/OneDrive/Desktop/test_client_grid.csv', 'utf8');
const salesText = fs.readFileSync('c:/Users/sanji/OneDrive/Desktop/test_client_sellout.csv', 'utf8');

const gridData = Papa.parse(gridText, { header: true, skipEmptyLines: true }).data;
const salesData = Papa.parse(salesText, { header: true, skipEmptyLines: true }).data;

const results = [];
let totalSales = 0;
let categorySales = { Toys: { sold: 0, stock: 0 }, Cards: { sold: 0, stock: 0 }, Plush: { sold: 0, stock: 0 }, Games: { sold: 0, stock: 0 } };
const stores = new Set();
let alertsCount = 0;

salesData.forEach(sale => {
  const product = gridData.find(p => p.ProductID === sale.ProductID);
  if (!product) return;

  const qtySold = parseInt(sale.QuantitySold) || 0;
  const stock = parseInt(sale.CurrentStock) || 0;
  const minOrder = parseInt(product.MinOrder) || 0;
  const category = product.Category || 'Toys';

  totalSales += qtySold * 15;
  stores.add(sale.StoreName);
  
  if (!categorySales[category]) {
    categorySales[category] = { sold: 0, stock: 0 };
  }
  categorySales[category].sold += qtySold;
  categorySales[category].stock += stock;

  let velocity = 'Medium';
  if (qtySold > 15) velocity = 'High';
  else if (qtySold < 5) velocity = 'Low';

  let action = 'None';
  let suggested = 0;
  let clusterChange = 'None';

  if (stock <= minOrder) {
    action = 'Reorder';
    suggested = minOrder * 2 - stock;
    alertsCount++;
  } else if (velocity === 'Low' && stock > minOrder * 3) {
    action = 'Transfer';
    clusterChange = 'Decrease';
    alertsCount++;
  } else if (velocity === 'High' && stock < minOrder * 2) {
    clusterChange = 'Increase';
  } else if (velocity === 'Low' && stock > minOrder) {
    action = 'Flag';
  }

  if (action !== 'None' || clusterChange !== 'None') {
    results.push({
      id: sale.ProductID,
      name: product.ProductName,
      chain: sale.Chain,
      store: sale.StoreName,
      velocity,
      stock,
      minOrder,
      action,
      suggested,
      clusterChange,
      qtySold
    });
  }
});

const categoryData = Object.keys(categorySales).map(key => {
  const data = categorySales[key];
  const total = data.sold + data.stock;
  return {
    name: key,
    sellThrough: total > 0 ? Math.round((data.sold / total) * 100) : 0,
    stock: total > 0 ? Math.round((data.stock / total) * 100) : 0,
  };
});

const sortedProducts = [...results].sort((a, b) => b.qtySold - a.qtySold);
const topProducts = sortedProducts.slice(0, 4).map((p, i) => ({
  id: p.id + '-' + i,
  name: p.name,
  velocity: p.velocity === 'High' ? '+45%' : p.velocity === 'Medium' ? '+10%' : '-10%',
  status: p.velocity === 'High' ? 'Hot' : 'Slow',
  trend: p.velocity === 'High' ? 'up' : 'down'
}));

const kpis = {
  totalSales,
  activeStores: stores.size,
  alertsCount,
  avgSellThrough: categoryData.length > 0 ? Math.round(categoryData.reduce((acc, curr) => acc + curr.sellThrough, 0) / categoryData.length) : 0,
  categoryData,
  topProducts
};

console.log(JSON.stringify(kpis, null, 2));

const trendData = [
  { name: 'Week 1', sales: 4000 },
  { name: 'Week 2', sales: 3000 },
  { name: 'Week 3', sales: 2000 },
  { name: 'Week 4', sales: 2780 },
  { name: 'Week 5', sales: 1890 },
  { name: 'Week 6', sales: 2390 },
  { name: 'Week 7 (Current)', sales: 0 },
];
trendData[6].sales = kpis.totalSales;

console.log("trendData:", trendData);
