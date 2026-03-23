const SUPABASE_URL = "https://mgxyupekvuihjbzvzfmf.supabase.co";
const SUPABASE_KEY = "sb_publishable_fSGhfKrj2NK5UHNYRGk8nw_fl4mCJ_n";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// pega slug da URL
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

// gerar link do whatsapp
function gerarLinkWhatsApp(nome, preco, tamanho) {
  const numero = "5597981098445";

  let mensagem = `Olá! Tenho interesse na camisa:\n`;
  mensagem += `Produto: ${nome}\n`;

  if (tamanho) {
    mensagem += `Tamanho: ${tamanho}\n`;
  }

  if (preco) {
    mensagem += `Preço: R$ ${preco}`;
  }

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

// carregar produto
async function carregarProduto() {
  const slug = getSlug();

  if (!slug) {
    alert("Produto não encontrado.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    alert("Erro ao carregar produto.");
    return;
  }

  renderProduto(data);
}

// renderizar produto
function renderProduto(produto) {
  const nome = produto.name;
  const preco = produto.price;
  const imagens = produto.images || [];
  const tamanhos = produto.sizes || ["P", "M", "G", "GG"];

  // nome
  document.getElementById("nome-produto").innerText = nome;

  // preço
  if (preco) {
    document.getElementById("preco-produto").innerText = `R$ ${preco}`;
  }

  // imagem principal
  const imgPrincipal = document.getElementById("imagem-principal");
  imgPrincipal.src = imagens[0] || "";

  // galeria
  const galeria = document.getElementById("galeria");
  galeria.innerHTML = "";

  imagens.forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = img;
    thumb.classList.add("thumb");

    thumb.onclick = () => {
      imgPrincipal.src = img;
    };

    galeria.appendChild(thumb);
  });

  // tamanhos
  const containerTamanhos = document.getElementById("tamanhos");
  containerTamanhos.innerHTML = "";

  let tamanhoSelecionado = null;

  tamanhos.forEach((tam) => {
    const btn = document.createElement("button");
    btn.innerText = tam;
    btn.classList.add("btn-tamanho");

    btn.onclick = () => {
      tamanhoSelecionado = tam;

      document.querySelectorAll(".btn-tamanho").forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
    };

    containerTamanhos.appendChild(btn);
  });

  // botão whatsapp
  const btnWhats = document.getElementById("btn-whatsapp");

  btnWhats.onclick = () => {
    if (!tamanhoSelecionado) {
      alert("Selecione um tamanho antes de continuar.");
      return;
    }

    const link = gerarLinkWhatsApp(nome, preco, tamanhoSelecionado);
    window.open(link, "_blank");
  };
}

// iniciar
carregarProduto();
