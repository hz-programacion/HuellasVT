import test from 'node:test';
import assert from 'node:assert/strict';
import { findSmartMatches, normalizeText } from './matching';
import { Pet } from '../types';

test('normalizeText strips accents, lowercase and removes short tokens', () => {
  const tokens = normalizeText('Marrón con collar ROJO y manchas!');
  assert.ok(tokens.includes('marron'));
  assert.ok(tokens.includes('collar'));
  assert.ok(tokens.includes('rojo'));
  assert.ok(tokens.includes('manchas'));
  assert.ok(!tokens.includes('y')); // filtered short word
});

test('findSmartMatches pairs a lost dog with a found dog in the same barrio and similar colors', () => {
  const lostDog: Pet = {
    id: 'lost-1',
    name: 'Toby',
    status: 'lost',
    species: 'dog',
    breed: 'Mestizo tipo Caniche',
    color: 'Blanco con orejas canela',
    gender: 'male',
    barrio: 'Barrio Centro',
    addressOrReference: 'San Martín y Rivadavia',
    date: '2026-11-10',
    description: 'Tiene collar rojo desgastado, es asustadizo.',
    collarInfo: 'Collar rojo',
    photoBase64: 'data:image/webp;base64,...',
    authorName: 'Carlos',
    authorWhatsApp: '3462551234',
    createdAt: Date.now() - 86400000,
  };

  const foundDogSameBarrio: Pet = {
    id: 'found-1',
    name: 'Sin identificar',
    status: 'found',
    species: 'dog',
    breed: 'Caniche cruza',
    color: 'Blanco clarito',
    gender: 'male',
    barrio: 'Barrio Centro',
    addressOrReference: 'Plaza San Martín',
    date: '2026-11-11',
    description: 'Encontrado caniche blanco con collar rojo',
    collarInfo: 'Collar rojo de tela',
    photoBase64: 'data:image/webp;base64,...',
    authorName: 'Lucía',
    authorWhatsApp: '3462669874',
    createdAt: Date.now(),
  };

  const foundCatDifferentSpecies: Pet = {
    id: 'found-2',
    name: 'Gato siamés',
    status: 'found',
    species: 'cat',
    breed: 'Siamés',
    color: 'Blanco y marrón',
    gender: 'male',
    barrio: 'Barrio Centro',
    addressOrReference: 'Belgrano 100',
    date: '2026-11-11',
    description: 'Gato siamés encontrado',
    photoBase64: 'data:image/webp;base64,...',
    authorName: 'Mariana',
    authorWhatsApp: '3462112233',
    createdAt: Date.now(),
  };

  const results = findSmartMatches(lostDog, [foundDogSameBarrio, foundCatDifferentSpecies]);

  assert.equal(results.length, 1);
  assert.equal(results[0].pet.id, 'found-1');
  assert.ok(results[0].matchScore >= 60, `Expected matchScore >= 60, got ${results[0].matchScore}`);
  assert.ok(results[0].reasons.some((r) => r.includes('Mismo barrio')));
});
