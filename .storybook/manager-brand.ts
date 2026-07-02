const APP_TITLE = 'ИС «Отчёты» · UI-kit';
const UNIVERSITY = 'СПбГЭТУ «ЛЭТИ»';
const MARK = 'data-etu-brand';

function findBrandAnchor(): HTMLAnchorElement | null {
  const sidebar = document.querySelector('.sidebar-container');
  if (sidebar) {
    const link = sidebar.querySelector('a > img')?.closest('a');
    if (link instanceof HTMLAnchorElement) return link;
  }

  const search = document.getElementById('storybook-explorer-searchfield');

  if (search) {
    let node: HTMLElement | null = search.parentElement;
    for (let depth = 0; depth < 12 && node; depth += 1) {
      const link = node.querySelector('a > img')?.closest('a');
      if (link instanceof HTMLAnchorElement) {
        const order = link.compareDocumentPosition(search);
        if (order & Node.DOCUMENT_POSITION_FOLLOWING) {
          return link;
        }
      }
      node = node.parentElement;
    }
  }

  const byAlt = document.querySelector('a > img[alt*="Отч"]')?.closest('a');
  if (byAlt instanceof HTMLAnchorElement) return byAlt;

  const firstLogo = document.querySelector('a > img[src*="logo"]')?.closest('a');
  return firstLogo instanceof HTMLAnchorElement ? firstLogo : null;
}

function isBrandMounted(): boolean {
  return Boolean(document.querySelector(`[${MARK}] .etu-sb-brand__university`));
}

/** Собирает шапку sidebar: логотип + название + вуз. */
export function mountSidebarBrand(): void {
  let observer: MutationObserver | undefined;
  let pending = false;

  const mount = (): boolean => {
    if (isBrandMounted()) return true;

    const link = findBrandAnchor();
    const brand = link?.parentElement;
    if (!brand || !link) return false;

    const imgSrc = link.querySelector('img')?.getAttribute('src') ?? '/logo-leti.png';
    const href = link.getAttribute('href') ?? '/';

    brand.setAttribute(MARK, '');
    brand.classList.add('etu-sb-brand');
    brand.replaceChildren();

    const logoLink = document.createElement('a');
    logoLink.href = href;
    logoLink.className = 'etu-sb-brand__link';

    const logo = document.createElement('img');
    logo.src = imgSrc;
    logo.alt = APP_TITLE;
    logoLink.append(logo);

    const text = document.createElement('div');
    text.className = 'etu-sb-brand__text';

    const title = document.createElement('span');
    title.className = 'etu-sb-brand__title';
    title.textContent = APP_TITLE;

    const uni = document.createElement('span');
    uni.className = 'etu-sb-brand__university';
    uni.textContent = UNIVERSITY;

    text.append(title, uni);
    brand.append(logoLink, text);

    return true;
  };

  const schedule = (): void => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (mount() && observer) {
        observer.disconnect();
        observer = undefined;
      }
    });
  };

  schedule();

  observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => {
    observer?.disconnect();
    observer = undefined;
  }, 30_000);
}
