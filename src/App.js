import React, { useState, useEffect } from 'react';
import './App.css';

// Nutrient Calculation Function
const calculateTotalNutrients = (products) => {
  return products.reduce(
    (acc, product) => {
      if (!product || product === null || product === undefined || !product.nutrients) {
        return acc;
      }
      const { protein = 0, carbs = 0, fat = 0, fiber = 0, sugars = 0, calories = 0 } = product.nutrients;
      const quantity = product.quantity || 0;

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
const ProductCard = ({ product, onQuantityChange }) => {
  return (
    <div className="card">
      <img src={product.image} alt={product.product} />
      <div className="card-details">
        <h4>{product.product}</h4>
        <p>{product.type}</p>
        <input
          type="number"
          value={product.quantity || 0}
          min="0"
          onChange={(e) => onQuantityChange(product.id, Math.max(0, parseInt(e.target.value)))}
        />
        <div className="card-nutrients">
          <div className="nutrient-item">
            <div className="nutrient-icon">🍗</div>
            <div>Protein: {(product.quantity > 0 ? product.nutrients.protein * product.quantity : product.nutrients.protein).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🍞</div>
            <div>Carbs: {(product.quantity > 0 ? product.nutrients.carbs * product.quantity : product.nutrients.carbs).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🥑</div>
            <div>Fat: {(product.quantity > 0 ? product.nutrients.fat * product.quantity : product.nutrients.fat).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🥦</div>
            <div>Fiber: {(product.quantity > 0 ? product.nutrients.fiber * product.quantity : product.nutrients.fiber).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🍬</div>
            <div>Sugars: {(product.quantity > 0 ? product.nutrients.sugars * product.quantity : product.nutrients.sugars).toFixed(2)}g</div>
          </div>
          <div className="nutrient-item">
            <div className="nutrient-icon">🔥</div>
            <div>Calories: {(product.quantity > 0 ? product.nutrients.calories * product.quantity : product.nutrients.calories).toFixed(2)} kcal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalNutrients, setTotalNutrients] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetching all products dynamically from JSON files
  useEffect(() => {
    const importAll = (r) => {
      return r.keys().map(r).flat().filter(item => JSON.stringify(item) !== '{}');
    };
    const productsData = importAll(require.context('./nutrients_data', false, /\.json$/));
    console.log(productsData);
    setProducts(productsData);
    setFilteredProducts(productsData);
  }, []);

  const handleQuantityChange = (id, quantity) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, quantity } : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  const handleFilter = (type) => {
    if (type) {
      setFilteredProducts(products.filter(product => product.type === type));
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
  };

  const calculateTotal = () => {
    const total = calculateTotalNutrients(filteredProducts);
    setTotalNutrients(total);
    setShowTooltip(true);
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
              key={filteredProducts[currentIndex].id}
              product={filteredProducts[currentIndex]}
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
              <div>Calories: {totalNutrients.calories.toFixed(2)}kcal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
