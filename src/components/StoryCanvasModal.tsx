import React, { useEffect, useRef, useState } from 'react';
import { Pet, Sponsor } from '../types';
import { validateAndFormatWhatsApp } from '../utils/security';
import {
  computeStoryFlexLayout,
  PosterCanvasFormat,
} from '../utils/canvasFlexLayout';
import {
  X,
  Download,
  Share2,
  Sparkles,
  Check,
  Smartphone,
  Square,
  Copy,
  Sliders,
} from 'lucide-react';

interface StoryCanvasModalProps {
  pet: Pet;
  activeSponsor?: Sponsor | null;
  onClose: () => void;
}

/**
 * Dynamically fits a single-line string into `maxWidth` by scaling the font size down from `maxFontPx` to `minFontPx`.
 * If the string still exceeds `maxWidth` at `minFontPx`, it cleanly truncates with an ellipsis.
 */
function fitAndDrawSingleLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxFontPx: number,
  minFontPx: number,
  fontWeight: string,
  fontFamily: string,
  align: CanvasTextAlign = 'center'
): number {
  let fontSize = maxFontPx;
  ctx.textAlign = align;

  while (fontSize >= minFontPx) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }
    fontSize -= 2;
  }

  let finalString = text;
  if (ctx.measureText(finalString).width > maxWidth) {
    while (finalString.length > 3 && ctx.measureText(finalString + '…').width > maxWidth) {
      finalString = finalString.slice(0, -1).trim();
    }
    finalString += '…';
  }

  ctx.fillText(finalString, x, y);
  return fontSize;
}

/**
 * Pixel-accurate multi-line text wrapper using `ctx.measureText`.
 * Guarantees no line ever exceeds `maxWidth` and caps at `maxLines` with clean ellipsis.
 */
function drawPixelWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  align: CanvasTextAlign = 'center'
): number {
  ctx.textAlign = align;
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        let sliced = word;
        while (sliced.length > 2 && ctx.measureText(sliced + '…').width > maxWidth) {
          sliced = sliced.slice(0, -1);
        }
        lines.push(sliced + '…');
        currentLine = '';
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const finalLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && finalLines.length > 0) {
    let last = finalLines[maxLines - 1];
    while (last.length > 3 && ctx.measureText(last + '…').width > maxWidth) {
      last = last.slice(0, -1).trim();
    }
    finalLines[maxLines - 1] = last.replace(/[.,;:!?]+$/, '') + '…';
  }

  finalLines.forEach((line, idx) => {
    ctx.fillText(line, x, startY + idx * lineHeight);
  });

  return finalLines.length;
}

export const StoryCanvasModal: React.FC<StoryCanvasModalProps> = ({
  pet,
  activeSponsor,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [posterFormat, setPosterFormat] = useState<PosterCanvasFormat>('story_9_16');
  const [isRendering, setIsRendering] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [layoutScaleInfo, setLayoutScaleInfo] = useState<number>(1);

  const statusConfig = {
    lost: {
      title: '¡SE BUSCA!',
      kicker: 'ALERTA URGENTE EN VENADO TUERTO',
      primary: '#FF4D38',
      secondary: '#B91C1C',
      badgeBg: '#FFF1F0',
      badgeText: '#D92D20',
    },
    found: {
      title: '¡ENCONTRADO!',
      kicker: 'BUSCAMOS A SU FAMILIA EN VENADO TUERTO',
      primary: '#10B981',
      secondary: '#047857',
      badgeBg: '#ECFDF5',
      badgeText: '#047857',
    },
    adoption: {
      title: 'EN ADOPCIÓN',
      kicker: 'ADOPCIÓN RESPONSABLE EN VENADO TUERTO',
      primary: '#7C3AED',
      secondary: '#5B21B6',
      badgeBg: '#F5F3FF',
      badgeText: '#6D28D9',
    },
    resolved: {
      title: '¡VOLVIÓ A CASA!',
      kicker: 'FINAL FELIZ EN VENADO TUERTO',
      primary: '#F59E0B',
      secondary: '#B45309',
      badgeBg: '#FFFBEB',
      badgeText: '#B45309',
    },
  }[pet.status];

  const formattedPhone = validateAndFormatWhatsApp(pet.authorWhatsApp).formattedDisplay;

  useEffect(() => {
    let isCancelled = false;

    const renderPoster = async () => {
      setIsRendering(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const isStory = posterFormat === 'story_9_16';
      const W = 1080;
      const H = isStory ? 1920 : 1080;

      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // Continue with system fallback fonts
        }
      }

      // Compute dynamic flex layout plan
      const flexPlan = computeStoryFlexLayout({
        name: pet.name,
        breed: pet.breed || 'Mestizo',
        color: pet.color,
        barrio: pet.barrio,
        addressOrReference: pet.addressOrReference || pet.barrio,
        date: pet.date,
        description: pet.description,
        contactName: pet.authorName,
        contactPhone: formattedPhone,
        hasSponsor: Boolean(activeSponsor),
      });

      if (!isCancelled) {
        setLayoutScaleInfo(flexPlan.scaleFactor);
      }

      // 1. Background Canvas Frame
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#0B0C0E');
      bgGrad.addColorStop(1, '#16191E');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Top atmospheric glow matching semantic status color
      const topGlow = ctx.createRadialGradient(W / 2, 0, 40, W / 2, 180, W * 0.85);
      topGlow.addColorStop(0, statusConfig.primary + '55');
      topGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, W, H * 0.55);

      // Load Pet Image Safely
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = pet.photoBase64;
      });

      if (isCancelled) return;

      if (isStory) {
        // ====================================================================
        // LAYOUT A: 1080x1920 DYNAMIC FLEX-LAYOUT ENGINE
        // ====================================================================
        const {
          cardBox,
          headerBox,
          photoBox,
          identityBox,
          descriptionBox,
          contactBox,
          footerBox,
          typography,
        } = flexPlan;

        // Draw Main Editorial Card Surface
        ctx.save();
        ctx.fillStyle = '#FAF7F2';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 18;
        ctx.beginPath();
        ctx.roundRect(cardBox.x, cardBox.y, cardBox.width, cardBox.height, 36);
        ctx.fill();
        ctx.restore();

        // 1. HEADER FLEX BLOCK
        ctx.save();
        ctx.fillStyle = statusConfig.primary;
        ctx.beginPath();
        ctx.roundRect(headerBox.x, headerBox.y, headerBox.width, headerBox.height, [36, 36, 0, 0]);
        ctx.fill();

        // Top technical metadata bar inside header
        ctx.fillStyle = 'rgba(17, 19, 21, 0.22)';
        ctx.fillRect(headerBox.x, headerBox.y, headerBox.width, 54);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 19px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐾 HUELLA VT · RADAR VENADO TUERTO', headerBox.x + 32, headerBox.y + 27);

        ctx.textAlign = 'right';
        ctx.fillText(
          `FECHA: ${pet.date}`,
          headerBox.x + headerBox.width - 32,
          headerBox.y + 27
        );

        // Status Headline + Kicker inside headerBox
        ctx.textBaseline = 'alphabetic';
        fitAndDrawSingleLine(
          ctx,
          statusConfig.title,
          W / 2,
          headerBox.y + Math.round(headerBox.height * 0.67),
          headerBox.width - 72,
          typography.statusHeadlinePx,
          44,
          '800',
          '"Plus Jakarta Sans", sans-serif',
          'center'
        );

        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        fitAndDrawSingleLine(
          ctx,
          statusConfig.kicker,
          W / 2,
          headerBox.y + headerBox.height - 20,
          headerBox.width - 80,
          typography.kickerPx,
          17,
          '600',
          '"DM Sans", sans-serif',
          'center'
        );
        ctx.restore();

        // 2. PHOTO FLEX BLOCK (flex: 1 proportional height)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoBox.x, photoBox.y, photoBox.width, photoBox.height, 24);
        ctx.clip();

        if (img.width && img.height) {
          const imgRatio = img.width / img.height;
          const boxRatio = photoBox.width / photoBox.height;
          let sx = 0,
            sy = 0,
            sWidth = img.width,
            sHeight = img.height;

          if (imgRatio > boxRatio) {
            sWidth = img.height * boxRatio;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / boxRatio;
            sy = (img.height - sHeight) / 2;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, photoBox.x, photoBox.y, photoBox.width, photoBox.height);
        } else {
          ctx.fillStyle = '#E5E0D8';
          ctx.fillRect(photoBox.x, photoBox.y, photoBox.width, photoBox.height);
          ctx.fillStyle = '#111315';
          ctx.font = '800 72px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            pet.species === 'cat' ? '🐱' : '🐶',
            W / 2,
            photoBox.y + photoBox.height / 2
          );
        }

        // Bottom scrim on photo for Barrio pill
        const scrim = ctx.createLinearGradient(
          0,
          photoBox.y + photoBox.height - 130,
          0,
          photoBox.y + photoBox.height
        );
        scrim.addColorStop(0, 'rgba(0,0,0,0)');
        scrim.addColorStop(1, 'rgba(0,0,0,0.72)');
        ctx.fillStyle = scrim;
        ctx.fillRect(photoBox.x, photoBox.y + photoBox.height - 130, photoBox.width, 130);
        ctx.restore();

        // Editorial border around photo
        ctx.save();
        ctx.strokeStyle = 'rgba(17, 19, 21, 0.12)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(photoBox.x, photoBox.y, photoBox.width, photoBox.height, 24);
        ctx.stroke();

        // Barrio Pill anchored inside bottom of photoBox
        const barrioLabel = `📍 ${pet.barrio.toUpperCase()} · VENADO TUERTO`;
        ctx.font = '700 22px "JetBrains Mono", monospace';
        const pillW = Math.min(photoBox.width - 40, ctx.measureText(barrioLabel).width + 52);
        const pillH = 52;
        const pillX = (W - pillW) / 2;
        const pillY = photoBox.y + photoBox.height - 68;

        ctx.fillStyle = '#111315';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 14);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        fitAndDrawSingleLine(
          ctx,
          barrioLabel,
          W / 2,
          pillY + pillH / 2,
          pillW - 28,
          22,
          16,
          '700',
          '"JetBrains Mono", monospace',
          'center'
        );
        ctx.restore();

        // 3. IDENTITY FLEX BLOCK (Name + Species/Breed/Color + Reference Corner & Date)
        ctx.save();
        ctx.fillStyle = '#111315';
        ctx.textBaseline = 'top';
        fitAndDrawSingleLine(
          ctx,
          pet.name,
          W / 2,
          identityBox.y + 4,
          identityBox.width - 20,
          typography.nameMaxPx,
          typography.nameMinPx,
          '800',
          '"Plus Jakarta Sans", sans-serif',
          'center'
        );

        const traitsText = `${pet.species === 'cat' ? 'Gato' : 'Perro'} · ${pet.breed || 'Mestizo'} · ${pet.color}`;
        ctx.fillStyle = statusConfig.badgeText;
        fitAndDrawSingleLine(
          ctx,
          traitsText,
          W / 2,
          identityBox.y + Math.round(identityBox.height * 0.48),
          identityBox.width - 20,
          typography.traitsPx,
          18,
          '700',
          '"DM Sans", sans-serif',
          'center'
        );

        const refAndDateText = `Esquina / Ref: ${pet.addressOrReference || pet.barrio} · Fecha: ${pet.date}`;
        ctx.fillStyle = '#52525B';
        fitAndDrawSingleLine(
          ctx,
          refAndDateText,
          W / 2,
          identityBox.y + Math.round(identityBox.height * 0.76),
          identityBox.width - 24,
          typography.metaDateRefPx,
          16,
          '500',
          '"JetBrains Mono", monospace',
          'center'
        );
        ctx.restore();

        // 4. DESCRIPTION FLEX BLOCK
        ctx.save();
        ctx.fillStyle = '#F2ECE1';
        ctx.beginPath();
        ctx.roundRect(
          descriptionBox.x,
          descriptionBox.y,
          descriptionBox.width,
          descriptionBox.height,
          22
        );
        ctx.fill();

        ctx.strokeStyle = 'rgba(17, 19, 21, 0.07)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#27272A';
        ctx.font = `500 ${typography.descriptionPx}px "DM Sans", sans-serif`;
        ctx.textBaseline = 'top';
        drawPixelWrappedText(
          ctx,
          pet.description || 'Por favor comunicate si tenés cualquier información.',
          W / 2,
          descriptionBox.y + 24,
          descriptionBox.width - 56,
          typography.descriptionLineHeight,
          typography.descriptionMaxLines,
          'center'
        );
        ctx.restore();

        // 5. CONTACT CTA FLEX BLOCK
        ctx.save();
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(contactBox.x, contactBox.y, contactBox.width, contactBox.height, 24);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.textBaseline = 'top';
        fitAndDrawSingleLine(
          ctx,
          `CONTACTO DIRECTO EN VENADO TUERTO · ${pet.authorName.toUpperCase()}`,
          W / 2,
          contactBox.y + 18,
          contactBox.width - 48,
          typography.contactLabelPx,
          14,
          '700',
          '"JetBrains Mono", monospace',
          'center'
        );

        ctx.fillStyle = '#FFFFFF';
        fitAndDrawSingleLine(
          ctx,
          `💬 WhatsApp: ${formattedPhone}`,
          W / 2,
          contactBox.y + Math.round(contactBox.height * 0.45),
          contactBox.width - 48,
          typography.contactPhonePx,
          24,
          '800',
          '"Plus Jakarta Sans", sans-serif',
          'center'
        );
        ctx.restore();

        // 6. COMMERCIAL SPONSOR FOOTER FLEX BLOCK
        ctx.save();
        ctx.textBaseline = 'top';
        const sponsorText = activeSponsor
          ? `ESPACIO COMUNITARIO IMPULSADO POR ${activeSponsor.name.toUpperCase()} (${activeSponsor.address.toUpperCase()})`
          : 'HUELLA VT · RED CIUDADANA DE BIENESTAR ANIMAL VENADO TUERTO';

        ctx.fillStyle = '#F59E0B';
        fitAndDrawSingleLine(
          ctx,
          sponsorText,
          W / 2,
          footerBox.y + 18,
          footerBox.width - 20,
          typography.sponsorTitlePx,
          15,
          '700',
          '"JetBrains Mono", monospace',
          'center'
        );

        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        const sponsorSub = activeSponsor
          ? `${activeSponsor.promoTitle} · Cupón: ${activeSponsor.couponCode} · huellavt.org`
          : 'Publicá, difundí o adoptá gratis en huellavt.org · Venado Tuerto, Santa Fe';
        fitAndDrawSingleLine(
          ctx,
          sponsorSub,
          W / 2,
          footerBox.y + 52,
          footerBox.width - 20,
          typography.sponsorSubPx,
          13,
          '500',
          '"DM Sans", sans-serif',
          'center'
        );
        ctx.restore();
      } else {
        // ====================================================================
        // LAYOUT B: 1080x1080 SQUARE FEED POST (2-COLUMN EDITORIAL FLEX)
        // ====================================================================
        const margin = 40;
        const footerH = 92;
        const cardX = margin;
        const cardY = margin;
        const cardW = W - margin * 2;
        const cardH = H - margin * 2 - footerH;
        const headerH = 148;

        ctx.save();
        ctx.fillStyle = '#FAF7F2';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 32);
        ctx.fill();

        ctx.fillStyle = statusConfig.primary;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, headerH, [32, 32, 0, 0]);
        ctx.fill();

        ctx.fillStyle = 'rgba(17, 19, 21, 0.22)';
        ctx.fillRect(cardX, cardY, cardW, 44);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 17px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐾 HUELLA VT · VENADO TUERTO', cardX + 28, cardY + 22);
        ctx.textAlign = 'right';
        ctx.fillText(`FECHA: ${pet.date}`, cardX + cardW - 28, cardY + 22);

        ctx.textBaseline = 'alphabetic';
        fitAndDrawSingleLine(
          ctx,
          statusConfig.title,
          W / 2,
          cardY + 118,
          cardW - 60,
          56,
          38,
          '800',
          '"Plus Jakarta Sans", sans-serif',
          'center'
        );
        ctx.restore();

        const bodyY = cardY + headerH + 26;
        const bodyH = cardH - headerH - 52;
        const photoX = cardX + 26;
        const photoW = 430;
        const photoH = bodyH;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX, bodyY, photoW, photoH, 20);
        ctx.clip();

        if (img.width && img.height) {
          const imgRatio = img.width / img.height;
          const boxRatio = photoW / photoH;
          let sx = 0,
            sy = 0,
            sWidth = img.width,
            sHeight = img.height;
          if (imgRatio > boxRatio) {
            sWidth = img.height * boxRatio;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / boxRatio;
            sy = (img.height - sHeight) / 2;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, photoX, bodyY, photoW, photoH);
        } else {
          ctx.fillStyle = '#E5E0D8';
          ctx.fillRect(photoX, bodyY, photoW, photoH);
        }
        ctx.restore();

        const rightX = photoX + photoW + 28;
        const rightW = cardW - photoW - 80;

        ctx.save();
        ctx.fillStyle = '#111315';
        ctx.beginPath();
        ctx.roundRect(rightX, bodyY, rightW, 46, 12);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        fitAndDrawSingleLine(
          ctx,
          `📍 ${pet.barrio.toUpperCase()}`,
          rightX + rightW / 2,
          bodyY + 23,
          rightW - 24,
          20,
          14,
          '700',
          '"JetBrains Mono", monospace',
          'center'
        );

        ctx.fillStyle = '#111315';
        ctx.textBaseline = 'top';
        fitAndDrawSingleLine(
          ctx,
          pet.name,
          rightX,
          bodyY + 62,
          rightW,
          44,
          26,
          '800',
          '"Plus Jakarta Sans", sans-serif',
          'left'
        );

        ctx.fillStyle = statusConfig.badgeText;
        fitAndDrawSingleLine(
          ctx,
          `${pet.breed || 'Mestizo'} · ${pet.color}`,
          rightX,
          bodyY + 118,
          rightW,
          22,
          15,
          '700',
          '"DM Sans", sans-serif',
          'left'
        );

        ctx.fillStyle = '#52525B';
        fitAndDrawSingleLine(
          ctx,
          `Ref: ${pet.addressOrReference || pet.barrio}`,
          rightX,
          bodyY + 150,
          rightW,
          19,
          14,
          '500',
          '"JetBrains Mono", monospace',
          'left'
        );

        const descY = bodyY + 186;
        const descH = bodyH - 186 - 122;
        ctx.fillStyle = '#F2ECE1';
        ctx.beginPath();
        ctx.roundRect(rightX, descY, rightW, descH, 16);
        ctx.fill();

        ctx.fillStyle = '#27272A';
        ctx.font = '500 22px "DM Sans", sans-serif';
        ctx.textBaseline = 'top';
        drawPixelWrappedText(
          ctx,
          pet.description || 'Por favor comunicate si tenés cualquier dato.',
          rightX + 20,
          descY + 18,
          rightW - 40,
          31,
          5,
          'left'
        );

        const ctaY = bodyY + bodyH - 104;
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(rightX, ctaY, rightW, 104, 18);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        fitAndDrawSingleLine(
          ctx,
          `CONTACTO: ${pet.authorName.toUpperCase()}`,
          rightX + rightW / 2,
          ctaY + 16,
          rightW - 24,
          17,
          13,
          '700',
          '"JetBrains Mono", monospace',
          'center'
        );

        ctx.fillStyle = '#FFFFFF';
        fitAndDrawSingleLine(
          ctx,
          `💬 ${formattedPhone}`,
          rightX + rightW / 2,
          ctaY + 46,
          rightW - 28,
          32,
          20,
          '800',
          '"Plus Jakarta Sans", sans-serif',
          'center'
        );
        ctx.restore();

        // Sponsor footer
        ctx.save();
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#F59E0B';
        const sponsorLine = activeSponsor
          ? `IMPULSADO POR ${activeSponsor.name.toUpperCase()} · ${activeSponsor.address.toUpperCase()}`
          : 'HUELLA VT · RED DE MASCOTAS PERDIDAS Y ADOPCIONES DE VENADO TUERTO';
        fitAndDrawSingleLine(
          ctx,
          sponsorLine,
          W / 2,
          cardY + cardH + 22,
          cardW,
          19,
          14,
          '700',
          '"JetBrains Mono", monospace',
          'center'
        );
        ctx.restore();
      }

      if (!isCancelled) {
        setDownloadUrl(canvas.toDataURL('image/png'));
        setIsRendering(false);
      }
    };

    renderPoster();

    return () => {
      isCancelled = true;
    };
  }, [pet, activeSponsor, posterFormat, statusConfig, formattedPhone]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const suffix = posterFormat === 'story_9_16' ? 'story-1080x1920' : 'post-1080x1080';
    a.download = `huellavt-${pet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${suffix}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCaption = async () => {
    const caption = `🚨 ${statusConfig.title} EN VENADO TUERTO 🚨\n🐾 Nombre: ${pet.name} (${pet.breed} · ${pet.color})\n📍 Zona: ${pet.barrio} (${pet.addressOrReference || pet.barrio})\n📅 Fecha: ${pet.date}\n📝 Detalles: ${pet.description}\n📲 Contacto directo WhatsApp: ${formattedPhone} (${pet.authorName})\n\nDifundido desde Huella VT • Radar Animal Venado Tuerto`;
    await navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${statusConfig.title}: ${pet.name} en ${pet.barrio} (Venado Tuerto)`,
          text: `Ayudanos a difundir a ${pet.name} en ${pet.barrio}. Contacto: ${formattedPhone}`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generador de cartel para redes sociales"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col bg-white dark:bg-[#14171A] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-[#111315] dark:text-[#EDEDED]">
        {/* Sticky Header */}
        <div className="px-5 py-4 border-b border-black/8 dark:border-white/8 flex items-center justify-between gap-3 bg-white dark:bg-[#14171A] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-[#FF4D38]/10 text-[#FF4D38] shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg leading-tight truncate">
                  Afiche Editorial 1080×1920px
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  <Sliders className="w-3 h-3" />
                  Flex Scale {Math.round(layoutScaleInfo * 100)}%
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                Auto-escalado proporcional de fuentes y márgenes · Sin desbordes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Format Selector Bar (9:16 Story vs 1:1 Feed Post) */}
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80">
            <button
              type="button"
              onClick={() => setPosterFormat('story_9_16')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-display font-bold transition cursor-pointer ${
                posterFormat === 'story_9_16'
                  ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF4D38]" />
              <span>Story / Estado (1080×1920)</span>
            </button>

            <button
              type="button"
              onClick={() => setPosterFormat('post_1_1')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-display font-bold transition cursor-pointer ${
                posterFormat === 'post_1_1'
                  ? 'bg-white dark:bg-[#14171A] text-[#111315] dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Post Cuadrado / Feed (1:1)</span>
            </button>
          </div>

          {/* Canvas Preview Container */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-full ${
                posterFormat === 'story_9_16'
                  ? 'max-w-[245px] aspect-[9/16]'
                  : 'max-w-[340px] aspect-square'
              } rounded-xl overflow-hidden shadow-2xl border border-black/15 dark:border-white/15 bg-neutral-900 transition-all duration-300`}
            >
              {isRendering && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 text-white z-10 gap-3">
                  <div className="w-8 h-8 border-3 border-[#FF4D38] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono">Componiendo flex-layout 1080×1920...</span>
                </div>
              )}
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="px-5 py-3.5 border-t border-black/8 dark:border-white/8 bg-white dark:bg-[#14171A] flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isRendering || !downloadUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm bg-[#111315] hover:bg-[#FF4D38] text-white dark:bg-[#FAF7F2] dark:hover:bg-[#FF4D38] dark:text-[#111315] dark:hover:text-white transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PNG HD</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCaption}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl font-display font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111315] dark:text-white transition cursor-pointer"
          >
            {copiedCaption ? (
              <>
                <Check className="w-4 h-4 text-[#10B981]" />
                <span>Texto Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto Red</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl font-display font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111315] dark:text-white transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-[#10B981]" />
                <span>Link Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
