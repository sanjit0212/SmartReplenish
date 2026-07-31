export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { gridJson, selloutJson, genericJson } = req.body;

    // Advanced Replenishment Flow (Strict Template)
    if (gridJson && selloutJson) {
      const results = [];
      let totalSales = 0;
      const stores = new Set();
      let alertsCount = 0;
      let categorySales = { Toys: { sold: 0, stock: 0 }, Cards: { sold: 0, stock: 0 }, Plush: { sold: 0, stock: 0 }, Games: { sold: 0, stock: 0 } };

      selloutJson.forEach(sale => {
        const product = gridJson.find(p => p.ProductID == sale.ProductID);
        if (!product) return;

        const qtySold = parseInt(sale.QuantitySold) || 0;
        const stock = parseInt(sale.CurrentStock) || 0;
        const minOrder = parseInt(product.MinOrder) || 0;
        const category = product.Category || 'Other';

        stores.add(sale.StoreName || 'Default Store');
        totalSales += qtySold * 15; // Simulated revenue

        if (!categorySales[category]) categorySales[category] = { sold: 0, stock: 0 };
        categorySales[category].sold += qtySold;
        categorySales[category].stock += stock;

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
            name: product.ProductName || `Product ${sale.ProductID}`,
            chain: sale.Chain || 'Default',
            store: sale.StoreName || 'Default',
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

      const avgSellThrough = categoryData.length > 0 ? Math.round(categoryData.reduce((acc, curr) => acc + curr.sellThrough, 0) / categoryData.length) : 0;
      const sortedProducts = [...results].sort((a, b) => b.qtySold - a.qtySold);
      const topProducts = sortedProducts.slice(0, 4).map((p, i) => ({
        id: p.id + '-' + i,
        name: p.name,
        velocity: p.velocity === 'High' ? '+45%' : p.velocity === 'Medium' ? '+10%' : '-10%',
        status: p.velocity === 'High' ? 'Hot' : 'Slow',
        trend: p.velocity === 'High' ? 'up' : 'down'
      }));

      return res.status(200).json({
        gridData: gridJson,
        salesData: selloutJson,
        replenishments: results,
        kpis: {
          totalSales,
          activeStores: stores.size,
          alertsCount,
          avgSellThrough,
          categoryData,
          topProducts
        }
      });
    }

    // Generic Flow (Universal Company Data)
    if (genericJson && genericJson.length > 0) {
      // Intelligently map columns
      const sampleRow = genericJson[0];
      const keys = Object.keys(sampleRow);
      
      const findKey = (keywords) => keys.find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
      
      const prodKey = findKey(['product', 'item', 'sku', 'name', 'desc']) || keys[0];
      const salesKey = findKey(['sale', 'sold', 'qty', 'amount', 'revenue']) || keys[1] || keys[0];
      const stockKey = findKey(['stock', 'inventory', 'onhand', 'balance']);
      const categoryKey = findKey(['category', 'type', 'brand', 'group', 'dept']);

      let totalSales = 0;
      let alertsCount = 0;
      const results = [];
      const categories = {};
      
      genericJson.forEach((row, idx) => {
        const prodName = row[prodKey];
        const sales = parseFloat(row[salesKey]) || 0;
        const stock = stockKey ? (parseFloat(row[stockKey]) || 0) : 0;
        const cat = categoryKey ? (row[categoryKey] || 'General') : 'General';
        
        totalSales += sales;

        if (!categories[cat]) categories[cat] = { sold: 0, stock: 0 };
        categories[cat].sold += sales;
        categories[cat].stock += stock;

        // Generic alerts if stock is critically low compared to sales
        if (stockKey && stock < sales * 0.5 && sales > 0) {
          alertsCount++;
          results.push({
            id: `GEN-${idx}`,
            name: prodName,
            chain: 'Universal',
            store: 'Default',
            velocity: 'High',
            stock,
            minOrder: Math.ceil(sales * 1.5),
            action: 'Reorder',
            suggested: Math.ceil(sales * 1.5) - stock,
            clusterChange: 'Up',
            qtySold: sales
          });
        }
      });

      const sorted = [...genericJson].sort((a, b) => (parseFloat(b[salesKey]) || 0) - (parseFloat(a[salesKey]) || 0));
      const topProducts = sorted.slice(0, 4).map((p, i) => ({
        id: `TOP-${i}`,
        name: String(p[prodKey]).substring(0, 20),
        velocity: 'High',
        status: 'Hot',
        trend: 'up'
      }));

      const categoryData = Object.keys(categories).map(key => ({
        name: key.substring(0, 10),
        sellThrough: Math.min(100, Math.round((categories[key].sold / (categories[key].sold + categories[key].stock || 1)) * 100)),
        stock: Math.min(100, Math.round((categories[key].stock / (categories[key].sold + categories[key].stock || 1)) * 100))
      }));

      return res.status(200).json({
        gridData: [],
        salesData: genericJson,
        replenishments: results,
        kpis: {
          totalSales: Math.round(totalSales),
          activeStores: 1,
          alertsCount,
          avgSellThrough: categoryData.length ? Math.round(categoryData.reduce((acc, c) => acc + c.sellThrough, 0) / categoryData.length) : 0,
          categoryData: categoryData.slice(0, 5), // Keep pie chart clean
          topProducts
        }
      });
    }

    return res.status(400).json({ error: 'No valid data provided' });

  } catch (error) {
    console.error('Data Processing API Error:', error);
    res.status(500).json({ error: 'Failed to process data', details: error.message });
  }
}
