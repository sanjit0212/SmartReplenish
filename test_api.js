import fs from 'fs';
import { parse } from 'csv-parse/sync';

const gridCsv = fs.readFileSync('c:/Users/sanji/OneDrive/Desktop/test_client_grid.csv', 'utf-8');
const selloutCsv = fs.readFileSync('c:/Users/sanji/OneDrive/Desktop/test_client_sellout.csv', 'utf-8');

try {
  // Parse CSVs
  const gridData = parse(gridCsv, { columns: true, skip_empty_lines: true, trim: true, relax_quotes: true });
  const salesData = parse(selloutCsv, { columns: true, skip_empty_lines: true, trim: true, relax_quotes: true });

  console.log("Parsed grid:", gridData.length);
  console.log("Parsed sales:", salesData.length);

  // Exec logic
  const results = [];
  let totalSales = 0;
  const stores = new Set();
  let alertsCount = 0;
  let categorySales = { Toys: { sold: 0, stock: 0 }, Cards: { sold: 0, stock: 0 }, Plush: { sold: 0, stock: 0 }, Games: { sold: 0, stock: 0 } };

  salesData.forEach(sale => {
    const product = gridData.find(p => p.ProductID === sale.ProductID);
    if (!product) {
      console.log(`Product not found: ${sale.ProductID}`);
      return;
    }

    const qtySold = parseInt(sale.QuantitySold) || 0;
    const stock = parseInt(sale.CurrentStock) || 0;
    const minOrder = parseInt(product.MinOrder) || 0;

    stores.add(sale.StoreName);
    totalSales += qtySold * 15; 

    if (!categorySales[product.Category]) {
      categorySales[product.Category] = { sold: 0, stock: 0 };
    }
    categorySales[product.Category].sold += qtySold;
    categorySales[product.Category].stock += stock;

    let velocity = 'Low';
    let action = 'None';
    let clusterChange = 'None';
    let suggested = 0;

    if (qtySold > minOrder * 2) {
      velocity = 'High';
      action = 'Reorder';
      suggested = qtySold * 2;
      clusterChange = 'Up';
      alertsCount++;
    } else if (stock < minOrder) {
      velocity = 'Medium';
      action = 'Reorder';
      suggested = minOrder - stock;
      alertsCount++;
    } else if (qtySold === 0 && stock > minOrder * 2) {
      velocity = 'Low';
      action = 'Transfer';
      clusterChange = 'Down';
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

  console.log("Success");
} catch (err) {
  console.error(err);
}
