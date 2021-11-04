import { createCanvas, loadImage } from "canvas";

type ImagePlayerData = {
  name: string,
  cardsLeft: number,
};

export type UnoCard = {
  color: UnoColor,
  type: UnoType;
};

type OverviewData = {
  playedCards: UnoCard[],
  players: ImagePlayerData[],
  upNow: number,
  playingDirection: 1 | -1,
};

type AssetPathNames = "CARDS_BG" | "CARDS_ALL" | "CARD";
type ImageAsset = {
  width: number,
  height: number,
  path: `assets/images/${string}.png`;
};

const ImageAssets: Record<AssetPathNames, ImageAsset> = {
  CARDS_BG: {
    width: 70,
    height: 80,
    path: "assets/images/cardsHolding.png"
  },
  CARDS_ALL: {
    width: 1545, // 15 cards wide
    height: 815, // 5 cards high
    path: "assets/images/cards.png"
  },
  CARD: {
    width: 103,
    height: 163,
    path: "assets/images/backface.png"
  }
};

enum ColorScheme {
  GRAY_0 = "#202225",
  GRAY_1 = "#2F3136",
  GRAY_2 = "#36393F",
  GRAY_3 = "#4F545C",
  WHITE_0 = "#72767D",
  WHITE_1 = "#DCDDDE",
  NITRO = "#FF73FA",
  DANGER = "#ED4245",
  SUCCESS = "#3BA55D",
}

export enum UnoColor {
  RED,
  YELLOW,
  GREEN,
  BLUE,
  BLACK,
}

export enum UnoType {
  ZERO,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  SKIP,
  DRAW_TWO,
  REVERSE,
  WILD_DRAW_FOUR,
  WILD,
}

const padding = 30;
const fontSize = 40;
const centerWidth = 250;
const cardsBgYAdjust = 5;

export async function generateOverview(params: OverviewData) {
  const [widht, height] = [930, 360];
  const canvas = createCanvas(widht, height);

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = ColorScheme.GRAY_1; // background color
  ctx.fillRect(0, 0, widht, height);

  ctx.font = `700 ${fontSize}px Poppins`;
  const maxFontWidth = (widht - 2 * padding - centerWidth) / 2 - ImageAssets.CARDS_BG.width;
  const maxCardNumberWidth = ImageAssets.CARDS_BG.width * 0.6;
  const cardsBg = await loadImage(ImageAssets.CARDS_BG.path);

  params.players.forEach((pl, i, arr) => {

    ctx.fillStyle = i === params.upNow ? ColorScheme.WHITE_1 : ColorScheme.WHITE_0; // font color

    let cardsX = 0, baseY = 0;

    if (i < (arr.length / 2)) { // on the left side
      baseY = ((height - 2 * padding) / Math.ceil(arr.length / 2)) * (i + 0.5) + padding;

      ctx.fillText(pl.name, padding, baseY + fontSize / 2, maxFontWidth);

      cardsX = widht / 2 - centerWidth / 2 - ImageAssets.CARDS_BG.width;
    } else {
      baseY = ((height - 2 * padding) / Math.floor(arr.length / 2)) * (i - Math.ceil(arr.length / 2) + 0.5) + padding;

      const textWidth = Math.min(ctx.measureText(pl.name).width, maxFontWidth);
      ctx.fillText(pl.name, widht - padding - textWidth, baseY + fontSize / 2, maxFontWidth); // player name

      cardsX = widht / 2 + centerWidth / 2;
    }

    ctx.drawImage(cardsBg, cardsX, baseY - ImageAssets.CARDS_BG.height / 2 + cardsBgYAdjust);  // card Background

    ctx.fillStyle = ColorScheme.GRAY_0;
    const cardTextWidth = Math.min(ctx.measureText(pl.cardsLeft.toFixed(0)).width, maxCardNumberWidth);
    ctx.fillText(pl.cardsLeft.toFixed(0), cardsX + (ImageAssets.CARDS_BG.width - cardTextWidth) / 2, baseY + fontSize / 2, maxCardNumberWidth); //card number
  });

  const allCards = await loadImage(ImageAssets.CARDS_ALL.path);

  // draw cards in center
  const cCardWidth = centerWidth * 0.5;
  const cCardHeight = (ImageAssets.CARD.height / ImageAssets.CARD.width) * cCardWidth;

  ctx.save();
  ctx.translate(widht / 2, height / 2);
  ctx.rotate(-20 * Math.PI / 180);
  params.playedCards.forEach((card) => {
    ctx.drawImage(allCards, card.type * ImageAssets.CARD.width, card.color * ImageAssets.CARD.height, ImageAssets.CARD.width, ImageAssets.CARD.height, -cCardWidth / 2, -cCardHeight / 2, cCardWidth, cCardHeight);
    ctx.rotate(20 * Math.PI / 180);
  });
  ctx.restore();
  return canvas;
}

//TODO produced Image may be smaller, scale down for faster computation and load times in discord 
export async function generateCards(cards: UnoCard[]) {
  //* 12 cards per row!
  const nRows = Math.ceil(cards.length / 12);
  const [widht, height] = [
    ImageAssets.CARD.width * 12 + padding * 3.1,
    padding * 2 + ImageAssets.CARD.height * nRows + padding * 0.1 * (nRows - 1)
  ];

  const canvas = createCanvas(widht, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = ColorScheme.GRAY_1; // background color
  ctx.fillRect(0, 0, widht, height);

  const allCards = await loadImage(ImageAssets.CARDS_ALL.path);

  cards.forEach((card, i) => {
    ctx.drawImage(allCards, card.type * ImageAssets.CARD.width, card.color * ImageAssets.CARD.height, ImageAssets.CARD.width, ImageAssets.CARD.height,
      padding + (i % 12) * ImageAssets.CARD.width + (i % 12) * padding * 0.1,
      padding + Math.floor(i / 12) * (ImageAssets.CARD.height + padding * 0.1),
      ImageAssets.CARD.width, ImageAssets.CARD.height);
  });

  return canvas;
}