import { useState, useEffect } from "react";
import "./App.css";

const CATEGORIES = ["Beef", "Chicken", "Dessert", "Pasta", "Seafood", "Vegetarian"];

// Kamus teks untuk UI
const TRANSLATIONS = {
  id: {
    searchPlaceholder: "Cari resep (misal: Pasta, Beef, Salmon)...",
    searchBtn: "Cari",
    tabSearch: "Semua Resep",
    tabFav: "⭐ Favorit Saya",
    randomBtn: "🎲 Kejutkan Aku! (Resep Acak)",
    loading: "Mencari resep lezat...",
    emptyFav: "Belum ada resep favorit. Klik bintang pada resep untuk menyimpannya!",
    emptySearch: "Resep tidak ditemukan. Coba kata kunci lain.",
    saveFav: "☆ Simpan",
    savedFav: "⭐ Tersimpan",
    ingredients: "Bahan-bahan:",
    instructions: "Cara Membuat (Bahasa Inggris):"
  },
  en: {
    searchPlaceholder: "Search recipe (e.g., Pasta, Beef, Salmon)...",
    searchBtn: "Search",
    tabSearch: "All Recipes",
    tabFav: "⭐ My Favorites",
    randomBtn: "🎲 Surprise Me! (Random Recipe)",
    loading: "Finding delicious recipes...",
    emptyFav: "No favorite recipes yet. Click the star on a recipe to save it!",
    emptySearch: "Recipe not found. Try another keyword.",
    saveFav: "☆ Save",
    savedFav: "⭐ Saved",
    ingredients: "Ingredients:",
    instructions: "Instructions:"
  }
};

function App() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [activeTab, setActiveTab] = useState("search");
  const [lang, setLang] = useState("id"); // Default ke Bahasa Indonesia
  
  const t = TRANSLATIONS[lang]; // Shortcut untuk memanggil teks

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("vibe-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const searchMeals = async (searchQuery) => {
    setLoading(true);
    setActiveTab("search");
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (category) => {
    setLoading(true);
    setActiveTab("search");
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (mealId) => {
    setLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await res.json();
      if (data.meals) setSelectedMeal(data.meals[0]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomMeal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
      const data = await res.json();
      if (data.meals) {
        setSelectedMeal(data.meals[0]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (meal) => {
    let newFavs;
    if (favorites.some((fav) => fav.idMeal === meal.idMeal)) {
      newFavs = favorites.filter((fav) => fav.idMeal !== meal.idMeal);
    } else {
      newFavs = [...favorites, meal];
    }
    setFavorites(newFavs);
    localStorage.setItem("vibe-favorites", JSON.stringify(newFavs));
  };

  const isFavorite = (id) => favorites.some((fav) => fav.idMeal === id);

  useEffect(() => {
    searchMeals("chicken");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) searchMeals(query);
  };

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

  const displayedMeals = activeTab === "favorites" ? favorites : meals;

  return (
    <div className="app-wrapper">
      <div className="container">
        {/* Header dengan Tombol Ganti Bahasa */}
        <div className="header-wrapper">
          <h1 className="title">🍳 Vibe Cooking</h1>
          <button 
            className="lang-toggle" 
            onClick={() => setLang(lang === "id" ? "en" : "id")}
          >
            {lang === "id" ? "🇬🇧 EN" : "🇮🇩 ID"}
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">{t.searchBtn}</button>
        </form>

        <div className="controls">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
              onClick={() => setActiveTab("search")}
            >
              {t.tabSearch}
            </button>
            <button 
              className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              {t.tabFav} ({favorites.length})
            </button>
          </div>

          {activeTab === "search" && (
            <div className="categories">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat} 
                  className="category-chip"
                  onClick={() => filterByCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <button onClick={getRandomMeal} className="btn-random">
            {t.randomBtn}
          </button>
        </div>

        {loading && <p className="loading">{t.loading}</p>}

        {!loading && displayedMeals.length === 0 && (
          <p className="empty">
            {activeTab === "favorites" ? t.emptyFav : t.emptySearch}
          </p>
        )}

        <div className="grid">
          {displayedMeals.map((meal) => (
            <div key={meal.idMeal} className="card" onClick={() => handleCardClick(meal.idMeal)}>
              <img src={meal.strMealThumb} alt={meal.strMeal} className="card-img" />
              <div className="card-body">
                <h3>{meal.strMeal}</h3>
                {meal.strCategory && (
                  <span className="badge">{meal.strCategory} | {meal.strArea}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMeal && (
        <div className="modal-overlay" onClick={() => setSelectedMeal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setSelectedMeal(null)}>✖</button>
            <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} className="modal-img" />
            
            <div className="modal-header">
              <h2>{selectedMeal.strMeal}</h2>
              <button 
                className={`btn-fav ${isFavorite(selectedMeal.idMeal) ? "active" : ""}`}
                onClick={() => toggleFavorite(selectedMeal)}
              >
                {isFavorite(selectedMeal.idMeal) ? t.savedFav : t.saveFav}
              </button>
            </div>
            
            <div className="modal-details">
              <div className="ingredients-box">
                <h3>{t.ingredients}</h3>
                <ul>
                  {getIngredients(selectedMeal).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="instructions-box">
                <h3>{t.instructions}</h3>
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