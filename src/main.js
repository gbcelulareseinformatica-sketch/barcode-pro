
import './style.css';
import JsBarcode from 'jsbarcode';

import {
  getProducts,
  saveProduct,
  generateInternalCode,
  deleteProduct,
  isValidEAN13
} from './storage.js';

const app = document.querySelector('#app');

app.innerHTML = `
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
          <span>PRODUTOS CADASTRADOS</span>
          <strong id="totalProducts">0</strong>
        </article>

        <article class="stat-card">
          <span>CÓDIGOS INTERNOS</span>
          <strong id="totalInternal">0</strong>
        </article>

        <article class="stat-card">
          <span>CÓDIGOS EAN-13</span>
          <strong id="totalEAN">0</strong>
        </article>
      </section>

      <section class="actions">
        <h3>CADASTRO DE PRODUTOS</h3>

        <form id="productForm" class="product-form">
          <label>Nome do produto</label>
          <input name="name" type="text"
            placeholder="Ex: Tela Samsung A14" required />

          <label>Categoria</label>
          <select name="category" required>
            <option value="">Selecione uma categoria</option>
            <option value="Telas">Telas</option>
            <option value="Baterias">Baterias</option>
            <option value="Conectores">Conectores</option>
            <option value="Acessórios">Acessórios</option>
            <option value="Capinhas">Capinhas</option>
            <option value="Carregadores">Carregadores</option>
            <option value="Peças">Outras peças</option>
            <option value="Outros">Outros</option>
          </select>

          <label>Tipo de código</label>
          <select name="codeType" id="codeType">
            <option value="internal">Gerar código interno</option>
            <option value="ean">Cadastrar EAN-13 existente</option>
          </select>

          <div id="eanArea" hidden>
            <label>Código EAN-13</label>
            <input name="ean" type="text"
              inputmode="numeric" maxlength="13"
              placeholder="Digite os 13 números" />
          </div>

          <div class="form-columns">
            <div>
              <label>Preço de venda (R$)</label>
              <input name="price" type="number"
                min="0" step="0.01" placeholder="0,00" />
            </div>

            <div>
              <label>Quantidade</label>
              <input name="quantity" type="number"
                min="0" step="1" value="1" required />
            </div>
          </div>

          <label>Código de referência (opcional)</label>
          <input name="reference" type="text"
            placeholder="Referência do fabricante" />

          <button type="submit" class="primary-button">
            + CADASTRAR PRODUTO
          </button>

          <p id="formMessage" class="form-message"></p>
        </form>
      </section>

      <section class="actions product-section">
        <h3>PRODUTOS CADASTRADOS</h3>

        <input id="searchProduct" type="search"
          placeholder="Pesquisar por nome ou código..." />

        <div id="productList"></div>
      </section>
    </main>

    <footer>
      BARCODE PRO © 2026 - Todos os direitos reservados
    </footer>
  </div>
`;

const form = document.querySelector('#productForm');
const codeType = document.querySelector('#codeType');
const eanArea = document.querySelector('#eanArea');
const eanInput = form.elements.ean;
const message = document.querySelector('#formMessage');
const productList = document.querySelector('#productList');

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function updateStats(products) {
  document.querySelector('#totalProducts').textContent =
    products.length;

  document.querySelector('#totalInternal').textContent =
    products.filter(p => p.codeType === 'internal').length;

  document.querySelector('#totalEAN').textContent =
    products.filter(p => p.codeType === 'ean').length;
}

function renderProducts() {
  const products = getProducts();

  const search = document.querySelector('#searchProduct')
    .value.trim().toLowerCase();

  updateStats(products);

  const filtered = products.filter(product =>
    `${product.name} ${product.code} ${product.category}`
      .toLowerCase().includes(search)
  );

  if (!filtered.length) {
    productList.innerHTML = `
      <p class="empty-message">
        ${products.length
          ? 'Nenhum produto encontrado.'
          : 'Nenhum produto cadastrado ainda.'}
      </p>
    `;
    return;
  }

  productList.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-info">
        <h4>${escapeHTML(product.name)}</h4>
        <span>${escapeHTML(product.category)}</span>

        <p>Código:
          <strong>${escapeHTML(product.code)}</strong>
        </p>

        <p>Preço: ${money(product.price)}</p>

        <p>Estoque: ${escapeHTML(product.quantity)}</p>

        <svg class="barcode"
          id="barcode-${escapeHTML(product.id)}"></svg>
      </div>

      <div class="product-buttons">
        <button class="print-button"
          data-print="${escapeHTML(product.id)}">
          IMPRIMIR
        </button>

        <button class="delete-button"
          data-delete="${escapeHTML(product.id)}">
          EXCLUIR
        </button>
      </div>
    </article>
  `).join('');

  filtered.forEach(product => {
    try {
      JsBarcode(
        `#barcode-${CSS.escape(product.id)}`,
        product.code,
        {
          format: product.codeType === 'ean' ? 'EAN13' : 'CODE128',
          width: 1.8,
          height: 48,
          displayValue: true,
          fontSize: 12,
          margin: 8
        }
      );
    } catch (error) {
      console.error('Erro ao gerar código:', error);
    }
  });
}

codeType.addEventListener('change', () => {
  const isEAN = codeType.value === 'ean';

  eanArea.hidden = !isEAN;
  eanInput.required = isEAN;
});

form.addEventListener('submit', event => {
  event.preventDefault();

  const data = new FormData(form);

  const name = data.get('name').trim();
  const category = data.get('category');
  const type = data.get('codeType');
  const price = Number(data.get('price') || 0);
  const quantity = Number(data.get('quantity'));
  const reference = data.get('reference').trim();

  if (!name || !category) {
    message.textContent = 'Preencha o nome e a categoria.';
    return;
  }

  if (!Number.isFinite(price) || price < 0 ||
      !Number.isInteger(quantity) || quantity < 0) {
    message.textContent = 'Confira o preço e a quantidade.';
    return;
  }

  let code;

  if (type === 'ean') {
    code = data.get('ean').trim();

    if (!isValidEAN13(code)) {
      message.textContent = 'EAN-13 inválido. Confira os 13 números.';
      return;
    }

    if (getProducts().some(p => p.code === code)) {
      message.textContent = 'Este código já está cadastrado.';
      return;
    }
  } else {
    code = generateInternalCode();
  }

  try {
    saveProduct({
      name,
      category,
      code,
      codeType: type,
      price,
      quantity,
      reference
    });

    message.textContent = `Produto cadastrado! Código: ${code}`;
    message.className = 'form-message success';

    form.reset();

    eanArea.hidden = true;
    eanInput.required = false;

    renderProducts();

  } catch (error) {
    console.error(error);

    message.textContent = 'Não foi possível salvar o produto.';
    message.className = 'form-message error';
  }
});

document.querySelector('#searchProduct')
  .addEventListener('input', renderProducts);

productList.addEventListener('click', event => {
  const deleteButton = event.target.closest('[data-delete]');
  const printButton = event.target.closest('[data-print]');

  if (deleteButton) {
    const id = deleteButton.dataset.delete;

    if (confirm('Deseja realmente excluir este produto?')) {
      deleteProduct(id);
      renderProducts();
    }
  }

  if (printButton) {
    const id = printButton.dataset.print;
    printProduct(id);
  }
});

// =====================================
// IMPRESSÃO DE ETIQUETAS
// =====================================

function printProduct(id) {
  const product = getProducts().find(p => p.id === id);

  if (!product) return;

  const svg = document.querySelector(
    `#barcode-${CSS.escape(id)}`
  );

  if (!svg) return;

  const barcode = new XMLSerializer().serializeToString(svg);

  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Permita janelas pop-up para imprimir as etiquetas.');
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport"
        content="width=device-width, initial-scale=1.0">

      <title>Etiqueta - ${escapeHTML(product.name)}</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 10px;
        }

        .back-button {
          display: block;
          width: 100%;
          max-width: 300px;
          margin: 10px auto 25px;
          padding: 15px;
          background: #1769e0;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        .label {
          display: inline-block;
          padding: 8px;
          max-width: 100%;
        }

        h3 {
          font-size: 14px;
          margin: 4px;
        }

        p {
          font-size: 12px;
          margin: 4px;
        }

        svg {
          max-width: 100%;
          height: auto;
        }

        @page {
          margin: 5mm;
        }

        @media print {
          .back-button {
            display: none !important;
          }
        }
      </style>
    </head>

    <body>
      <button class="back-button"
        onclick="window.close()">
        ← VOLTAR AO APLICATIVO
      </button>

      <div class="label">
        <h3>${escapeHTML(product.name)}</h3>

        ${barcode}

        <p>${escapeHTML(product.code)}</p>

        <p>${money(product.price)}</p>
      </div>

      <script>
        window.onload = () => {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

// Inicializar aplicativo
renderProducts();
