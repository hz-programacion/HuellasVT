/**
 * Declarative Dynamic Scale & Flex-Layout Engine for HTML5 Canvas Editorial Posters
 * Ensures 100% of content (header, photo, name, metadata, description, contact CTA, and commercial footer)
 * adapts proportionally inside 1080x1920 (Story 9:16) or 1080x1080 (Square 1:1) without overflow.
 */

export type PosterCanvasFormat = 'story_9_16' | 'post_1_1';

export interface PosterContentInput {
  name: string;
  breed: string;
  color: string;
  barrio: string;
  addressOrReference: string;
  date: string;
  description: string;
  contactName: string;
  contactPhone: string;
  hasSponsor: boolean;
}

export interface CanvasFlexBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StoryFlexLayoutPlan {
  canvasWidth: number;
  canvasHeight: number;
  scaleFactor: number;
  outerMargin: number;
  innerPadding: number;
  cardBox: CanvasFlexBox;
  headerBox: CanvasFlexBox;
  photoBox: CanvasFlexBox;
  identityBox: CanvasFlexBox;
  descriptionBox: CanvasFlexBox;
  contactBox: CanvasFlexBox;
  footerBox: CanvasFlexBox;
  typography: {
    statusHeadlinePx: number;
    kickerPx: number;
    nameMaxPx: number;
    nameMinPx: number;
    traitsPx: number;
    metaDateRefPx: number;
    descriptionPx: number;
    descriptionLineHeight: number;
    descriptionMaxLines: number;
    contactLabelPx: number;
    contactPhonePx: number;
    sponsorTitlePx: number;
    sponsorSubPx: number;
  };
}

/**
 * Computes a dynamic flex-column layout plan for the 1080x1920 Story Canvas.
 * Automatically scales margins, photo height, and font sizes when text content is dense,
 * guaranteeing that all flex children fit inside the card with balanced vertical distribution.
 */
export function computeStoryFlexLayout(input: PosterContentInput): StoryFlexLayoutPlan {
  const canvasWidth = 1080;
  const canvasHeight = 1920;

  // Calculate content density score (0.0 = minimal, 1.0 = very long name + long description + long reference)
  const nameLen = (input.name || '').trim().length;
  const descLen = (input.description || '').trim().length;
  const refLen = (input.addressOrReference || '').trim().length;

  const nameDensity = Math.min(1, Math.max(0, (nameLen - 10) / 25));
  const descDensity = Math.min(1, Math.max(0, (descLen - 80) / 160));
  const refDensity = Math.min(1, Math.max(0, (refLen - 20) / 45));

  const totalDensity = Number(
    (nameDensity * 0.35 + descDensity * 0.45 + refDensity * 0.2).toFixed(3)
  );

  // Dynamic scale factor between 0.88 (dense text) and 1.04 (concise text)
  const scaleFactor = Number((1.02 - totalDensity * 0.14).toFixed(3));

  const outerMargin = Math.round(44 * scaleFactor);
  const innerPadding = Math.round(38 * scaleFactor);
  const footerHeight = input.hasSponsor ? 136 : 108;

  const cardX = outerMargin;
  const cardY = outerMargin;
  const cardWidth = canvasWidth - outerMargin * 2;
  const cardHeight = canvasHeight - outerMargin * 2 - footerHeight;

  // Header Banner inside Card
  const headerHeight = Math.round(210 * scaleFactor);
  const headerBox: CanvasFlexBox = {
    x: cardX,
    y: cardY,
    width: cardWidth,
    height: headerHeight,
  };

  // Fixed & proportional heights for bottom sections inside Card
  const identityHeight = Math.round(168 * scaleFactor);
  const descriptionHeight = Math.round(176 + descDensity * 36);
  const contactHeight = Math.round(118 * scaleFactor);

  // Flex gap calculation: 4 internal gaps between (Header -> Photo -> Identity -> Description -> Contact -> CardBottom)
  const baseGap = Math.round(24 * scaleFactor);
  const totalFixedContent =
    headerHeight + identityHeight + descriptionHeight + contactHeight + baseGap * 5;

  // Photo acts as `flex: 1` (absorbs remaining vertical space cleanly, clamped to editorial proportions)
  const rawPhotoHeight = cardHeight - totalFixedContent;
  const photoHeight = Math.max(520, Math.min(690, rawPhotoHeight));

  // Distribute any leftover space evenly across the flex gaps (`justify-content: space-between`)
  const usedHeight = headerHeight + photoHeight + identityHeight + descriptionHeight + contactHeight;
  const remainingSpace = Math.max(80, cardHeight - usedHeight);
  const flexGap = Math.floor(remainingSpace / 5);

  const contentX = cardX + innerPadding;
  const contentWidth = cardWidth - innerPadding * 2;

  const photoBox: CanvasFlexBox = {
    x: contentX,
    y: headerBox.y + headerBox.height + flexGap,
    width: contentWidth,
    height: photoHeight,
  };

  const identityBox: CanvasFlexBox = {
    x: contentX,
    y: photoBox.y + photoBox.height + flexGap,
    width: contentWidth,
    height: identityHeight,
  };

  const descriptionBox: CanvasFlexBox = {
    x: contentX,
    y: identityBox.y + identityBox.height + flexGap,
    width: contentWidth,
    height: descriptionHeight,
  };

  const contactBox: CanvasFlexBox = {
    x: contentX,
    y: cardY + cardHeight - contactHeight - Math.max(24, flexGap),
    width: contentWidth,
    height: contactHeight,
  };

  const footerBox: CanvasFlexBox = {
    x: cardX,
    y: cardY + cardHeight + 14,
    width: cardWidth,
    height: footerHeight - 14,
  };

  // Proportional Typography
  const nameMaxPx = nameLen > 22 ? 48 : nameLen > 14 ? 54 : 62;
  const nameMinPx = 30;
  const descriptionPx = descLen > 160 ? 23 : 26;
  const descriptionLineHeight = Math.round(descriptionPx * 1.42);
  const descriptionMaxLines = descLen > 150 ? 4 : 3;

  return {
    canvasWidth,
    canvasHeight,
    scaleFactor,
    outerMargin,
    innerPadding,
    cardBox: {
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
    },
    headerBox,
    photoBox,
    identityBox,
    descriptionBox,
    contactBox,
    footerBox,
    typography: {
      statusHeadlinePx: Math.round(62 * scaleFactor),
      kickerPx: Math.round(22 * scaleFactor),
      nameMaxPx,
      nameMinPx,
      traitsPx: Math.round(26 * scaleFactor),
      metaDateRefPx: Math.round(22 * scaleFactor),
      descriptionPx,
      descriptionLineHeight,
      descriptionMaxLines,
      contactLabelPx: Math.round(19 * scaleFactor),
      contactPhonePx: Math.round(38 * scaleFactor),
      sponsorTitlePx: 21,
      sponsorSubPx: 17,
    },
  };
}
