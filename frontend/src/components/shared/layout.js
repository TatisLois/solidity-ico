import './layout.css';

export default function layout(props) {
  const children = props.children;
  return (
    <main className="main">
      <h1 className="main-title">Tomato Coin$ 🍅</h1>
      <section className="layout">
        {children}
      </section>
    </main>
  )
}
