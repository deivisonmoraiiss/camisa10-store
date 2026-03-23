console.log("Script rodando 🚀");

// ======================
// 🔗 SUPABASE
// ======================
const SUPABASE_URL = "https://mgxyupekvuihjbzvzfmf.supabase.co";
const SUPABASE_KEY = "sb_publishable_fSGhfKrj2NK5UHNYRGk8nw_fl4mCJ_n";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ======================
// 📦 VARIÁVEIS
// ======================
let produtos = [];
let categoriaAtual = "all";

// ======================
// 🚀 INICIAR
// ======================
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
  ativarBusca();
  ativarMenu();
  iniciarSlider();
});

// ======================
// 📥 CARREGAR PRODUTOS
// ======================
async function carregarProdutos() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("visible", true);

  if (error) {
    console.error("Erro ao carregar produtos:", error);
    return;
  }

  produtos = data;
  renderizarProdutos(produtos);
  renderizarDestaques(produtos);
}

// ======================
// 🧱 RENDER PRODUTOS
// ======================
function renderizarProdutos(lista) {
  const grid = document.getElementById("productsGrid");

  if (!lista.length) {
    grid.innerHTML = `<div class="state-box">Nenhum produto encontrado</div>`;
    return;
  }

  grid.innerHTML = lista.map(p => `
    <div class="product-card">
      <div class="product-image-wrap">
        <img src="${p.image_url}" class="product-image"/>
      </div>

      <div class="product-body">
        <span class="product-category">${p.category}</span>
        <h3 class="product-title">${p.name}</h3>
        <div class="product-price">R$ ${p.price || "-"}</div>

        <button class="btn btn-primary" onclick="comprar('${p.name}')">
          Comprar
        </button>
      </div>
    </div>
  `).join("");
}

// ======================
// ⭐ DESTAQUES
// ======================
function renderizarDestaques(lista) {
  const grid = document.getElementById("featuredProductsGrid");

  const destaques = lista.filter(p => p.featured);

  if (!destaques.length) {
    grid.innerHTML = `<div class="state-box">Sem destaques</div>`;
    return;
  }

  grid.innerHTML = destaques.map(p => `
    <div class="product-card">
      <div class="product-image-wrap">
        <img src="${p.image_url}" class="product-image"/>
      </div>

      <div class="product-body">
        <span class="product-category">${p.category}</span>
        <h3 class="product-title">${p.name}</h3>
      </div>
    </div>
  `).join("");
}

// ======================
// 🔍 BUSCA
// ======================
function ativarBusca() {
  const input = document.getElementById("searchInput");

  if (!input) return;

  input.addEventListener("input", () => {
    const termo = input.value.toLowerCase();

    const filtrados = produtos.filter(p =>
      p.name.toLowerCase().includes(termo)
    );

    renderizarProdutos(filtrados);
  });
}

// ======================
// 📂 FILTRO CATEGORIA
// ======================
function setCategory(cat) {
  categoriaAtual = cat;

  if (cat === "all") {
    renderizarProdutos(produtos);
    return;
  }

  const filtrados = produtos.filter(p => p.category === cat);
  renderizarProdutos(filtrados);
}

// ======================
// 📱 MENU LATERAL
// ======================
function ativarMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileDrawer");
  const backdrop = document.getElementById("mobileDrawerBackdrop");
  const close = document.getElementById("mobileDrawerClose");

  if (!btn) return;

  btn.onclick = () => {
    drawer.classList.add("open");
    backdrop.classList.add("show");
  };

  close.onclick = () => fecharMenu();
  backdrop.onclick = () => fecharMenu();
}

function fecharMenu() {
  document.getElementById("mobileDrawer").classList.remove("open");
  document.getElementById("mobileDrawerBackdrop").classList.remove("show");
}

// ======================
// 🎞️ SLIDER
// ======================
function iniciarSlider() {
  let index = 0;
  const slides = document.querySelectorAll(".hero-slide");

  if (!slides.length) return;

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 4000);
}

// ======================
// 🛒 WHATSAPP
// ======================
function comprar(nome) {
  const numero = "5597981098445";
  const texto = `Olá, quero comprar a camisa ${nome}`;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}
