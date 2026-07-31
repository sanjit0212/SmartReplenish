import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [gridData, setGridData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    // Fetch default data from public/static files if they exist or just fetch the root paths
    Promise.all([
      fetch('/product_grid.csv').then(res => res.text()),
      fetch('/weekly_sellout.csv').then(res => res.text())
    ]).then(([gridText, salesText]) => {
      const grid = Papa.parse(gridText, { header: true, skipEmptyLines: true }).data;
      const sales = Papa.parse(salesText, { header: true, skipEmptyLines: true }).data;
      setGridData(grid);
      setSalesData(sales);
    }).catch(err => console.error('Failed to load default datasets:', err));
  }, []);

  // Computed data
  const { replenishments, kpis } = useMemo(() => {
    if (!gridData.length || !salesData.length) {
      return { replenishments: [], kpis: null };
    }

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

      totalSales += qtySold * 15; // Mocking a €15 average price per unit
      stores.add(sale.StoreName);
      
      if (!categorySales[category]) {
        categorySales[category] = { sold: 0, stock: 0 };
      }
      categorySales[category].sold += qtySold;
      categorySales[category].stock += stock;

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

    // Top products
    const sortedProducts = [...results].sort((a, b) => b.qtySold - a.qtySold);
    const topProducts = sortedProducts.slice(0, 4).map((p, i) => ({
      id: p.id + '-' + i,
      name: p.name,
      velocity: p.velocity === 'High' ? '+45%' : p.velocity === 'Medium' ? '+10%' : '-10%',
      status: p.velocity === 'High' ? 'Hot' : 'Slow',
      trend: p.velocity === 'High' ? 'up' : 'down'
    }));

    return {
      replenishments: results,
      kpis: {
        totalSales,
        activeStores: stores.size,
        alertsCount,
        avgSellThrough: categoryData.length > 0 ? Math.round(categoryData.reduce((acc, curr) => acc + curr.sellThrough, 0) / categoryData.length) : 0,
        categoryData,
        topProducts
      }
    };
  }, [gridData, salesData]);

  return (
    <DataContext.Provider value={{ 
      gridData, 
      setGridData, 
      salesData, 
      setSalesData,
      replenishments,
      kpis
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
