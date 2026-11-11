
import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header class="topbar">
      <div class="brand">
        <div class="brand-icon">▥</div>
        <div>
          <h1>BARCODE <span>PRO</span></h1>
          <small>GESTÃO INTELIGENTE DE PRODUTOS</small>
        </div>
      </div>
      <div class="status">● SISTEMA ONLINE</div>
    </header>

    <main>
      <section class="welcome">
        <p>PAINEL DE CONTROLE</p>
        <h2>Bem-vindo ao Barcode Pro</h2>
        <span>Gerencie seus produtos e códigos de barras.</span>
      </section>

      <section class="stats">
        <article class="stat-card">
          <span>PRODUTOS</span>
          <strong>0</strong>
        </article>
        <article class="stat-card">
          <span>CÓDIGOS GERADOS</span>
          <strong>0</strong>
        </article>
        <article class="stat-card">
          <span>ETIQUETAS</span>
          <strong>0</strong>
        </article>
      </section>

      <section class="actions">
        <h3>ACESSO RÁPIDO</h3>
        <div class="action-grid">
          <button>▥<span>Gerar código</span></button>
          <button>＋<span>Cadastrar produto</span></button>
          <button>▤<span>Produtos</span></button>
          <button>▣<span>Imprimir etiquetas</span></button>
        </div>
      </section>
    </main>

    <footer>BARCODE PRO © 2026 - Todos os direitos reservados</footer>
  </div>
`;
