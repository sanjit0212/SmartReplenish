async function testProcessApi() {
  const url = 'https://smart-replenish.vercel.app/api/process';
  
  const payload = {
    genericJson: [
      {
        "ProductID": "1001",
        "ProductName": "Premium Wireless Headphones",
        "Category": "Electronics",
        "QuantitySold": "45",
        "CurrentStock": "10",
        "MinOrder": "30",
        "StoreName": "TechStore Downtown",
        "Chain": "TechStore"
      }
    ]
  };

  try {
    console.log(`Sending POST to ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testProcessApi();
