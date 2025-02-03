"use client";
import { useState } from "react";
import "./IngredientsInput.css";
import "./AIResponse.css";

const IngredientInput = () => {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [difficulty, setDifficulty] = useState("media"); // 🔥 Nueva opción de dificultad (dropdown)
  const [showApplianceModal, setShowApplianceModal] = useState(false);
  const [selectedAppliances, setSelectedAppliances] = useState([
    "sartén", "horno", "microondas",
  ]); // 🔥 Electrodomésticos por defecto

  const appliancesList = [
    "sartén", "horno", "microondas", "olla a presión", "barbacoa",
    "freidora de aire", "batidora", "cocina de gas", "cocina eléctrica",
  ]; // 🔥 Lista completa de electrodomésticos

  const handleAddIngredient = (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    if (input?.value) {
      setIngredients([...ingredients, input.value]);
      input.value = "";
    }
  };

  const toggleAppliance = (appliance) => {
    setSelectedAppliances((prev) =>
      prev.includes(appliance)
        ? prev.filter((a) => a !== appliance)
        : [...prev, appliance]
    );
  };

  const fetchRecipe = async () => {
    setErrorMessage(""); // Limpiar mensajes anteriores
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients, 
          difficulty, 
          appliances: selectedAppliances,
          timestamp: Date.now() // 🔥 Agregamos un timestamp para forzar variación
        }),
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
      {/* Selector de dificultad (Dropdown) */}
      <label className="difficulty-label">Dificultad:</label>
      <select className="difficulty-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="rápida">Rápida/Sencilla</option>
        <option value="media">Media</option>
        <option value="pro">Pro</option>
      </select>

      {/* Botón para seleccionar electrodomésticos */}
      <button className="appliance-button" onClick={() => setShowApplianceModal(true)}>
        Seleccionar Electrodomésticos
      </button>

      {/* Modal de electrodomésticos */}
      {showApplianceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Selecciona los electrodomésticos disponibles:</h2>
            {appliancesList.map((appliance) => (
              <label key={appliance}>
                <input
                  type="checkbox"
                  checked={selectedAppliances.includes(appliance)}
                  onChange={() => toggleAppliance(appliance)}
                />
                {appliance}
              </label>
            ))}
            <button onClick={() => setShowApplianceModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
      
      <div>
        <h3>Añadir Ingredientes</h3>
        {/* Formulario de entrada */}
        <form onSubmit={handleAddIngredient} className="ingredient-form">
          <input type="text" placeholder="Ej: Pollo, arroz, limón..." className="ingredient-field" />
          <button type="submit" className="ingredient-button">Añadir</button>
        </form>

        {/* Lista de ingredientes */}
        {ingredients.length > 0 && (
          <div className="ingredient-list-container">
            <ul className="ingredient-list">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">{ingredient}</li>
              ))}
            </ul>
            <button onClick={() => setIngredients([])} className="ingredient-button-clear">X</button>
          </div>
        )}
      </div>

      {/* Botón para generar receta */}
      <button onClick={fetchRecipe} className="generate-button">Generar Receta</button>

      {recipe && (
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

          {/* Botón para solicitar una nueva receta */}
          <button onClick={fetchRecipe} className="new-recipe-button">Generar Otra Receta</button>
        </div>
      )}
    </div>
  );
};

export default IngredientInput;
