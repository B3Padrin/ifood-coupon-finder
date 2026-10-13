# Imagens do carrossel — pendências (2026-10-13)

Inspeção pelo GitHub: nenhum dos 16 caminhos referenciados em `src/routes/index.tsx` possui arquivo no repositório em `public/images/offers/`.

| Produto | Arquivo esperado | Situação |
|---|---|---|
| 4 Big Macs McDonald's | big-mac-mcdonalds.webp | Ausente; fotografia específica e licença pendentes |
| 2 Whoppers Burger King | whopper-batatas-burger-king.webp | Ausente; fotografia específica e licença pendentes |
| 2 sanduíches Subway | sanduiches-30cm-subway.webp | Ausente; fotografia específica e licença pendentes |
| Cheeseburgers | cheeseburgers-batata.webp | Ausente |
| Brownies | brownies-sorvete.webp | Ausente |
| Churros | churros-recheados.webp | Ausente |
| Copos da felicidade | copos-da-felicidade.webp | Ausente |
| Brigadeiros | brigadeiros-gourmet.webp | Ausente |
| Milk-shakes | milkshakes-500ml.webp | Ausente |
| Milk-shakes de morango | milkshakes-morango.webp | Ausente |
| Açaís | acais-500ml.webp | Ausente |
| Milk-shake Oreo | milkshake-oreo-700ml.webp | Ausente |
| Pizza e refrigerante | pizza-refrigerante-2l.webp | Ausente |
| Duas pizzas | duas-pizzas-grandes.webp | Ausente |
| Mini coxinhas | mini-coxinhas.webp | Ausente |
| Cachorro-quentes | cachorros-quentes.webp | Ausente |

A UI exibe placeholders gráficos responsivos em proporção 4:3 e mantém preços/badges. A allowlist `authorizedImages` em `OfferPhoto` começa vazia: só inclua caminhos após subir os arquivos, conferir HTTP 200 e autorização de uso. Não utilizar imagens genéricas para representar produtos de marcas específicas. Não foram verificadas imagens reais nem testado o navegador publicado nesta etapa.
