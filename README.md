# Vértice iPhone

Site institucional responsivo para uma loja fictícia de iPhones. A experiência apresenta modelos e atendimento; não inclui carrinho, checkout nem venda online.

## Desenvolvimento

O visualizador 3D usa React, TypeScript, Three.js e o modelo GLB local. Para iniciar o modo de desenvolvimento e gerar o site estático:

```sh
npm ci
npm run dev
npm run build
```

O build é publicado pelo GitHub Pages a partir da pasta `dist`. O vídeo principal permanece como prioridade de carregamento; o modelo 3D só é baixado quando o visitante chega perto do visualizador.

## Cores e atribuição do modelo

As opções Preto, Prateado, Glacial e Bordô correspondem às cores listadas para iPhone 18 Pro e iPhone 18 Pro Max pela Apple. O renderizador mantém os mapas e detalhes do GLB e troca apenas o material do acabamento externo; a aparência final também depende da tela e da iluminação 3D.

O modelo 3D foi criado por [Pro Animator](https://sketchfab.com/Riju.mandal), publicado no Sketchfab sob [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Atribuição incluída no visualizador. A seleção de cor adapta os materiais externos do arquivo original.

## Mídia e contato

- `assets/hero-3d.mp4`: vídeo `1.mp4` enviado para o hero.
- `assets/showcase-3d.mp4`: vídeo `3.mp4` enviado para a seção de experiência.
- `assets/iphone-18-pro-max.glb`: modelo 3D interativo fornecido para o visualizador.

As imagens de produto na coleção são servidas pelas páginas públicas da Apple. Modelos, cores e disponibilidade devem ser confirmados com a loja antes da publicação.

A página inclui atalhos para vendas, manutenção, dois grupos VIP e unidade do Centro, seguindo os destinos do Linktree de referência enviado. O botão flutuante e o contato usam o WhatsApp de vendas do mesmo Linktree. O botão de avaliação e o atalho de localização usam o link do Google Maps informado. Como a marca Vértice é fictícia, substitua esses destinos pelos canais da loja quando estiverem definidos.
