const SUPABASE_URL = "https://mgxyupekvuihjbzvzfmf.supabase.co";
const SUPABASE_KEY = "sb_publishable_fSGhfKrj2NK5UHNYRGk8nw_fl4mCJ_n";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL_PERMITIDO = "admin@camisa10.com";

const loginBox = document.getElementById("loginBox");
const painelBox = document.getElementById("painelBox");
const formLogin = document.getElementById("formLogin");
const loginMensagem = document.getElementById("loginMensagem");

const btnLogout = document.getElementById("btnLogout");
const btnAbrirNovoProduto = document.getElementById("btnAbrirNovoProduto");
const btnRecarregar = document.getElementById("btnRecarregar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

const listaProdutos = document.getElementById("listaProdutos");
const formProduto = document.getElementById("formProduto");
const produtoMensagem = document.getElementById("produtoMensagem");
const tituloFormulario = document.getElementById("tituloFormulario");

const produtoId = document.getElementById("produtoId");
const nomeProduto = document.getElementById("nomeProduto");
const slugProduto = document.getElementById("slugProduto");
const descricaoProduto = document.getElementById("descricaoProduto");
const categoriaProduto = document.getElementById("categoriaProduto");
const isFeatured = document.getElementById("isFeatured");
const isVisible = document.getElementById("isVisible");

const CAMPOS_TAMANHO = {
  P: {
    ativo: document.getElementById("sizeP"),
    disponivel: document.getElementById("sizePAvailable")
  },
  M: {
    ativo: document.getElementById("sizeM"),
    disponivel: document.getElementById("sizeMAvailable")
  },
  G: {
    ativo: document.getElementById("sizeG"),
    disponivel: document.getElementById("sizeGAvailable")
  },
  EG: {
    ativo: document.getElementById("sizeEG"),
    disponivel: document.getElementById("sizeEGAvailable")
  }
};

let categoriasCache = [];

function mostrarLogin() {
  loginBox.style.display = "block";
  painelBox.style.display = "none";
  btnLogout.style.display = "none";
  btnAbrirNovoProduto.style.display = "none";
}

function mostrarPainel() {
  loginBox.style.display = "none";
  painelBox.style.display = "block";
  btnLogout.style.display = "inline-flex";
  btnAbrirNovoProduto.style.display = "inline-flex";
}

function limparTamanhos() {
  Object.values(CAMPOS_TAMANHO).forEach((campo) => {
    campo.ativo.checked = false;
    campo.disponivel.checked = true;
    campo.disponivel.disabled = true;
  });
}

function configurarHabilitacaoTamanhos() {
  Object.values(CAMPOS_TAMANHO).forEach((campo) => {
    campo.ativo.addEventListener("change", () => {
      campo.disponivel.disabled = !campo.ativo.checked;
      if (!campo.ativo.checked) {
        campo.disponivel.checked = true;
      }
    });
  });
}

function obterTamanhosSelecionados() {
  return Object.entries(CAMPOS_TAMANHO)
    .filter(([, campo]) => campo.ativo.checked)
    .map(([size, campo]) => ({
      size,
      is_available: campo.disponivel.checked
    }));
}

function preencherTamanhos(productSizes = []) {
  limparTamanhos();

  productSizes.forEach((item) => {
    const campo = CAMPOS_TAMANHO[item.size];
    if (!campo) return;

    campo.ativo.checked = true;
    campo.disponivel.disabled = false;
    campo.disponivel.checked = !!item.is_available;
  });
}

function limparFormulario() {
  produtoId.value = "";
  nomeProduto.value = "";
  slugProduto.value = "";
  descricaoProduto.value = "";
  categoriaProduto.value = "";
  isFeatured.checked = false;
  isVisible.checked = true;
  limparTamanhos();
  tituloFormulario.textContent = "Novo produto";
  btnCancelarEdicao.style.display = "none";
  produtoMensagem.textContent = "";
}

function preencherFormulario(produto) {
  produtoId.value = produto.id || "";
  nomeProduto.value = produto.name || "";
  slugProduto.value = produto.slug || "";
  descricaoProduto.value = produto.short_description || "";
  categoriaProduto.value = produto.category_id || "";
  isFeatured.checked = !!produto.is_featured;
  isVisible.checked = !!produto.is_visible;
  preencherTamanhos(produto.product_sizes || []);
  tituloFormulario.textContent = "Editar produto";
  btnCancelarEdicao.style.display = "inline-flex";
  produtoMensagem.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function carregarCategorias() {
  categoriaProduto.innerHTML = '<option value="">Carregando categorias...</option>';

  const { data, error } = await supabaseClient
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  console.log("Categorias data:", data);
  console.log("Categorias error:", error);

  if (error) {
    categoriaProduto.innerHTML = '<option value="">Erro ao carregar categorias</option>';
    return;
  }

  categoriasCache = data || [];

  categoriaProduto.innerHTML = `
    <option value="">Selecione uma categoria</option>
    ${categoriasCache.map((cat) => `
      <option value="${cat.id}">${cat.name}</option>
    `).join("")}
  `;
}

function renderizarProdutos(produtos) {
  if (!produtos.length) {
    listaProdutos.innerHTML = '<p class="estado">Nenhum produto cadastrado.</p>';
    return;
  }

  listaProdutos.innerHTML = produtos.map((produto) => {
    const categoriaNome = produto.categories?.name || "Sem categoria";
    const tamanhos = (produto.product_sizes || [])
      .map((item) => `${item.size}${item.is_available ? "" : " (indisponível)"}`)
      .join(", ");

    return `
      <div class="produto-item">
        <div>
          <h3>${produto.name || "Sem nome"}</h3>
          <p><strong>Slug:</strong> ${produto.slug || "-"}</p>
          <p><strong>Categoria:</strong> ${categoriaNome}</p>
          <p><strong>Descrição:</strong> ${produto.short_description || "-"}</p>
          <p><strong>Tamanhos:</strong> ${tamanhos || "-"}</p>

          <span class="tag-admin ${produto.is_featured ? "tag-destaque" : ""}">
            ${produto.is_featured ? "Destaque" : "Normal"}
          </span>

          <span class="tag-admin ${produto.is_visible ? "tag-visivel" : "tag-oculto"}">
            ${produto.is_visible ? "Visível" : "Oculto"}
          </span>
        </div>

        <div class="produto-acoes">
          <button class="btn btn-escuro" data-editar="${produto.id}">Editar</button>
          <button class="btn btn-dourado" data-excluir="${produto.id}">Excluir</button>
        </div>
      </div>
    `;
  }).join("");
}

async function carregarProdutosAdmin() {
  listaProdutos.innerHTML = '<p class="estado">Carregando produtos...</p>';

  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      category_id,
      is_featured,
      is_visible,
      categories (
        name
      ),
      product_sizes (
        size,
        is_available
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    listaProdutos.innerHTML = `<p class="estado">Erro ao carregar produtos: ${error.message}</p>`;
    return;
  }

  renderizarProdutos(data || []);
}

async function salvarTamanhosProduto(idProduto) {
  const tamanhosSelecionados = obterTamanhosSelecionados();

  const { error: erroDelete } = await supabaseClient
    .from("product_sizes")
    .delete()
    .eq("product_id", idProduto);

  if (erroDelete) {
    throw erroDelete;
  }

  if (!tamanhosSelecionados.length) {
    return;
  }

  const payloadTamanhos = tamanhosSelecionados.map((item) => ({
    product_id: idProduto,
    size: item.size,
    is_available: item.is_available
  }));

  const { error: erroInsert } = await supabaseClient
    .from("product_sizes")
    .insert(payloadTamanhos);

  if (erroInsert) {
    throw erroInsert;
  }
}

async function salvarProduto(event) {
  event.preventDefault();
  produtoMensagem.textContent = "Salvando...";

  const payload = {
    name: nomeProduto.value.trim(),
    slug: slugProduto.value.trim(),
    short_description: descricaoProduto.value.trim(),
    category_id: categoriaProduto.value || null,
    is_featured: isFeatured.checked,
    is_visible: isVisible.checked
  };

  if (!payload.name || !payload.slug || !payload.category_id) {
    produtoMensagem.textContent = "Preencha nome, slug e categoria.";
    return;
  }

  try {
    let produtoSalvoId = produtoId.value;

    if (produtoId.value) {
      const { error } = await supabaseClient
        .from("products")
        .update(payload)
        .eq("id", produtoId.value);

      if (error) throw error;
    } else {
      const { data, error } = await supabaseClient
        .from("products")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;
      produtoSalvoId = data.id;
    }

    await salvarTamanhosProduto(produtoSalvoId);

    produtoMensagem.textContent = "Produto salvo com sucesso.";
    limparFormulario();
    await carregarProdutosAdmin();
  } catch (erro) {
    produtoMensagem.textContent = `Erro ao salvar: ${erro.message}`;
  }
}

async function excluirProduto(id) {
  const confirmar = window.confirm("Tem certeza que deseja excluir este produto?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    alert(`Erro ao excluir: ${error.message}`);
    return;
  }

  if (String(produtoId.value) === String(id)) {
    limparFormulario();
  }

  await carregarProdutosAdmin();
}

async function buscarProdutoPorId(id) {
  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      category_id,
      is_featured,
      is_visible,
      product_sizes (
        size,
        is_available
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Não foi possível carregar o produto para edição.");
    return;
  }

  preencherFormulario(data);
}

async function verificarSessao() {
  const { data } = await supabaseClient.auth.getSession();
  const sessao = data?.session;

  if (sessao) {
    if (sessao.user.email !== ADMIN_EMAIL_PERMITIDO) {
      alert("Acesso não autorizado");
      await supabaseClient.auth.signOut();
      mostrarLogin();
      return;
    }

    mostrarPainel();
    await carregarCategorias();
    await carregarProdutosAdmin();
  } else {
    mostrarLogin();
  }
}

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMensagem.textContent = "Entrando...";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    loginMensagem.textContent = `Erro ao entrar: ${error.message}`;
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  const sessao = data?.session;

  if (sessao?.user?.email !== ADMIN_EMAIL_PERMITIDO) {
    alert("Acesso não autorizado");
    await supabaseClient.auth.signOut();
    loginMensagem.textContent = "Este usuário não tem permissão para acessar o painel.";
    mostrarLogin();
    return;
  }

  loginMensagem.textContent = "";
  mostrarPainel();
  await carregarCategorias();
  await carregarProdutosAdmin();
});

btnLogout.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  mostrarLogin();
});

btnRecarregar.addEventListener("click", async () => {
  await carregarProdutosAdmin();
});

btnAbrirNovoProduto.addEventListener("click", () => {
  limparFormulario();
});

btnCancelarEdicao.addEventListener("click", () => {
  limparFormulario();
});

nomeProduto.addEventListener("input", () => {
  if (!produtoId.value) {
    slugProduto.value = gerarSlug(nomeProduto.value);
  }
});

formProduto.addEventListener("submit", salvarProduto);

listaProdutos.addEventListener("click", async (event) => {
  const editarId = event.target.getAttribute("data-editar");
  const excluirId = event.target.getAttribute("data-excluir");

  if (editarId) {
    await buscarProdutoPorId(editarId);
  }

  if (excluirId) {
    await excluirProduto(excluirId);
  }
});

supabaseClient.auth.onAuthStateChange(async (_event, session) => {
  if (session) {
    if (session.user.email !== ADMIN_EMAIL_PERMITIDO) {
      alert("Acesso não autorizado");
      await supabaseClient.auth.signOut();
      mostrarLogin();
      return;
    }

    mostrarPainel();
    await carregarCategorias();
    await carregarProdutosAdmin();
  } else {
    mostrarLogin();
  }
});

configurarHabilitacaoTamanhos();
limparTamanhos();
verificarSessao();
