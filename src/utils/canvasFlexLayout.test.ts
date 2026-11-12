import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStoryFlexLayout } from './canvasFlexLayout';
import { resolvePetCoordinates, VENADO_TUERTO_CENTER } from './venadoTuertoCoords';
import { INITIAL_PETS } from '../services/seedData';

test('computeStoryFlexLayout fits all flex boxes strictly inside 1080x1920 without overlap', () => {
  const layout = computeStoryFlexLayout({
    name: 'Sin identificar (Encontrado en Barrio Centro)',
    breed: 'Mestizo mediano orejas caídas',
    color: 'Marrón claro con pecho blanco y manchas canelas',
    barrio: 'Barrio Centro',
    addressOrReference: 'San Martín y 25 de Mayo, frente a la plaza principal',
    date: '2026-11-11',
    description:
      'Encontrado desorientado siguiendo a los peatones cerca del centro comercial. Es sumamente manso, tiene collar de cuero marrón gastado y busca a su familia.',
    contactName: 'Gonzalo Rossi',
    contactPhone: '3462 634421',
    hasSponsor: true,
  });

  assert.equal(layout.canvasWidth, 1080);
  assert.equal(layout.canvasHeight, 1920);

  // Verify strict vertical ordering with zero overlap
  assert.ok(layout.headerBox.y >= layout.cardBox.y);
  assert.ok(layout.photoBox.y >= layout.headerBox.y + layout.headerBox.height);
  assert.ok(layout.identityBox.y >= layout.photoBox.y + layout.photoBox.height);
  assert.ok(layout.descriptionBox.y >= layout.identityBox.y + layout.identityBox.height);
  assert.ok(layout.contactBox.y >= layout.descriptionBox.y + layout.descriptionBox.height);
  assert.ok(
    layout.contactBox.y + layout.contactBox.height <= layout.cardBox.y + layout.cardBox.height
  );
  assert.ok(
    layout.footerBox.y + layout.footerBox.height <= layout.canvasHeight
  );
});

test('computeStoryFlexLayout dynamically scales font sizes down for dense text vs short text', () => {
  const shortLayout = computeStoryFlexLayout({
    name: 'Milo',
    breed: 'Beagle',
    color: 'Tricolor',
    barrio: 'Barrio Centro',
    addressOrReference: 'Belgrano 400',
    date: '2026-11-11',
    description: 'Muy dócil.',
    contactName: 'Flor',
    contactPhone: '3462 551423',
    hasSponsor: true,
  });

  const denseLayout = computeStoryFlexLayout({
    name: 'Perrito Mestizo Encontrado en la Ruta 8',
    breed: 'Cruza Ovejero',
    color: 'Negro y fuego',
    barrio: 'Zona Rural / Quintas',
    addressOrReference: 'Rotonda de Ruta 8 y Ruta 33 cerca del acceso sur',
    date: '2026-11-11',
    description:
      'Estaba corriendo al costado de la ruta muy asustado por los camiones. Lo subimos al auto y ahora está resguardado en tránsito esperando que aparezcan sus dueños.',
    contactName: 'Martín',
    contactPhone: '3462 551423',
    hasSponsor: true,
  });

  assert.ok(denseLayout.scaleFactor < shortLayout.scaleFactor);
  assert.ok(denseLayout.typography.nameMaxPx < shortLayout.typography.nameMaxPx);
  assert.ok(denseLayout.descriptionBox.height > shortLayout.descriptionBox.height);
});

test('resolvePetCoordinates returns valid Venado Tuerto coordinates for all seed pets', () => {
  for (const pet of INITIAL_PETS) {
    const coords = resolvePetCoordinates(pet);
    assert.ok(Math.abs(coords.lat - VENADO_TUERTO_CENTER.lat) < 0.05);
    assert.ok(Math.abs(coords.lng - VENADO_TUERTO_CENTER.lng) < 0.05);
  }
});
