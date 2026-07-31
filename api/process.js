import { parse } from 'csv-parse/sync';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { gridCsv, selloutCsv } = req.body;

    if (!gridCsv || !selloutCsv) {
      return res.status(400).json({ error: 'Missing gridCsv or selloutCsv in request body' });
    }

    // Parse CSVs
    const gridData = parse(gridCsv, { columns: true, skip_empty_lines: true, trim: true });
    const salesData = parse(selloutCsv, { columns: true, skip_empty_lines: true, trim: true });

    // Execute replenishment algorithm
    const results = [];
    let totalSales = 0;
    const stores = new Set();
    let alertsCount = 0;

    let categorySales = { Toys: { sold: 0, stock: 0 }, Cards: { sold: 0, stock: 0 }, Plush: { sold: 0, stock: 0 }, Games: { sold: 0, stock: 0 } };

    salesData.forEach(sale => {
      const product = gridData.find(p => p.ProductID === sale.ProductID);
      if (!product) return;

      const qtySold = parseInt(sale.QuantitySold) || 0;
      const stock = parseInt(sale.CurrentStock) || 0;
      const minOrder = parseInt(product.MinOrder) || 0;

      stores.add(sale.StoreName);
      totalSales += qtySold * 15; // Simulated revenue logic

      if (!categorySales[product.Category]) {
        categorySales[product.Category] = { sold: 0, stock: 0 };
      }
      categorySales[product.Category].sold += qtySold;
      categorySales[product.Category].stock += stock;

      // Rules engine
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

    // Compute KPIs
    const categoryData = Object.keys(categorySales).map(key => {
      const data = categorySales[key];
      const total = data.sold + data.stock;
      return {
        name: key,
        sellThrough: total > 0 ? Math.round((data.sold / total) * 100) : 0,
        stock: total > 0 ? Math.round((data.stock / total) * 100) : 0,
      };
    });

    const avgSellThrough = categoryData.length > 0 ? Math.round(categoryData.reduce((acc, curr) => acc + curr.sellThrough, 0) / categoryData.length) : 0;

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
      avgSellThrough,
      categoryData,
      topProducts
    };

    // Vercel serverless function size limit can be an issue if we return HUGE JSON payloads. 
    // We will return everything, but Vercel limits are generous enough for 5MB payloads.
    res.status(200).json({
      gridData,
      salesData,
      replenishments: results,
      kpis
    });
  } catch (error) {
    console.error('Data Processing API Error:', error);
    res.status(500).json({ error: 'Failed to process data', details: error.message });
  }
}
