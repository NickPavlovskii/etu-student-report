import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

const PUBLISH_DIR = 'dist/netlify-publish';
const isStorybook = process.env.NETLIFY_STORYBOOK === 'true';

if (existsSync(PUBLISH_DIR)) {
  rmSync(PUBLISH_DIR, { recursive: true, force: true });
}

if (isStorybook) {
  execSync('npm run build-storybook', { stdio: 'inherit' });
  cpSync('storybook-static', PUBLISH_DIR, { recursive: true });
} else {
  execSync('npm run build', { stdio: 'inherit' });
  cpSync('dist/frontend/contents/panda/client', PUBLISH_DIR, { recursive: true });
}
