import React, { useState, useEffect } from 'react';
import './App.css';

// Nutrient Calculation Function
const calculateTotalNutrients = (products, quantityMap) => {
  return products.reduce(
    (acc, product) => {
      if (!product || !product.nutrients) {
        return acc;
      }

      const { protein = 0, carbs = 0, fat = 0, fiber = 0, sugars = 0, calories = 0 } = product.nutrients;
      const quantity = quantityMap[product.id] || 0;

      // Add nutrients multiplied by quantity
      acc.protein += protein * quantity;
      acc.carbs += carbs * quantity;
      acc.fat += fat * quantity;
      acc.fiber += fiber * quantity;
      acc.sugars += sugars * quantity;
      acc.calories += calories * quantity;

      return acc;
    },
    {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugars: 0,
      calories: 0,
    }
  );
};

// Card Component to display all nutrients
const ProductCard = React.memo(({ product, quantityMap, onQuantityChange }) => {
  const quantity = quantityMap[product.id] || 0;

  return (
    <div className="card">
      <img src={product.image} alt={product.product} />
      <div className="card-details">
        <h4>{product.product}</h4>
        <p>{product.type}</p>
        <input
          type="number"
          value={quantity === 0 ? '' : quantity} // If quantity is 0, show empty field
          min="0"
          onChange={(e) => {
            const newQuantity = Math.max(0, parseInt(e.target.value) || 0);
            onQuantityChange(product.id, newQuantity); // Only update the quantity for the specific product
          }}
          placeholder="0"
        />
        <div className="card-nutrients">
          <div className="nutrient-item">
            <div className="nutrient-icon">🍗</div>
            <div>Protein: {quantity > 0 ? (product.nutrients.protein * quantity).toFixed(2): (product.nutrients.protein).toFixed(2) }g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🍞</div>
            <div>Carbs: {quantity > 0 ? (product.nutrients.carbs * quantity).toFixed(2): (product.nutrients.carbs).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🥑</div>
            <div>Fat: {quantity > 0 ? (product.nutrients.fat * quantity).toFixed(2): (product.nutrients.fat).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🥦</div>
            <div>Fiber: {quantity > 0 ? (product.nutrients.fiber * quantity).toFixed(2): (product.nutrients.fiber).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🍬</div>
            <div>Sugars: {quantity > 0 ? (product.nutrients.sugars * quantity).toFixed(2): (product.nutrients.sugars).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🔥</div>
            <div>Calories: {quantity > 0 ? (product.nutrients.calories * quantity).toFixed(2):  (product.nutrients.calories).toFixed(2)} kcal</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Main App Component
const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalNutrients, setTotalNutrients] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugars: 0,
    calories: 0,
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantityMap, setQuantityMap] = useState({}); // Store quantities by product ID

  // Fetching all products dynamically from JSON files
  useEffect(() => {
    const importAll = (r) => {
      return r.keys().map(r).flat().filter(item => JSON.stringify(item) !== '{}');
    };
    const productsData = importAll(require.context('./nutrients_data', false, /\.json$/));
    setProducts(productsData);
    setFilteredProducts(productsData);
  }, []);

  const handleQuantityChange = (id, quantity) => {
    // Update the quantity map for the specific product
    setQuantityMap((prevQuantityMap) => ({
      ...prevQuantityMap,
      [id]: quantity,
    }));
  };

  const handleFilter = (type) => {
    if (type) {
      const filtered = products.filter(product => product.type === type);
      setFilteredProducts(filtered);
      setCurrentIndex(0); // Reset the current index after filtering
    } else {
      setFilteredProducts(products);
    }
  };

  const handleSearch = (event) => {
    const searchText = event.target.value.toLowerCase();
    const filtered = products.filter(product =>
      product.product.toLowerCase().includes(searchText)
    );
    setFilteredProducts(filtered);
    setCurrentIndex(0); // Reset the current index after search
  };

  const calculateTotal = () => {
    // Use 'products' for the total calculation
    const total = calculateTotalNutrients(products, quantityMap);
    console.log("Total Nutrients Calculated:", total);  // Debugging the calculated total
    setTotalNutrients(total);  // Set the total nutrients state
    setShowTooltip(true);  // Show the tooltip with the total
  };

  const closeTooltip = () => {
    setShowTooltip(false);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredProducts.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredProducts.length) % filteredProducts.length);
  };

  // Get distinct types for filter, excluding null/undefined types
  const productTypes = [...new Set(products.map((product) => product.type).filter(type => type !== null && type !== undefined))];

  const currentProduct = filteredProducts[currentIndex];

  return (
    <div className="App">
      <header className="fixed-header">
        <div className="title">Nutrition Tracker</div>
      </header>
      <div className="filters fixed-filters">
        <select className="filter-type" onChange={(e) => handleFilter(e.target.value)}>
          <option value="">All</option>
          {productTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          className="search-input"
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
        />
      </div>
      <div className="carousel-container">
        <button className="arrow-button" onClick={handlePrevious}>◀</button>
        <div className="card-container">
          {filteredProducts.length > 0 && (
            <ProductCard
              key={currentProduct.id}
              product={currentProduct}
              quantityMap={quantityMap}
              onQuantityChange={handleQuantityChange} />
          )}
        </div>
        <button className="arrow-button" onClick={handleNext}>▶</button>
      </div>
      <div className="calculate-container">
        <button className="calculate-button" onClick={calculateTotal}>Calculate Nutrients</button>
      </div>
      {showTooltip && totalNutrients && (
        <div className="tooltip-overlay active">
          <div className="tooltip">
            <button className="close-tooltip" onClick={closeTooltip}>X</button>
            <div className="tooltip-title">Total Nutrients</div>
            <div className="tooltip-item">
              <div className="nutrient-icon">🍗</div>
              <div>Protein: {totalNutrients.protein.toFixed(2)}g</div>
            </div>
            <div className="tooltip-item">
              <div className="nutrient-icon">🍞</div>
              <div>Carbs: {totalNutrients.carbs.toFixed(2)}g</div>
            </div>
            <div className="tooltip-item">
              <div className="nutrient-icon">🥑</div>
              <div>Fat: {totalNutrients.fat.toFixed(2)}g</div>
            </div>
            <div className="tooltip-item">
              <div className="nutrient-icon">🥦</div>
              <div>Fiber: {totalNutrients.fiber.toFixed(2)}g</div>
            </div>
            <div className="tooltip-item">
              <div className="nutrient-icon">🍬</div>
              <div>Sugars: {totalNutrients.sugars.toFixed(2)}g</div>
            </div>
            <div className="tooltip-item">
              <div className="nutrient-icon">🔥</div>
              <div>Calories: {totalNutrients.calories.toFixed(2)} kcal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
