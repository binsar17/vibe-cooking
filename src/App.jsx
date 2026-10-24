import { useState, useEffect } from "react";
import "./App.css";

// Daftar kategori bawaan dari API TheMealDB
const CATEGORIES = ["Beef", "Chicken", "Dessert", "Pasta", "Seafood", "Vegetarian"];

function App() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [activeTab, setActiveTab] = useState("search"); // 'search' atau 'favorites'
  
  // State untuk menyimpan resep favorit
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("vibe-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Fungsi mencari resep berdasarkan teks
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

  // Fungsi filter berdasarkan kategori
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

  // Fungsi ambil detail lengkap saat kartu diklik (karena API filter tidak menyertakan bahan)
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

  // Simpan / Hapus Favorit
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

  // Cek apakah resep sudah difavoritkan
  const isFavorite = (id) => favorites.some((fav) => fav.idMeal === id);

  // Load resep "Chicken" saat pertama kali dibuka
  useEffect(() => {
    searchMeals("chicken");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) searchMeals(query);
  };

  // Mengambil bahan-bahan dari API
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

  // Tentukan data mana yang mau ditampilkan (hasil search atau favorit)
  const displayedMeals = activeTab === "favorites" ? favorites : meals;

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
          <button type="submit" className="btn-search">Cari</button>
        </form>

        {/* Tab Menu & Filter Kategori */}
        <div className="controls">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
              onClick={() => setActiveTab("search")}
            >
              Semua Resep
            </button>
            <button 
              className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              ⭐ Favorit Saya ({favorites.length})
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
        </div>

        {loading && <p className="loading">Mencari resep lezat...</p>}

        {!loading && displayedMeals.length === 0 && (
          <p className="empty">
            {activeTab === "favorites" 
              ? "Belum ada resep favorit. Klik bintang pada resep untuk menyimpannya!" 
              : "Resep tidak ditemukan. Coba kata kunci lain."}
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

      {/* MODAL DETAIL RESEP */}
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
                {isFavorite(selectedMeal.idMeal) ? "⭐ Tersimpan" : "☆ Simpan"}
              </button>
            </div>
            
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