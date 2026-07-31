import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export default function handler(req, res) {
  try {
    // Read the datasets
    const gridPath = path.join(process.cwd(), 'product_grid.csv');
    const selloutPath = path.join(process.cwd(), 'weekly_sellout.csv');
    
    const grids = parse(fs.readFileSync(gridPath, 'utf8'), { columns: true, skip_empty_lines: true });
    const sales = parse(fs.readFileSync(selloutPath, 'utf8'), { columns: true, skip_empty_lines: true });

    // Process the data for the replenishment engine
    const results = [];

    sales.forEach(sale => {
      const product = grids.find(p => p.ProductID === sale.ProductID);
      if (!product) return;

      const qtySold = parseInt(sale.QuantitySold);
      const stock = parseInt(sale.CurrentStock);
      const minOrder = parseInt(product.MinOrder);

      // Simple velocity algorithm
      let velocity = 'Medium';
      if (qtySold > 15) velocity = 'High';
      else if (qtySold < 5) velocity = 'Low';

      // Replenishment Action
      let action = 'None';
      let suggested = 0;
      let clusterChange = 'None';

      if (stock <= minOrder) {
        action = 'Reorder';
        suggested = minOrder * 2 - stock;
      } else if (velocity === 'Low' && stock > minOrder * 3) {
        action = 'Transfer';
        clusterChange = 'Decrease';
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
          clusterChange
        });
      }
    });

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process replenishment data' });
  }
}
