import { resolve } from 'node:path';
import { type Region, type ResizeOptions } from 'sharp';

const assets = resolve('website/src/assets');

export const generated = resolve('website/static/assets/generated');

const images = resolve(assets, 'images');

export const ui = resolve(images, 'ui');

export const scenery = resolve(images, 'scenery');

export const imagesToGenerate: [
  string,
  string,
  {
    extract?: Region;
    resize: ResizeOptions;
  },
][] = [
  [
    'stone-frame.webp',
    resolve(ui, 'stone-frame.png'),
    {
      extract: {
        left: 57,
        top: 57,
        width: 1140,
        height: 1140,
      },
      resize: {
        width: 384,
      },
    },
  ],
  [
    'oak-frame.webp',
    resolve(ui, 'oak-frame.png'),
    {
      extract: {
        left: 57,
        top: 57,
        width: 1140,
        height: 1140,
      },
      resize: {
        width: 512,
      },
    },
  ],
  [
    'oak-drape-start.webp',
    resolve(ui, 'oak-frame.png'),
    {
      extract: {
        left: 0,
        top: 0,
        width: 384,
        height: 448,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'oak-drape-end.webp',
    resolve(ui, 'oak-frame.png'),
    {
      extract: {
        left: 870,
        top: 57,
        width: 384,
        height: 448,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'stone-foot-start.webp',
    resolve(ui, 'stone-frame.png'),
    {
      extract: {
        left: 0,
        top: 998,
        width: 384,
        height: 256,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'stone-foot-end.webp',
    resolve(ui, 'stone-frame.png'),
    {
      extract: {
        left: 870,
        top: 998,
        width: 384,
        height: 256,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'profile-lantern.webp',
    resolve(generated, 'rail-profile-lantern.png'),
    {
      resize: {
        width: 96,
      },
    },
  ],
  [
    'aged-oak.webp',
    resolve(ui, 'charcoal-planks.png'),
    {
      resize: {
        width: 160,
      },
    },
  ],
];
