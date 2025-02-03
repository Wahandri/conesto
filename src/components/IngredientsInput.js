"use client";
import { useState } from 'react';

const IngredientInput = () => {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddIngredient = (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input');
    if (input?.value) {
      setIngredients([...ingredients, input.value]);
      input.value = '';
    }
  };

  const handleSearch = async () => {
    setErrorMessage(""); // Limpiar mensajes anteriores
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setRecipe(data);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setErrorMessage("Hubo un problema al generar la receta. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="ingredient-input">
      <form onSubmit={handleAddIngredient} className="ingredient-form">
        <input
          type="text"
          placeholder="Ej: Pollo, arroz, limón..."
          className="ingredient-field"
        />
        <button type="submit" className="ingredient-button">
          Añadir
        </button>
      </form>

      <ul className="ingredient-list">
        {ingredients.map((ingredient, index) => (
          <li key={index} className="ingredient-item">{ingredient}</li>
        ))}
      </ul>

      <button onClick={handleSearch} className="generate-button">
        Generar Receta
      </button>

      {errorMessage && <p className="error-message">⚠️ {errorMessage}</p>}

      {recipe && recipe.ingredients && Array.isArray(recipe.ingredients) && (
        <div className="recipe-result">
          <h2>{recipe.title}</h2>
          <h3>Ingredientes:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
          <h3>Pasos:</h3>
          <ol>
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {recipe.tips && <p className="recipe-tips">💡 {recipe.tips}</p>}
        </div>
      )}
    </div>
  );
};

export default IngredientInput;
