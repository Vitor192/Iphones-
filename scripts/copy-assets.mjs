import { cp, mkdir } from 'node:fs/promises';

await mkdir('dist/assets', { recursive: true });
await cp('assets/iphone-18-pro-max.glb', 'dist/assets/iphone-18-pro-max.glb');
await cp('assets/iphone18-promax-back.jpeg', 'dist/assets/iphone18-promax-back.jpeg');
