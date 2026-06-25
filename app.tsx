import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Plus, Trash2, Package, Zap, Check, Printer, Camera, X } from 'lucide-react';
import JsBarcode from 'jsbarcode';

const NashloreInventoryDashboard = () => {
  // ============ STATE ============
  const [view, setView] = useState('dashboard');
  const [skus, setSKUs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [productionBatches, setProductionBatches] = useState([]);
  const [skuBatchCounters, setSKUBatchCounters] = useState({}); // Track batch numbers per SKU

  // Modal/Form states
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showPullForm, setShowPullForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Form inputs
  const [recipeForm, setRecipeForm] = useState({ skuId: '', ingredients: [] });
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    onHand: '',
    unit: 'g',
    cost: '',
    expirationDate: '',
    reorderThreshold: '',
  });
  const [productionForm, setProductionForm] = useState({
    skuId: '',
    totalBonbons: '',
    boxesCount: '',
    freezeDate: '',
    boxStatuses: {}, // { boxNumber: 'Frozen' | 'Ready' }
  });
  const [saleForm, setSaleForm] = useState({ skuId: '', quantity: '', status: 'Frozen' });
  const [pullForm, setPullForm] = useState({ batchId: '', boxNumber: '' });
  const [cameraInput, setCameraInput] = useState('');

  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  // ============ INITIALIZE FROM LOCALSTORAGE ============
  useEffect(() => {
    const saved = localStorage.getItem('nashlore_inventory_v2');
    if (saved) {
      const data = JSON.parse(saved);
      setSKUs(data.skus || []);
      setRecipes(data.recipes || []);
      setIngredients(data.ingredients || []);
      setProductionBatches(data.productionBatches || []);
      setSKUBatchCounters(data.skuBatchCounters || {});
    } else {
      // Nashlore Production Data
      const realSKUs = [
        { id: 'sku_1', name: 'Nashville Gold (Signature Caramel)', yield: 100 },
        { id: 'sku_2', name: 'Milk Chocolate Ganache', yield: 100 },
        { id: 'sku_3', name: 'Midnight on Broadway (Dark Chocolate Ganache)', yield: 100 },
      ];
      setSKUs(realSKUs);

      const realIngredients = [
        {
          id: 'ing_1',
          name: 'Cream 36%',
          onHand: 5690,
          unit: 'g',
          cost: 0.12,
          expirationDate: '2026-08-30',
          reorderThreshold: 500,
        },
        {
          id: 'ing_2',
          name: 'Glucose',
          onHand: 2000,
          unit: 'g',
          cost: 0.08,
          expirationDate: '2026-12-31',
          reorderThreshold: 200,
        },
        {
          id: 'ing_3',
          name: 'Golden Syrup',
          onHand: 2500,
          unit: 'g',
          cost: 0.10,
          expirationDate: '2026-10-15',
          reorderThreshold: 250,
        },
        {
          id: 'ing_4',
          name: 'Butter',
          onHand: 1810,
          unit: 'g',
          cost: 0.15,
          expirationDate: '2026-09-15',
          reorderThreshold: 200,
        },
        {
          id: 'ing_5',
          name: 'Sugar',
          onHand: 2000,
          unit: 'g',
          cost: 0.06,
          expirationDate: '2027-01-31',
          reorderThreshold: 300,
        },
        {
          id: 'ing_6',
          name: 'Invert sugar',
          onHand: 730,
          unit: 'g',
          cost: 0.12,
          expirationDate: '2026-11-30',
          reorderThreshold: 100,
        },
        {
          id: 'ing_7',
          name: 'Salt',
          onHand: 110,
          unit: 'g',
          cost: 0.02,
          expirationDate: '2027-06-30',
          reorderThreshold: 20,
        },
        {
          id: 'ing_8',
          name: 'Caramel Chocolate',
          onHand: 500,
          unit: 'g',
          cost: 0.18,
          expirationDate: '2026-09-30',
          reorderThreshold: 100,
        },
        {
          id: 'ing_9',
          name: 'Sao Palme 36%',
          onHand: 3050,
          unit: 'g',
          cost: 0.20,
          expirationDate: '2026-10-30',
          reorderThreshold: 400,
        },
        {
          id: 'ing_10',
          name: 'Sao Palme dark 75%',
          onHand: 1900,
          unit: 'g',
          cost: 0.22,
          expirationDate: '2026-10-30',
          reorderThreshold: 300,
        },
        {
          id: 'ing_11',
          name: 'Water',
          onHand: 250,
          unit: 'ml',
          cost: 0.00,
          expirationDate: '2027-12-31',
          reorderThreshold: 100,
        },
      ];
      setIngredients(realIngredients);

      const realRecipes = [
        {
          id: 'recipe_1',
          skuId: 'sku_1',
          ingredients: [
            { ingredientId: 'ing_1', quantity: 361 },
            { ingredientId: 'ing_2', quantity: 100 },
            { ingredientId: 'ing_3', quantity: 250 },
            { ingredientId: 'ing_4', quantity: 80 },
            { ingredientId: 'ing_5', quantity: 200 },
            { ingredientId: 'ing_7', quantity: 9 },
            { ingredientId: 'ing_8', quantity: 50 },
          ],
        },
        {
          id: 'recipe_2',
          skuId: 'sku_2',
          ingredients: [
            { ingredientId: 'ing_1', quantity: 141 },
            { ingredientId: 'ing_6', quantity: 16 },
            { ingredientId: 'ing_9', quantity: 305 },
            { ingredientId: 'ing_4', quantity: 39 },
            { ingredientId: 'ing_7', quantity: 1 },
          ],
        },
        {
          id: 'recipe_3',
          skuId: 'sku_3',
          ingredients: [
            { ingredientId: 'ing_1', quantity: 67 },
            { ingredientId: 'ing_11', quantity: 25 },
            { ingredientId: 'ing_2', quantity: 100 },
            { ingredientId: 'ing_6', quantity: 57 },
            { ingredientId: 'ing_10', quantity: 190 },
            { ingredientId: 'ing_4', quantity: 62 },
            { ingredientId: 'ing_7', quantity: 1 },
          ],
        },
      ];
      setRecipes(realRecipes);

      // Initialize batch counters
      setSKUBatchCounters({ sku_1: 0, sku_2: 0, sku_3: 0 });
    }
  }, []);

  // ============ PERSIST TO LOCALSTORAGE ============
  useEffect(() => {
    localStorage.setItem(
      'nashlore_inventory_v2',
      JSON.stringify({ skus, recipes, ingredients, productionBatches, skuBatchCounters })
    );
  }, [skus, recipes, ingredients, productionBatches, skuBatchCounters]);

  // ============ RECIPE MANAGEMENT ============
  const addRecipe = () => {
    if (!recipeForm.skuId || recipeForm.ingredients.length === 0) return;
    const recipe = {
      id: `recipe_${Date.now()}`,
      skuId: recipeForm.skuId,
      ingredients: recipeForm.ingredients,
    };
    setRecipes([...recipes, recipe]);
    setRecipeForm({ skuId: '', ingredients: [] });
    setShowRecipeForm(false);
  };

  const addRecipeIngredient = (ingredientId, quantity) => {
    if (!ingredientId || !quantity) return;
    const exists = recipeForm.ingredients.find((i) => i.ingredientId === ingredientId);
    if (!exists) {
      setRecipeForm({
        ...recipeForm,
        ingredients: [
          ...recipeForm.ingredients,
          { ingredientId, quantity: parseFloat(quantity) },
        ],
      });
    }
  };

  const removeRecipeIngredient = (ingredientId) => {
    setRecipeForm({
      ...recipeForm,
      ingredients: recipeForm.ingredients.filter((i) => i.ingredientId !== ingredientId),
    });
  };

  // ============ INGREDIENT MANAGEMENT ============
  const addIngredient = () => {
    if (!ingredientForm.name || !ingredientForm.onHand || !ingredientForm.expirationDate)
      return;
    const ingredient = {
      id: `ing_${Date.now()}`,
      name: ingredientForm.name,
      onHand: parseFloat(ingredientForm.onHand),
      unit: ingredientForm.unit,
      cost: parseFloat(ingredientForm.cost) || 0,
      expirationDate: ingredientForm.expirationDate,
      reorderThreshold: parseFloat(ingredientForm.reorderThreshold) || 0,
    };
    setIngredients([...ingredients, ingredient]);
    setIngredientForm({
      name: '',
      onHand: '',
      unit: 'g',
      cost: '',
      expirationDate: '',
      reorderThreshold: '',
    });
    setShowIngredientForm(false);
  };

  const updateIngredient = (id, updates) => {
    setIngredients(
      ingredients.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing))
    );
  };

  // ============ PRODUCTION WORKFLOW ============
  const startProduction = () => {
    if (!productionForm.skuId || !productionForm.totalBonbons || !productionForm.boxesCount)
      return;

    const recipe = recipes.find((r) => r.skuId === productionForm.skuId);
    if (!recipe) {
      alert('No recipe found for this SKU');
      return;
    }

    // Deduct ingredients
    const updatedIngredients = [...ingredients];
    recipe.ingredients.forEach((recipeIng) => {
      const ingredientIndex = updatedIngredients.findIndex(
        (i) => i.id === recipeIng.ingredientId
      );
      if (ingredientIndex >= 0) {
        updatedIngredients[ingredientIndex].onHand -= recipeIng.quantity;
      }
    });
    setIngredients(updatedIngredients);

    // Increment batch counter for this SKU
    const newCounter = (skuBatchCounters[productionForm.skuId] || 0) + 1;
    setSKUBatchCounters({ ...skuBatchCounters, [productionForm.skuId]: newCounter });

    // Get SKU code for batch numbering
    const skuCode = productionForm.skuId.replace('sku_', '');
    const batchNumber = `${skuCode}-${String(newCounter).padStart(3, '0')}`;

    // Create boxes with individual status
    const boxesCount = parseInt(productionForm.boxesCount);
    const bonbonsPerBox = parseInt(productionForm.totalBonbons) / boxesCount;
    const boxes = Array.from({ length: boxesCount }, (_, i) => ({
      id: `box_${Date.now()}_${i}`,
      boxNumber: i + 1,
      bonbonsPerBox: bonbonsPerBox,
      barcode: `NASH${Date.now().toString().slice(-8)}${String(i + 1).padStart(2, '0')}`,
      status: productionForm.boxStatuses[i + 1] || 'Frozen',
      pullDate: null,
    }));

    const batch = {
      id: `batch_${Date.now()}`,
      batchNumber: batchNumber,
      skuId: productionForm.skuId,
      productionDate: new Date().toISOString().split('T')[0],
      freezeDate: productionForm.freezeDate || null,
      totalBonbons: parseInt(productionForm.totalBonbons),
      boxes: boxes,
    };

    setProductionBatches([...productionBatches, batch]);
    setProductionForm({
      skuId: '',
      totalBonbons: '',
      boxesCount: '',
      freezeDate: '',
      boxStatuses: {},
    });
    setShowProductionForm(false);
  };

  // ============ PULL FROM FREEZER ============
  const pullFromFreezer = () => {
    if (!pullForm.batchId || !pullForm.boxNumber) return;

    setProductionBatches(
      productionBatches.map((batch) => {
        if (batch.id === pullForm.batchId) {
          return {
            ...batch,
            boxes: batch.boxes.map((box) =>
              parseInt(box.boxNumber) === parseInt(pullForm.boxNumber)
                ? { ...box, status: 'Ready' }
                : box
            ),
          };
        }
        return batch;
      })
    );

    setPullForm({ batchId: '', boxNumber: '' });
    setShowPullForm(false);
  };

  // ============ SALE WORKFLOW (FIFO) ============
  const recordSale = () => {
    if (!saleForm.skuId || !saleForm.quantity) return;

    const quantityToSell = parseInt(saleForm.quantity);
    let remainingQty = quantityToSell;

    // Find all batches of this SKU with the requested status, sorted by batch number (FIFO)
    const batchesOfSKU = productionBatches
      .filter((b) => b.skuId === saleForm.skuId)
      .sort((a, b) => a.batchNumber.localeCompare(b.batchNumber));

    const updatedBatches = productionBatches.map((batch) => {
      if (batch.skuId !== saleForm.skuId) return batch;

      let updatedBoxes = [...batch.boxes];
      updatedBoxes = updatedBoxes.map((box) => {
        if (remainingQty <= 0 || box.status !== saleForm.status) return box;

        const qtyFromBox = Math.min(remainingQty, box.bonbonsRemaining || box.bonbonsPerBox);
        remainingQty -= qtyFromBox;

        return {
          ...box,
          bonbonsRemaining: (box.bonbonsRemaining || box.bonbonsPerBox) - qtyFromBox,
        };
      });

      return { ...batch, boxes: updatedBoxes };
    });

    if (remainingQty > 0) {
      alert(`Not enough bonbons available. Short by ${remainingQty}.`);
      return;
    }

    setProductionBatches(updatedBatches);
    setSaleForm({ skuId: '', quantity: '', status: 'Frozen' });
    setShowSaleForm(false);
  };

  // ============ INVENTORY CALCULATIONS ============
  const getInventoryByStatus = (skuId, status) => {
    return productionBatches
      .filter((b) => b.skuId === skuId)
      .reduce((total, batch) => {
        const boxQty = batch.boxes
          .filter((box) => box.status === status)
          .reduce((sum, box) => sum + (box.bonbonsRemaining ?? box.bonbonsPerBox), 0);
        return total + boxQty;
      }, 0);
  };

  const getTotalInventory = (skuId) => {
    return productionBatches
      .filter((b) => b.skuId === skuId)
      .reduce((total, batch) => {
        const boxQty = batch.boxes.reduce(
          (sum, box) => sum + (box.bonbonsRemaining ?? box.bonbonsPerBox),
          0
        );
        return total + boxQty;
      }, 0);
  };

  // ============ ALERTS & STATUS ============
  const lowStockAlerts = ingredients.filter(
    (ing) => ing.onHand <= ing.reorderThreshold && ing.reorderThreshold > 0
  );

  const expiringAlerts = ingredients.filter((ing) => {
    const expiryDate = new Date(ing.expirationDate);
    const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 14 && daysUntilExpiry >= 0;
  });

  // ============ UTILITIES ============
  const getSkuName = (skuId) => skus.find((s) => s.id === skuId)?.name || 'Unknown';
  const getIngredientName = (ingId) => ingredients.find((i) => i.id === ingId)?.name || 'Unknown';

  const printBatchLabel = (box, batch) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
      <head>
        <title>Batch Label</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }
          .label { border: 2px solid #333; padding: 20px; width: 400px; margin: 0 auto; }
          h2 { margin: 0 0 10px 0; }
          .info { margin: 10px 0; font-size: 14px; text-align: left; }
          .barcode { margin: 20px 0; }
          svg { max-width: 300px; }
          .line { border-bottom: 1px solid #000; width: 150px; display: inline-block; margin-top: 5px; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <div class="label">
          <h2>${getSkuName(batch.skuId)}</h2>
          <div class="info"><strong>Batch:</strong> ${batch.batchNumber}</div>
          <div class="info"><strong>Box:</strong> ${box.boxNumber}</div>
          <div class="info"><strong>Production:</strong> ${batch.productionDate}</div>
          <div class="info"><strong>Frozen:</strong> ${batch.freezeDate || 'N/A'}</div>
          <div class="info"><strong>Bonbons:</strong> ${Math.round(box.bonbonsPerBox)}</div>
          <div class="info" style="margin-top: 15px;"><strong>Pull Date:</strong> <div class="line"></div></div>
          <div class="barcode">
            <svg id="barcode"></svg>
          </div>
          <div class="info" style="font-weight: bold; text-align: center;">${box.barcode}</div>
        </div>
        <script>
          JsBarcode("#barcode", "${box.barcode}", { format: "CODE128", width: 2, height: 50 });
          setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ============ RENDER ============
  return (
    <div style={{ background: '#faf9f7', minHeight: '100vh', fontFamily: 'system-ui' }}>
      {/* HEADER */}
      <div
        style={{
          background: '#3d2817',
          color: '#faf9f7',
          padding: '20px 30px',
          borderBottom: '3px solid #d4a574',
        }}
      >
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: 600 }}>
          Nashlore Inventory v2
        </h1>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>
          Batch tracking • FIFO sales • Frozen/Ready inventory
        </p>
      </div>

      {/* NAV */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e0ddd8' }}>
        {[
          ['dashboard', '📊 Dashboard'],
          ['recipes', '📋 Recipes'],
          ['ingredients', '📦 Ingredients'],
          ['production', '⚙️ Production'],
          ['sales', '💰 Sales'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: view === key ? '#d4a574' : 'transparent',
              color: view === key ? '#fff' : '#3d2817',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px' }}>
        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div>
            {/* Alerts */}
            {(lowStockAlerts.length > 0 || expiringAlerts.length > 0) && (
              <div
                style={{
                  background: '#fef3cd',
                  border: '1px solid #daa520',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '30px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <AlertCircle size={20} style={{ color: '#856404' }} />
                  <h3 style={{ margin: 0, color: '#856404' }}>Attention needed</h3>
                </div>
                {lowStockAlerts.length > 0 && (
                  <div>
                    <strong>Low stock:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {lowStockAlerts.map((ing) => (
                        <li key={ing.id}>
                          {ing.name}: {ing.onHand.toFixed(0)}/{ing.reorderThreshold} {ing.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {expiringAlerts.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Expiring soon:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {expiringAlerts.map((ing) => (
                        <li key={ing.id}>
                          {ing.name}: {ing.expirationDate}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Inventory Summary */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#3d2817', marginBottom: '15px' }}>Finished Goods Inventory</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {skus.map((sku) => {
                  const frozen = getInventoryByStatus(sku.id, 'Frozen');
                  const ready = getInventoryByStatus(sku.id, 'Ready');
                  const total = getTotalInventory(sku.id);

                  return (
                    <div
                      key={sku.id}
                      style={{
                        background: '#fff',
                        border: '2px solid #d4a574',
                        borderRadius: '8px',
                        padding: '20px',
                      }}
                    >
                      <h4 style={{ margin: '0 0 15px 0', color: '#3d2817' }}>{sku.name}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Frozen</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3d2817' }}>
                            {Math.round(frozen)}
                          </div>
                        </div>
                        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Ready</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6ba388' }}>
                            {Math.round(ready)}
                          </div>
                        </div>
                        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3d2817' }}>
                            {Math.round(total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ingredient Status */}
            <div>
              <h2 style={{ color: '#3d2817', marginBottom: '15px' }}>Raw Ingredients</h2>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0ddd8',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #e0ddd8' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        Ingredient
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        On Hand
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        Expires
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ing) => {
                      const daysUntilExpiry = Math.floor(
                        (new Date(ing.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
                      );
                      const isLow = ing.onHand <= ing.reorderThreshold;
                      const isExpiringSoon = daysUntilExpiry <= 14 && daysUntilExpiry >= 0;
                      return (
                        <tr
                          key={ing.id}
                          style={{
                            borderBottom: '1px solid #e0ddd8',
                            background: isLow || isExpiringSoon ? '#fffacd' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '12px' }}>{ing.name}</td>
                          <td style={{ padding: '12px' }}>
                            {ing.onHand.toFixed(0)} {ing.unit}
                          </td>
                          <td style={{ padding: '12px' }}>{ing.expirationDate}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {isLow && (
                              <span style={{ background: '#d4a574', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                                Low
                              </span>
                            )}
                            {isExpiringSoon && (
                              <span style={{ background: '#d17e7e', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', marginLeft: '5px' }}>
                                Soon
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* RECIPES VIEW */}
        {view === 'recipes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#3d2817' }}>Recipe Library</h2>
              <button
                onClick={() => setShowRecipeForm(true)}
                style={{
                  background: '#d4a574',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                + New Recipe
              </button>
            </div>

            {recipes.map((recipe) => {
              const sku = skus.find((s) => s.id === recipe.skuId);
              return (
                <div
                  key={recipe.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e0ddd8',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '15px',
                  }}
                >
                  <h3 style={{ margin: '0 0 15px 0', color: '#3d2817' }}>
                    {sku?.name || 'Unknown SKU'}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {recipe.ingredients.map((recipeIng) => {
                      const ing = ingredients.find((i) => i.id === recipeIng.ingredientId);
                      return (
                        <div key={recipeIng.ingredientId} style={{ fontSize: '14px', color: '#666' }}>
                          {ing?.name}: <strong>{recipeIng.quantity} {ing?.unit}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {recipes.length === 0 && <p style={{ color: '#999' }}>No recipes yet. Create your first recipe.</p>}

            {/* New Recipe Form Modal */}
            {showRecipeForm && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#3d2817' }}>Create Recipe</h2>
                    <button
                      onClick={() => setShowRecipeForm(false)}
                      style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                      SKU
                    </label>
                    <select
                      value={recipeForm.skuId}
                      onChange={(e) => setRecipeForm({ ...recipeForm, skuId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Select SKU</option>
                      {skus.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#3d2817' }}>Ingredients</h4>
                    <div style={{ background: '#f9f7f4', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                      {recipeForm.ingredients.map((recipeIng) => {
                        const ing = ingredients.find((i) => i.id === recipeIng.ingredientId);
                        return (
                          <div
                            key={recipeIng.ingredientId}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 0',
                              fontSize: '14px',
                            }}
                          >
                            <span>{ing?.name} ({recipeIng.quantity} {ing?.unit})</span>
                            <button
                              onClick={() => removeRecipeIngredient(recipeIng.ingredientId)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#d17e7e',
                                cursor: 'pointer',
                                fontSize: '16px',
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <select
                        id="ingredientSelect"
                        style={{
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      >
                        <option value="">Select ingredient</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        id="quantityInput"
                        placeholder="Quantity"
                        style={{
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const select = document.getElementById('ingredientSelect');
                        const input = document.getElementById('quantityInput');
                        addRecipeIngredient(select.value, input.value);
                        select.value = '';
                        input.value = '';
                      }}
                      style={{
                        width: '100%',
                        background: '#6ba388',
                        color: '#fff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      + Add Ingredient
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => setShowRecipeForm(false)}
                      style={{
                        background: '#e0ddd8',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addRecipe}
                      style={{
                        background: '#d4a574',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Create Recipe
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INGREDIENTS VIEW */}
        {view === 'ingredients' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#3d2817' }}>Raw Ingredients</h2>
              <button
                onClick={() => setShowIngredientForm(true)}
                style={{
                  background: '#d4a574',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                + Log Receipt
              </button>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #e0ddd8',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #e0ddd8' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                      Ingredient
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                      On Hand
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                      Unit Cost
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                      Expires
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                      Reorder @
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => (
                    <tr key={ing.id} style={{ borderBottom: '1px solid #e0ddd8' }}>
                      <td style={{ padding: '12px' }}>{ing.name}</td>
                      <td style={{ padding: '12px' }}>
                        {ing.onHand.toFixed(0)} {ing.unit}
                      </td>
                      <td style={{ padding: '12px' }}>
                        ${ing.cost.toFixed(2)}/{ing.unit}
                      </td>
                      <td style={{ padding: '12px' }}>{ing.expirationDate}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {ing.reorderThreshold} {ing.unit}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            const newQty = prompt('New quantity:', ing.onHand);
                            if (newQty !== null) {
                              updateIngredient(ing.id, { onHand: parseFloat(newQty) });
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#d4a574',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Log Receipt Modal */}
            {showIngredientForm && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#3d2817' }}>Log Ingredient Receipt</h2>
                    <button
                      onClick={() => setShowIngredientForm(false)}
                      style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                      Ingredient Name
                    </label>
                    <input
                      type="text"
                      value={ingredientForm.name}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                      placeholder="e.g., Felchlin Chocolate 70%"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={ingredientForm.onHand}
                        onChange={(e) => setIngredientForm({ ...ingredientForm, onHand: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Unit
                      </label>
                      <select
                        value={ingredientForm.unit}
                        onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option>g</option>
                        <option>kg</option>
                        <option>ml</option>
                        <option>l</option>
                        <option>units</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Unit Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ingredientForm.cost}
                        onChange={(e) => setIngredientForm({ ...ingredientForm, cost: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                        placeholder="$"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        value={ingredientForm.expirationDate}
                        onChange={(e) => setIngredientForm({ ...ingredientForm, expirationDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                      Reorder when below
                    </label>
                    <input
                      type="number"
                      value={ingredientForm.reorderThreshold}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, reorderThreshold: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                      placeholder="Threshold"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => setShowIngredientForm(false)}
                      style={{
                        background: '#e0ddd8',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addIngredient}
                      style={{
                        background: '#d4a574',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Log Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTION VIEW */}
        {view === 'production' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#3d2817' }}>Production</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowProductionForm(true)}
                  style={{
                    background: '#d4a574',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  + Start Batch
                </button>
                <button
                  onClick={() => setShowPullForm(true)}
                  style={{
                    background: '#6ba388',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  📥 Pull from Freezer
                </button>
              </div>
            </div>

            <div>
              {productionBatches.map((batch) => {
                const sku = skus.find((s) => s.id === batch.skuId);
                return (
                  <div
                    key={batch.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e0ddd8',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '15px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#3d2817' }}>
                          {sku?.name} — Batch {batch.batchNumber}
                        </h3>
                        <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                          Produced: {batch.productionDate} {batch.freezeDate && `• Frozen: ${batch.freezeDate}`}
                        </p>
                      </div>
                    </div>

                    <div style={{ background: '#f9f7f4', borderRadius: '6px', padding: '15px', marginBottom: '15px' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 500, color: '#3d2817' }}>
                        Total: {batch.totalBonbons} bonbons in {batch.boxes.length} boxes
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                        {batch.boxes.map((box) => {
                          const bonbonsLeft = box.bonbonsRemaining ?? box.bonbonsPerBox;
                          const statusColor = box.status === 'Frozen' ? '#4a7c8c' : '#6ba388';
                          return (
                            <div
                              key={box.id}
                              style={{
                                background: '#fff',
                                border: `2px solid ${statusColor}`,
                                borderRadius: '4px',
                                padding: '10px',
                              }}
                            >
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                                Box {box.boxNumber}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#3d2817', marginBottom: '5px' }}>
                                {Math.round(bonbonsLeft)} bonbons
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  color: '#fff',
                                  background: statusColor,
                                  padding: '3px 6px',
                                  borderRadius: '3px',
                                  display: 'inline-block',
                                  marginBottom: '8px',
                                }}
                              >
                                {box.status}
                              </div>
                              <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                <button
                                  onClick={() => printBatchLabel(box, batch)}
                                  style={{
                                    background: 'none',
                                    border: '1px solid #d4a574',
                                    color: '#d4a574',
                                    padding: '4px 6px',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                  }}
                                >
                                  Print Label
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {productionBatches.length === 0 && <p style={{ color: '#999' }}>No production batches yet</p>}

            {/* Start Batch Modal */}
            {showProductionForm && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#3d2817' }}>Start Production</h2>
                    <button
                      onClick={() => setShowProductionForm(false)}
                      style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                      SKU
                    </label>
                    <select
                      value={productionForm.skuId}
                      onChange={(e) => setProductionForm({ ...productionForm, skuId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select SKU</option>
                      {skus.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Total Bonbons
                      </label>
                      <input
                        type="number"
                        value={productionForm.totalBonbons}
                        onChange={(e) => setProductionForm({ ...productionForm, totalBonbons: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Number of Boxes
                      </label>
                      <input
                        type="number"
                        value={productionForm.boxesCount}
                        onChange={(e) => setProductionForm({ ...productionForm, boxesCount: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                      Freeze Date (optional)
                    </label>
                    <input
                      type="date"
                      value={productionForm.freezeDate}
                      onChange={(e) => setProductionForm({ ...productionForm, freezeDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {productionForm.boxesCount && (
                    <div style={{ marginBottom: '15px', background: '#f9f7f4', padding: '15px', borderRadius: '6px' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500, color: '#3d2817' }}>
                        Box Status (each box)
                      </label>
                      {Array.from({ length: parseInt(productionForm.boxesCount) || 0 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <label style={{ fontSize: '14px', color: '#666' }}>Box {i + 1}:</label>
                          <select
                            value={productionForm.boxStatuses[i + 1] || 'Frozen'}
                            onChange={(e) =>
                              setProductionForm({
                                ...productionForm,
                                boxStatuses: {
                                  ...productionForm.boxStatuses,
                                  [i + 1]: e.target.value,
                                },
                              })
                            }
                            style={{
                              padding: '6px 10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '13px',
                            }}
                          >
                            <option>Frozen</option>
                            <option>Ready</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => setShowProductionForm(false)}
                      style={{
                        background: '#e0ddd8',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={startProduction}
                      style={{
                        background: '#d4a574',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Start Batch
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pull from Freezer Modal */}
            {showPullForm && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#3d2817' }}>Pull from Freezer</h2>
                    <button
                      onClick={() => setShowPullForm(false)}
                      style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                      Select Batch
                    </label>
                    <select
                      value={pullForm.batchId}
                      onChange={(e) => setPullForm({ ...pullForm, batchId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select batch</option>
                      {productionBatches
                        .filter((b) => b.boxes.some((box) => box.status === 'Frozen'))
                        .map((batch) => (
                          <option key={batch.id} value={batch.id}>
                            {getSkuName(batch.skuId)} — {batch.batchNumber}
                          </option>
                        ))}
                    </select>
                  </div>

                  {pullForm.batchId && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Select Box (Frozen)
                      </label>
                      <select
                        value={pullForm.boxNumber}
                        onChange={(e) => setPullForm({ ...pullForm, boxNumber: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select box</option>
                        {productionBatches
                          .find((b) => b.id === pullForm.batchId)
                          ?.boxes.filter((box) => box.status === 'Frozen')
                          .map((box) => (
                            <option key={box.id} value={box.boxNumber}>
                              Box {box.boxNumber} ({Math.round(box.bonbonsPerBox)} bonbons)
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => setShowPullForm(false)}
                      style={{
                        background: '#e0ddd8',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={pullFromFreezer}
                      style={{
                        background: '#6ba388',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Move to Ready
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SALES VIEW */}
        {view === 'sales' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#3d2817' }}>Record Sale</h2>
              <button
                onClick={() => setShowSaleForm(true)}
                style={{
                  background: '#d4a574',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                + Record Sale
              </button>
            </div>

            <div>
              <h3 style={{ color: '#3d2817', marginBottom: '15px' }}>Available Inventory by SKU</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                {skus.map((sku) => {
                  const frozen = getInventoryByStatus(sku.id, 'Frozen');
                  const ready = getInventoryByStatus(sku.id, 'Ready');

                  return (
                    <div
                      key={sku.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e0ddd8',
                        borderRadius: '8px',
                        padding: '15px',
                      }}
                    >
                      <p style={{ margin: '0 0 10px 0', fontWeight: 500, color: '#3d2817' }}>
                        {sku.name}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>Frozen</div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3d2817' }}>
                            {Math.round(frozen)}
                          </div>
                        </div>
                        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>Ready</div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6ba388' }}>
                            {Math.round(ready)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sale Form Modal */}
            {showSaleForm && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#3d2817' }}>Record Sale</h2>
                    <button
                      onClick={() => setShowSaleForm(false)}
                      style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                      SKU
                    </label>
                    <select
                      value={saleForm.skuId}
                      onChange={(e) => setSaleForm({ ...saleForm, skuId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select SKU</option>
                      {skus.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Status
                      </label>
                      <select
                        value={saleForm.status}
                        onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option>Frozen</option>
                        <option>Ready</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#3d2817' }}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={saleForm.quantity}
                        onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                        placeholder="# bonbons"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => setShowSaleForm(false)}
                      style={{
                        background: '#e0ddd8',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={recordSale}
                      style={{
                        background: '#d4a574',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Record Sale
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NashloreInventoryDashboard;
