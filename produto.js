const SUPABASE_URL = "https://mgxyupekvuihjbzvzfmf.supabase.co";
const SUPABASE_KEY = "sb_publishable_fSGhfKrj2NK5UHNYRGk8nw_fl4mCJ_n";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const produtoPagina = document.getElementById("produtoPagina");

const numero = "5597981098445";

const linkProduto = window.location.href;

const mensagem = `
Olá! Tenho interesse neste produto da Camisa 10 Store:

Produto: ${nome}
Preço: R$ ${preco}
Tamanho: ${tamanho}

Link do produto:
${linkProduto}
`;

const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

window.open(url, "_blank");

function obterImagensOrdenadas(produto) {
  return [...(produto.product_images || [])].sort((a, b) => {
    const ordemA = a?.sort_order ?? 9999;
    const ordemB = b?.sort_order ?? 9999;
    return ordemA - ordemB;
  });
}

function obterImagemPrincipal(imagens) {
  return (
    imagens.find((img) => img?.is_cover)?.image_url ||
    imagens[0]?.image_url ||
    PLACEHOLDER_IMAGEM
  );
}

function renderizarTamanhos(produto) {
  const ordemTamanhos = ["P", "M", "G", "EG"];

  const tamanhos = [...(produto.product_sizes || [])].sort((a, b) => {
    const indiceA = ordemTamanhos.indexOf(a?.size);
    const indiceB = ordemTamanhos.indexOf(b?.size);

    const ordemA = indiceA === -1 ? 999 : indiceA;
    const ordemB = indiceB === -1 ? 999 : indiceB;

    return ordemA - ordemB;
  });

  if (!tamanhos.length) {
    return '<span class="tamanho">Consulte</span>';
  }

  return tamanhos
    .map((item) => {
      const disponivel = item?.is_available;
      const size = item?.size || "Consulte";

      return `
        <span
          class="tamanho ${disponivel ? "disponivel" : "indisponivel"}"
          ${disponivel ? `data-size="${size}"` : ""}
        >
          ${size}
        </span>
      `;
    })
    .join("");
}

function renderizarMiniaturas(imagens, nomeProduto, imagemPrincipalAtual) {
  if (!imagens.length) {
    return `
      <img
        src="${PLACEHOLDER_IMAGEM}"
        class="miniatura ativa"
        data-image="${PLACEHOLDER_IMAGEM}"
        alt="${nomeProduto}"
      >
    `;
  }

  return imagens
    .map((img) => {
      const url = img?.image_url || PLACEHOLDER_IMAGEM;
      const ativa = url === imagemPrincipalAtual ? "ativa" : "";

      return `
        <img
          src="${url}"
          class="miniatura ${ativa}"
          data-image="${url}"
          alt="${nomeProduto}"
        >
      `;
    })
    .join("");
}

function configurarEventosProduto(nomeProduto) {
  const imagemPrincipal = document.getElementById("imagemPrincipal");
  const botaoWhatsApp = document.getElementById("botaoWhatsAppProduto");

  document.addEventListener("click", (event) => {
    const miniatura = event.target.closest(".miniatura");

    if (miniatura && imagemPrincipal) {
      const novaImagem = miniatura.dataset.image;

      if (novaImagem) {
        imagemPrincipal.src = novaImagem;
      }

      document.querySelectorAll(".miniatura").forEach((img) => {
        img.classList.remove("ativa");
      });

      miniatura.classList.add("ativa");
      return;
    }

    const tamanho = event.target.closest(".produto-tamanhos .tamanho.disponivel");

    if (tamanho) {
      const areaTamanhos = tamanho.closest(".tamanhos");
      if (!areaTamanhos) return;

      areaTamanhos.querySelectorAll(".tamanho").forEach((item) => {
        item.classList.remove("ativo");
      });

      tamanho.classList.add("ativo");

      const tamanhoSelecionado = tamanho.dataset.size || "";

      if (botaoWhatsApp) {
        botaoWhatsApp.href = gerarLinkWhatsApp(nomeProduto, tamanhoSelecionado);
        botaoWhatsApp.classList.remove("desativado");
        botaoWhatsApp.textContent = "Comprar no WhatsApp";
      }
    }
  });
}

async function carregarProduto() {
  const slug = pegarSlugDaURL();

  if (!slug) {
    produtoPagina.innerHTML =
      '<p style="text-align:center; padding:40px; color:#cfcfcf;">Produto não encontrado.</p>';
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select(`
        *,
        product_images (
          image_url,
          is_cover,
          sort_order
        ),
        product_sizes (
          size,
          is_available
        )
      `)
      .eq("slug", slug)
      .single();

    if (error || !data) {
      throw error || new Error("Produto não encontrado.");
    }

    const nomeProduto = data.name || "Camisa";
    const descricao = data.short_description || "Camisa disponível para pedido.";
    const imagens = obterImagensOrdenadas(data);
    const imagemPrincipal = obterImagemPrincipal(imagens);

    produtoPagina.innerHTML = `
      <div class="produto-container">
        <div class="produto-galeria">
          <img
            src="${imagemPrincipal}"
            id="imagemPrincipal"
            class="produto-imagem-principal"
            alt="${nomeProduto}"
          >

          <div class="produto-miniaturas">
            ${renderizarMiniaturas(imagens, nomeProduto, imagemPrincipal)}
          </div>
        </div>

        <div class="produto-info">
          <h1>${nomeProduto}</h1>

          <p class="produto-descricao">
            ${descricao}
          </p>

          <div class="produto-tamanhos">
            <h3>Tamanhos disponíveis</h3>
            <div class="tamanhos">
              ${renderizarTamanhos(data)}
            </div>
          </div>

          <a
            id="botaoWhatsAppProduto"
            class="btn desativado"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escolha um tamanho
          </a>
        </div>
      </div>
    `;

    configurarEventosProduto(nomeProduto);
  } catch (erro) {
    console.error("Erro ao carregar produto:", erro);
    produtoPagina.innerHTML =
      '<p style="text-align:center; padding:40px; color:#cfcfcf;">Erro ao carregar produto.</p>';
  }
}

carregarProduto();