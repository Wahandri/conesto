import IngredientInput from '../components/IngredientsInput/IngredientsInput';


export default function Home() {
  return (
    <main className="container">
      <img src='/logoComerIA.png' width='400px' alt="Comer-IA Logo" className="logo" />
      <h1 className="title">Bienvenido a Comer-IA</h1>
      <p className="description">Introduce tus ingredientes y parametros</p>
      <p className="description">Una IA creara una receta para ti.</p>
      <div className='box-Ingrdients'>
        <IngredientInput />
      </div>
    </main>
  );
}
