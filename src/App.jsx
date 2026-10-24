import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Fungsi mencari resep
  const searchMeals = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load resep "Chicken" saat pertama kali dibuka
  useEffect(() => {
    searchMeals("chicken");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) searchMeals(query);
  };

  // Mengambil bahan-bahan dari API (karena formatnya berderet 1-20)
  const getIngredients = (meal) => {
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }
    return ingredients;
  };

  return (
    <div className="app-wrapper">
      <div className="container">
        <h1 className="title">🍳 Vibe Cooking</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Cari resep (misal: Pasta, Beef, Salmon)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">Cari Resep</button>
        </form>

        {loading && <p className="loading">Mencari resep lezat...</p>}

        {!loading && meals.length === 0 && (
          <p className="empty">Resep tidak ditemukan. Coba kata kunci lain.</p>
        )}

        <div className="grid">
          {meals.map((meal) => (
            <div key={meal.idMeal} className="card" onClick={() => setSelectedMeal(meal)}>
              <img src={meal.strMealThumb} alt={meal.strMeal} className="card-img" />
              <div className="card-body">
                <h3>{meal.strMeal}</h3>
                <span className="badge">{meal.strCategory} | {meal.strArea}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETAIL RESEP */}
      {selectedMeal && (
        <div className="modal-overlay" onClick={() => setSelectedMeal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setSelectedMeal(null)}>✖</button>
            <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} className="modal-img" />
            <h2>{selectedMeal.strMeal}</h2>
            
            <div className="modal-details">
              <div className="ingredients-box">
                <h3>Bahan-bahan:</h3>
                <ul>
                  {getIngredients(selectedMeal).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="instructions-box">
                <h3>Cara Membuat:</h3>
                <p>{selectedMeal.strInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;