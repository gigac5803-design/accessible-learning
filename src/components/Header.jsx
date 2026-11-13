import Navigation from './Navigation';

function Header() {
  return (
    <header id="top">
      <div className="logo">
        <h2>Accessible Learning</h2>
      </div>
      
      {/* Вставляем компонент навигации */}
      <Navigation />
    </header>
  );
}

export default Header;