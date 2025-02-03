import IngredientInput from '../components/IngredientsInput/IngredientsInput';

export default function Home() {
  return (
    <main className="container">
      <h1 className="title">Bienvenido</h1>
      <p className="description">Introduce tus ingredientes y te sugeriremos recetas.</p>
      <IngredientInput />
    </main>
  );
}
