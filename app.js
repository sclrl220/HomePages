const favorites = [
  { name: "Gemini", symbol: "G", accent: "#4d6bfe", url: "https://gemini.google.com/" },
  { name: "Grok", symbol: "K", accent: "#1c1c1c", url: "https://grok.com/" },
  { name: "YouTube", symbol: "▶", accent: "#ff3157", url: "https://www.youtube.com/" },
  { name: "X", symbol: "X", accent: "#111111", url: "https://x.com/" },
  { name: "Instagram", symbol: "Ig", accent: "#ff81b4", url: "https://www.instagram.com/" },
  { name: "Pinterest", symbol: "P", accent: "#e60023", url: "https://www.pinterest.com/" },
  { name: "Spotify", symbol: "S", accent: "#1db954", url: "https://open.spotify.com/" },
  { name: "Z-Library", symbol: "Z", accent: "#c4b48a", url: "https://z-library.sk/" },
  { name: "YG", symbol: "Y", accent: "#d4a017", url: "https://www.ygfamily.com/" },
  { name: "Discord", symbol: "D", accent: "#5865f2", url: "https://discord.com/" },
];

const defaultCategories = [
  {
    id: "ai",
    name: "AI",
    sites: [
      { name: "DeepSeek", description: "深度求索 AI 助手", symbol: "鲸", accent: "#6593fb", url: "https://chat.deepseek.com/" },
      { name: "豆包", description: "字节系 AI 助手", symbol: "豆", accent: "#6e90f4", url: "https://www.doubao.com/" },
      { name: "Kimi", description: "中文长文本与检索", symbol: "K", accent: "#1d2733", url: "https://www.kimi.com/" },
      { name: "通义千问", description: "阿里云大模型助手", symbol: "通", accent: "#7257f6", url: "https://tongyi.aliyun.com/" },
      { name: "智谱清言", description: "智谱 AI 对话助手", symbol: "智", accent: "#386cdb", url: "https://chatglm.cn/" },
      { name: "MiniMax 海螺", description: "MiniMax 智能助手", symbol: "M", accent: "#f36c81", url: "https://hailuoai.com/" },
    ],
  },
  {
    id: "reading",
    name: "资讯",
    sites: [
      { name: "今日头条", description: "看见更大的世界", symbol: "头", accent: "#ec514d", url: "https://www.toutiao.com/" },
      { name: "腾讯新闻", description: "新闻资讯与热点", symbol: "讯", accent: "#4f81e9", url: "https://news.qq.com/" },
      { name: "网易新闻", description: "热点新闻与评论", symbol: "易", accent: "#d4393e", url: "https://news.163.com/" },
      { name: "新浪新闻", description: "综合新闻资讯平台", symbol: "新", accent: "#c85355", url: "https://news.sina.com.cn/" },
      { name: "微信读书", description: "和好友共读好书", symbol: "读", accent: "#42b990", url: "https://weread.qq.com/" },
      { name: "创业邦", description: "创业创新媒体平台", symbol: "邦", accent: "#e19a52", url: "https://www.cyzone.cn/" },
    ],
  },
];

const searchEngines = {
  baidu: { label: "百度", symbol: "百", url: "https://www.baidu.com/s?wd=" },
  google: { label: "谷歌", symbol: "G", url: "https://www.google.com/search?q=" },
};

const storageKey = "beiyu-directory-custom-sites";
const categoryStorageKey = "beiyu-directory-custom-categories";
const siteSettingsStorageKey = "beiyu-directory-site-settings";
const favoriteSettingsStorageKey = "beiyu-favorite-settings";
const favoritesRail = document.querySelector("#favorites-rail");
const categoryList = document.querySelector("#category-list");
const searchInput = document.querySelector("#search-input");
const searchEngine = document.querySelector("#search-engine");
const engineControl = document.querySelector(".engine-control");
const engineSymbol = document.querySelector("#engine-symbol");
const engineCurrent = document.querySelector("#engine-current");
const engineTrigger = document.querySelector("#engine-trigger");
const engineOptions = document.querySelector("#engine-options");
const addDialog = document.querySelector("#add-dialog");
const addForm = document.querySelector("#add-form");
const categorySelect = document.querySelector("#category-select");
const formError = document.querySelector("#form-error");
const categoryDialog = document.querySelector("#category-dialog");
const categoryForm = document.querySelector("#category-form");
const categoryFormError = document.querySelector("#category-form-error");
const favoriteDialog = document.querySelector("#favorite-dialog");
const favoriteForm = document.querySelector("#favorite-form");
const favoriteFormError = document.querySelector("#favorite-form-error");
const moveFavoriteDialog = document.querySelector("#move-favorite-dialog");
const moveFavoriteForm = document.querySelector("#move-favorite-form");
const moveFavoriteCategory = document.querySelector("#move-favorite-category");
const moveFavoriteError = document.querySelector("#move-favorite-error");
let editingSiteId = null;
let draggedSiteId = null;
let draggedCategoryId = null;
let editingFavoriteId = null;
let draggedFavoriteId = null;
let movingFavorite = null;
let favoritePreviewOrder = null;
let favoriteStartPositions = null;
let favoriteSlotPositions = null;
let favoriteDropCommitted = false;
let sitePreviewOrder = null;
let siteSlotPositions = null;
const siteMenuOwners = new WeakMap();
const favoriteMenuOwners = new WeakMap();

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function readCustomSites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(saved)) {
      throw new TypeError("Saved navigation data must be a list.");
    }
    return saved.filter(
      (site) =>
        site &&
        typeof site.name === "string" &&
        typeof site.description === "string" &&
        typeof site.category === "string" &&
        safeExternalUrl(site.url),
    );
  } catch (error) {
    console.error("Unable to load saved navigation links.", error);
    return [];
  }
}

function readCustomCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(categoryStorageKey) || "[]");
    if (!Array.isArray(saved)) {
      throw new TypeError("Saved categories must be a list.");
    }
    return saved.filter(
      (category) =>
        category &&
        typeof category.id === "string" &&
        typeof category.name === "string" &&
        category.id.trim() &&
        category.name.trim(),
    );
  } catch (error) {
    console.error("Unable to load saved navigation categories.", error);
    return [];
  }
}

function readSiteSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(siteSettingsStorageKey) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      throw new TypeError("Saved site settings must be an object.");
    }
    return {
      overrides: saved.overrides && typeof saved.overrides === "object" ? saved.overrides : {},
      deleted: Array.isArray(saved.deleted) ? saved.deleted.filter((id) => typeof id === "string") : [],
      orders: saved.orders && typeof saved.orders === "object" ? saved.orders : {},
    };
  } catch (error) {
    console.error("Unable to load saved website settings.", error);
    return { overrides: {}, deleted: [], orders: {} };
  }
}

function readFavoriteSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(favoriteSettingsStorageKey) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      throw new TypeError("Saved shortcut settings must be an object.");
    }
    return {
      overrides: saved.overrides && typeof saved.overrides === "object" ? saved.overrides : {},
      deleted: Array.isArray(saved.deleted) ? saved.deleted.filter((id) => typeof id === "string") : [],
      order: Array.isArray(saved.order) ? saved.order.filter((id) => typeof id === "string") : [],
      custom: Array.isArray(saved.custom)
        ? saved.custom.filter(
            (site) =>
              site &&
              typeof site.id === "string" &&
              typeof site.name === "string" &&
              safeExternalUrl(site.url),
          )
        : [],
    };
  } catch (error) {
    console.error("Unable to load saved shortcuts.", error);
    return { overrides: {}, deleted: [], order: [], custom: [] };
  }
}

function getFavorites() {
  const settings = readFavoriteSettings();
  const visibleFavorites = [
    ...favorites.map((site) => ({
      ...site,
      id: site.url,
      ...(settings.overrides[site.url] || {}),
    })),
    ...settings.custom.map((site) => ({
      ...site,
      ...(settings.overrides[site.id] || {}),
    })),
  ]
    .filter((site) => !settings.deleted.includes(site.id));
  if (settings.order.length) {
    const positions = new Map(settings.order.map((id, index) => [id, index]));
    visibleFavorites.sort((a, b) => {
      const aPosition = positions.get(a.id);
      const bPosition = positions.get(b.id);
      if (aPosition === undefined && bPosition === undefined) return 0;
      if (aPosition === undefined) return 1;
      if (bPosition === undefined) return -1;
      return aPosition - bPosition;
    });
  }
  return visibleFavorites;
}

function getCategories() {
  const settings = readSiteSettings();
  const categories = defaultCategories.map((category) => ({
    ...category,
    sites: category.sites.map((site) => ({
      ...site,
      id: site.id || site.url,
      ...(settings.overrides[site.id || site.url] || {}),
    })),
  }));
  for (const category of readCustomCategories()) {
    if (!categories.some((item) => item.id === category.id)) {
      categories.push({ ...category, sites: [] });
    }
  }
  for (const category of categories) {
    const movedSites = [];
    category.sites = category.sites.filter((site) => {
      if (site.category && site.category !== category.id) {
        movedSites.push(site);
        return false;
      }
      return true;
    });
    for (const site of movedSites) {
      const destination = categories.find((item) => item.id === site.category);
      if (destination) destination.sites.push(site);
    }
  }
  for (const site of readCustomSites()) {
    const category = categories.find((item) => item.id === site.category);
    if (category) category.sites.push({ ...site, id: site.id || site.url });
  }
  for (const category of categories) {
    const order = settings.orders[category.id];
    if (Array.isArray(order)) {
      const positions = new Map(order.map((id, index) => [id, index]));
      category.sites.sort((a, b) => {
        const aPosition = positions.get(a.id);
        const bPosition = positions.get(b.id);
        if (aPosition === undefined && bPosition === undefined) return 0;
        if (aPosition === undefined) return 1;
        if (bPosition === undefined) return -1;
        return aPosition - bPosition;
      });
    }
  }
  return categories
    .map((category) => ({
      ...category,
      sites: category.sites.filter((site) => !settings.deleted.includes(site.id)),
    }))
    .filter((category) => category.name);
}

function createSiteIcon(site, className) {
  const icon = document.createElement("span");
  icon.className = className;
  icon.setAttribute("aria-hidden", "true");
  icon.style.setProperty("--accent", site.accent || "#5275a8");
  const symbol = document.createElement("span");
  symbol.className = "icon-symbol";
  symbol.textContent = site.symbol || site.name.slice(0, 1);
  icon.append(symbol);
  const url = safeExternalUrl(site.url);
  if (url) {
    const logo = document.createElement("img");
    logo.className = "site-logo";
    logo.alt = "";
    logo.loading = "lazy";
    logo.referrerPolicy = "no-referrer";
    logo.draggable = false;
    const parsedUrl = new URL(url);
    const iconSources = [
      new URL("/favicon.ico", url).href,
      `https://icons.duckduckgo.com/ip3/${parsedUrl.hostname}.ico`,
      `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=64`,
    ];
    let sourceIndex = 0;
    const loadNextIcon = () => {
      if (sourceIndex >= iconSources.length) {
        console.warn(`Unable to load a website icon for ${parsedUrl.hostname}.`);
        logo.remove();
        return;
      }
      logo.src = iconSources[sourceIndex];
      sourceIndex += 1;
    };
    logo.addEventListener("load", () => {
      if (logo.naturalWidth < 16) {
        loadNextIcon();
        return;
      }
      icon.classList.add("has-logo");
    });
    logo.addEventListener("error", loadNextIcon);
    icon.append(logo);
    loadNextIcon();
  }
  return icon;
}

function renderFavorites() {
  const previousPositions = new Map(
    [...favoritesRail.querySelectorAll(".favorite-card")].map((card) => [
      card.dataset.favoriteId,
      card.getBoundingClientRect(),
    ]),
  );
  const items = getFavorites();
  favoritesRail.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "favorites-empty";
    empty.textContent = "还没有快捷方式，点右侧「＋」把每天会打开的网址放上来。";
    favoritesRail.append(empty);
  }
  for (const site of items) {
    const card = document.createElement("div");
    card.className = "favorite-card";
    card.draggable = true;
    card.dataset.favoriteId = site.id;
    card.style.order = "";
    const link = document.createElement("a");
    link.className = "favorite-link";
    link.href = site.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `打开 ${site.name}`);
    link.draggable = false;
    link.append(createSiteIcon(site, "favorite-icon"));

    const label = document.createElement("span");
    label.className = "favorite-name";
    label.textContent = site.name;
    link.append(label);
    card.append(link, createFavoriteMenu(site));
    favoritesRail.append(card);
  }
  if (items.length < 12) {
    const addCard = document.createElement("button");
    addCard.className = "favorite-add-card";
    addCard.type = "button";
    addCard.setAttribute("aria-label", "添加快捷网址");
    addCard.style.order = String(items.length);
    addCard.innerHTML = '<span aria-hidden="true">＋</span>';
    addCard.addEventListener("click", openAddFavorite);
    favoritesRail.append(addCard);
  }
  animateFavoritePositions(previousPositions);
}

function animateFavoritePositions(previousPositions) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const card of favoritesRail.querySelectorAll(".favorite-card")) {
    const previous = previousPositions.get(card.dataset.favoriteId);
    if (!previous) continue;
    const current = card.getBoundingClientRect();
    const deltaX = previous.left - current.left;
    const deltaY = previous.top - current.top;
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue;
    card.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }
}

function createFavoriteMenu(site) {
  const wrapper = document.createElement("div");
  wrapper.className = "favorite-menu-wrap";
  const trigger = document.createElement("button");
  trigger.className = "favorite-menu-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-label", `管理快捷方式：${site.name}`);
  trigger.setAttribute("aria-expanded", "false");
  trigger.textContent = "⋮";
  const menu = document.createElement("div");
  menu.className = "favorite-menu";
  menu.hidden = true;
  favoriteMenuOwners.set(menu, { wrapper, trigger });

  for (const [action, label] of [
    ["edit", "修改"],
    ["move", "移到分类收藏"],
    ["remove", "移除"],
  ]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    button.textContent = label;
    button.addEventListener("click", () => {
      closeFavoriteMenus();
      if (action === "edit") openEditFavorite(site);
      if (action === "move") openMoveFavorite(site);
      if (action === "remove") removeFavorite(site);
    });
    menu.append(button);
  }

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = menu.hidden;
    closeFavoriteMenus();
    if (shouldOpen) openFloatingMenu(menu, trigger, 190);
  });
  wrapper.append(trigger, menu);
  return wrapper;
}

function openFloatingMenu(menu, trigger, width) {
  const anchor = trigger.getBoundingClientRect();
  const gap = 6;
  const margin = 12;
  menu.hidden = false;
  menu.style.position = "fixed";
  menu.style.width = `min(${width}px, calc(100vw - ${margin * 2}px))`;
  menu.style.zIndex = "10000";
  document.body.append(menu);

  const menuRect = menu.getBoundingClientRect();
  const left = Math.max(
    margin,
    Math.min(anchor.right - menuRect.width, window.innerWidth - menuRect.width - margin),
  );
  const below = anchor.bottom + gap;
  const top = below + menuRect.height <= window.innerHeight - margin
    ? below
    : Math.max(margin, anchor.top - menuRect.height - gap);
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  trigger.setAttribute("aria-expanded", "true");
}

function restoreFloatingMenu(menu, trigger, owners) {
  const owner = owners.get(menu);
  if (owner) owner.wrapper.append(menu);
  menu.hidden = true;
  menu.removeAttribute("style");
  (owner?.trigger || trigger).setAttribute("aria-expanded", "false");
}

function openMoveFavorite(site) {
  const categories = getCategories();
  moveFavoriteCategory.replaceChildren();
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    moveFavoriteCategory.append(option);
  }
  movingFavorite = site;
  moveFavoriteError.hidden = true;
  moveFavoriteDialog.showModal();
}

function moveFavoriteToCategory(site, categoryId) {
  const category = getCategories().find((item) => item.id === categoryId);
  if (!category) return false;
  const customSites = readCustomSites();
  const siteSettings = readSiteSettings();
  const favoriteSettings = readFavoriteSettings();
  const previousFavoriteSettings = readFavoriteSettings();
  const movedSite = {
    id: site.id,
    name: site.name,
    description: new URL(site.url).hostname.replace(/^www\./, ""),
    category: categoryId,
    symbol: site.symbol || site.name.slice(0, 1),
    accent: site.accent || "#5687a8",
    url: site.url,
  };

  if (category.sites.some((item) => item.id === movedSite.id)) return false;
  customSites.push(movedSite);
  try {
    localStorage.setItem(storageKey, JSON.stringify(customSites));
  } catch (error) {
    console.error("Unable to move shortcut into the directory.", error);
    return false;
  }

  if (favoriteSettings.custom.some((item) => item.id === site.id)) {
    favoriteSettings.custom = favoriteSettings.custom.filter((item) => item.id !== site.id);
  } else {
    favoriteSettings.deleted = [...new Set([...favoriteSettings.deleted, site.id])];
  }
  delete favoriteSettings.overrides[site.id];
  favoriteSettings.order = favoriteSettings.order.filter((id) => id !== site.id);
  if (!saveFavoriteSettings(favoriteSettings)) {
    customSites.pop();
    try {
      localStorage.setItem(storageKey, JSON.stringify(customSites));
    } catch (error) {
      console.error("Unable to roll back shortcut move.", error);
    }
    return false;
  }

  siteSettings.deleted = siteSettings.deleted.filter((id) => id !== site.id);
  siteSettings.orders = Object.fromEntries(
    Object.entries(siteSettings.orders).map(([id, order]) => [
      id,
      Array.isArray(order) ? order.filter((siteId) => siteId !== site.id) : order,
    ]),
  );
  if (!saveSiteSettings(siteSettings)) {
    if (!saveFavoriteSettings(previousFavoriteSettings)) {
      console.error("Unable to roll back shortcut after failed move.");
    }
    customSites.pop();
    try {
      localStorage.setItem(storageKey, JSON.stringify(customSites));
    } catch (error) {
      console.error("Unable to roll back directory after failed move.", error);
    }
    return false;
  }
  return true;
}

function moveDirectorySiteToFavorites(site) {
  const favoriteSettings = readFavoriteSettings();
  const previousFavoriteSettings = readFavoriteSettings();
  if (getFavorites().length >= 12) {
    window.alert("快捷方式最多 12 个，请先移除一个再添加。");
    return;
  }
  if (getFavorites().some((favorite) => favorite.id === site.id || favorite.url === site.url)) {
    window.alert("这个网址已经在快捷方式里了。");
    return;
  }

  const siteSettings = readSiteSettings();
  const customSites = readCustomSites();
  const defaultFavorite = favorites.find((favorite) => favorite.url === site.id);
  if (defaultFavorite) {
    favoriteSettings.overrides[defaultFavorite.url] = {
      ...favoriteSettings.overrides[defaultFavorite.url],
      name: site.name,
      url: site.url,
    };
  } else {
    favoriteSettings.custom.push({
      id: site.id,
      name: site.name,
      url: site.url,
      symbol: site.symbol || site.name.slice(0, 1),
      accent: site.accent || "#a9b6ff",
    });
  }
  favoriteSettings.deleted = favoriteSettings.deleted.filter((id) => id !== site.id);
  delete favoriteSettings.overrides[site.id];
  if (!saveFavoriteSettings(favoriteSettings)) {
    window.alert("移动失败，请检查浏览器存储空间或权限。");
    return;
  }

  const customIndex = customSites.findIndex((item) => (item.id || item.url) === site.id);
  if (customIndex >= 0) {
    customSites.splice(customIndex, 1);
    try {
      localStorage.setItem(storageKey, JSON.stringify(customSites));
    } catch (error) {
      console.error("Unable to remove moved website from directory.", error);
      if (!saveFavoriteSettings(previousFavoriteSettings)) {
        console.error("Unable to roll back shortcut after failed move.");
      }
      window.alert("移动失败，请重试。");
      return;
    }
  } else {
    siteSettings.deleted = [...new Set([...siteSettings.deleted, site.id])];
  }
  delete siteSettings.overrides[site.id];
  siteSettings.orders = Object.fromEntries(
    Object.entries(siteSettings.orders).map(([categoryId, order]) => [
      categoryId,
      Array.isArray(order) ? order.filter((id) => id !== site.id) : order,
    ]),
  );
  if (!saveSiteSettings(siteSettings)) {
    if (customIndex >= 0) {
      try {
        customSites.splice(customIndex, 0, site);
        localStorage.setItem(storageKey, JSON.stringify(customSites));
      } catch (error) {
        console.error("Unable to roll back website after failed move.", error);
      }
    }
    if (!saveFavoriteSettings(previousFavoriteSettings)) {
      console.error("Unable to roll back shortcut after failed move.");
    }
    window.alert("移动失败，请重试。");
    return;
  }
  renderCategories();
  renderFavorites();
}

function closeFavoriteMenus() {
  document.querySelectorAll(".favorite-menu").forEach((menu) => {
    const trigger = menu.previousElementSibling;
    restoreFloatingMenu(menu, trigger, favoriteMenuOwners);
  });
}

function saveFavoriteSettings(settings) {
  try {
    localStorage.setItem(favoriteSettingsStorageKey, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Unable to save shortcut settings.", error);
    return false;
  }
}

function openEditFavorite(site) {
  editingFavoriteId = site.id;
  favoriteForm.reset();
  favoriteForm.elements.name.value = site.name;
  favoriteForm.elements.url.value = site.url;
  favoriteFormError.hidden = true;
  document.querySelector("#favorite-dialog-title").textContent = "修改快捷方式";
  document.querySelector("#favorite-form .submit-link").innerHTML =
    '保存快捷方式 <span aria-hidden="true">↗</span>';
  favoriteDialog.showModal();
  favoriteForm.elements.name.focus();
}

function removeFavorite(site) {
  if (!window.confirm(`确定从快捷方式中移除「${site.name}」吗？`)) return;
  const settings = readFavoriteSettings();
  if (settings.custom.some((item) => item.id === site.id)) {
    settings.custom = settings.custom.filter((item) => item.id !== site.id);
    delete settings.overrides[site.id];
  } else {
    settings.deleted = [...new Set([...settings.deleted, site.id])];
  }
  settings.order = settings.order.filter((id) => id !== site.id);
  if (saveFavoriteSettings(settings)) renderFavorites();
  else window.alert("移除失败，请检查浏览器存储空间或权限。");
}

function openAddFavorite() {
  if (getFavorites().length >= 12) return;
  editingFavoriteId = null;
  favoriteForm.reset();
  favoriteFormError.hidden = true;
  document.querySelector("#favorite-dialog-title").textContent = "添加快捷方式";
  document.querySelector("#favorite-form .submit-link").innerHTML =
    '添加到快捷方式 <span aria-hidden="true">↗</span>';
  favoriteDialog.showModal();
  favoriteForm.elements.name.focus();
}

function reorderFavorite(draggedId, targetId) {
  if (!draggedId || draggedId === targetId) return;
  const ordered = getFavorites();
  const from = ordered.findIndex((site) => site.id === draggedId);
  const to = ordered.findIndex((site) => site.id === targetId);
  if (from < 0 || to < 0) return;
  const [site] = ordered.splice(from, 1);
  ordered.splice(to, 0, site);
  const settings = readFavoriteSettings();
  settings.order = ordered.map((item) => item.id);
  if (saveFavoriteSettings(settings)) renderFavorites();
}

let siteRenderCount = 0;

function animateSitePositions(previousPositions) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const card of categoryList.querySelectorAll(".site-card")) {
    const previous = previousPositions.get(card.dataset.siteId);
    if (!previous) {
      card.animate(
        [
          { opacity: 0, transform: "scale(0.94)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );
      continue;
    }
    const current = card.getBoundingClientRect();
    const deltaX = previous.left - current.left;
    const deltaY = previous.top - current.top;
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue;
    card.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: 340, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }
}

function renderCategories() {
  const categories = getCategories();
  const previousPositions = siteRenderCount
    ? new Map(
        [...categoryList.querySelectorAll(".site-card")].map((card) => [
          card.dataset.siteId,
          card.getBoundingClientRect(),
        ]),
      )
    : null;
  siteRenderCount += 1;
  categoryList.replaceChildren();
  for (const category of categories) {
    const row = document.createElement("section");
    row.className = "category-row";
    row.setAttribute("aria-label", `${category.name}分类`);

    const head = document.createElement("div");
    head.className = "category-head";
    const heading = document.createElement("h3");
    heading.className = "category-label";
    heading.textContent = category.name;
    const addButton = document.createElement("button");
    addButton.className = "category-add";
    addButton.type = "button";
    addButton.textContent = "添加网址";
    addButton.addEventListener("click", () => openAddLink(category.id));
    head.append(heading, addButton);
    row.append(head);

    const links = document.createElement("div");
    links.className = "category-links";
    links.dataset.categoryId = category.id;
    for (const site of category.sites) {
      const url = safeExternalUrl(site.url);
      if (!url) continue;

      const card = document.createElement("div");
      card.className = "site-card";
      card.draggable = true;
      card.dataset.siteId = site.id;
      card.dataset.categoryId = category.id;

      const link = document.createElement("a");
      link.className = "directory-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.draggable = false;
      link.append(createSiteIcon(site, "site-icon"));

      const copy = document.createElement("span");
      copy.className = "site-copy";
      const name = document.createElement("span");
      name.className = "site-name";
      name.textContent = site.name;
      copy.append(name);
      if (site.description) link.title = site.description;
      link.append(copy);
      card.append(link, createSiteMenu(site, category.id));
      links.append(card);
    }
    if (!links.childElementCount) {
      const empty = document.createElement("p");
      empty.className = "category-empty";
      empty.textContent = "这个分类还是空的，点右侧「添加网址」放一个进来。";
      links.append(empty);
    }
    row.append(links);
    categoryList.append(row);
  }
  document.querySelector("#site-count").textContent = String(
    categories.reduce((total, category) => total + category.sites.length, 0),
  );
  renderCategoryOptions(categories);
  if (previousPositions) animateSitePositions(previousPositions);
}

function createSiteMenu(site, categoryId) {
  const wrapper = document.createElement("div");
  wrapper.className = "site-menu-wrap";
  const trigger = document.createElement("button");
  trigger.className = "site-menu-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-label", `管理${site.name}`);
  trigger.setAttribute("aria-expanded", "false");
  trigger.textContent = "···";
  const menu = document.createElement("div");
  menu.className = "site-menu";
  menu.hidden = true;
  siteMenuOwners.set(menu, { wrapper, trigger });

  const actions = [
    ["edit", "修改"],
    ["favorite", "移到快捷方式"],
    ["delete", "删除"],
  ];
  for (const [action, label] of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    button.textContent = label;
    if (action === "delete") button.className = "site-menu-delete";
    button.addEventListener("click", () => {
      closeSiteMenus();
      if (action === "edit") openEditSite(site, categoryId);
      if (action === "favorite") moveDirectorySiteToFavorites(site);
      if (action === "delete") deleteSite(site);
    });
    menu.append(button);
  }

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = menu.hidden;
    closeSiteMenus();
    if (shouldOpen) openFloatingMenu(menu, trigger, 150);
  });
  wrapper.append(trigger, menu);
  return wrapper;
}

function closeSiteMenus() {
  document.querySelectorAll(".site-menu").forEach((menu) => {
    const trigger = menu.previousElementSibling;
    restoreFloatingMenu(menu, trigger, siteMenuOwners);
  });
}

function saveSiteSettings(settings) {
  try {
    localStorage.setItem(siteSettingsStorageKey, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Unable to save website settings.", error);
    return false;
  }
}

function openEditSite(site, categoryId) {
  editingSiteId = site.id;
  renderCategoryOptions(getCategories());
  addForm.reset();
  addForm.elements.name.value = site.name;
  addForm.elements.url.value = site.url;
  categorySelect.value = categoryId;
  document.querySelector("#dialog-title").textContent = "修改网址";
  document.querySelector("#add-form .submit-link").innerHTML = '保存修改 <span aria-hidden="true">↗</span>';
  formError.hidden = true;
  addDialog.showModal();
  addForm.elements.name.focus();
}

function deleteSite(site) {
  if (!window.confirm(`确定删除「${site.name}」吗？`)) return;

  const customSites = readCustomSites();
  const remainingCustomSites = customSites.filter((item) => (item.id || item.url) !== site.id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(remainingCustomSites));
  } catch (error) {
    console.error("Unable to delete website.", error);
    window.alert("删除失败，请检查浏览器存储空间或权限。");
    return;
  }
  const settings = readSiteSettings();
  if (!customSites.some((item) => (item.id || item.url) === site.id)) {
    settings.deleted = [...new Set([...settings.deleted, site.id])];
  }
  delete settings.overrides[site.id];
  settings.orders = Object.fromEntries(
    Object.entries(settings.orders).map(([categoryId, order]) => [
      categoryId,
      Array.isArray(order) ? order.filter((id) => id !== site.id) : order,
    ]),
  );
  if (!saveSiteSettings(settings)) {
    window.alert("删除失败，请检查浏览器存储空间或权限。");
    return;
  }
  renderCategories();
}

function reorderSite(draggedId, targetId, categoryId) {
  if (!draggedId || draggedId === targetId) return;
  const categories = getCategories();
  const category = categories.find((item) => item.id === categoryId);
  if (!category) return;
  const from = category.sites.findIndex((site) => site.id === draggedId);
  const to = category.sites.findIndex((site) => site.id === targetId);
  if (from < 0 || to < 0) return;
  const [site] = category.sites.splice(from, 1);
  category.sites.splice(to, 0, site);
  const settings = readSiteSettings();
  settings.orders[categoryId] = category.sites.map((item) => item.id);
  if (saveSiteSettings(settings)) renderCategories();
}

function renderCategoryOptions(categories) {
  const previousSelection = categorySelect.value;
  categorySelect.replaceChildren();
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.append(option);
  }
  if (categories.some((category) => category.id === previousSelection)) {
    categorySelect.value = previousSelection;
  }
}

function updateClock() {
  const now = new Date();
  document.querySelector("#clock").textContent = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  document.querySelector("#date").textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);
}

function updateEngineSymbol() {
  const engine = searchEngines[searchEngine.value];
  renderEngineIcon(engineSymbol, searchEngine.value);
  engineCurrent.textContent = engine.label;
  for (const option of engineOptions.querySelectorAll(".engine-option")) {
    option.setAttribute("aria-selected", String(option.dataset.engine === searchEngine.value));
    renderEngineIcon(option.querySelector(".engine-symbol"), option.dataset.engine);
  }
}

function renderEngineIcon(element, engineId) {
  element.className = `engine-symbol engine-symbol-${engineId}`;
  element.replaceChildren();
  if (engineId === "google") {
    element.textContent = "G";
    return;
  }

  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.setAttribute("viewBox", "0 0 28 28");
  icon.setAttribute("aria-hidden", "true");
  for (const [cx, cy, radius] of [[6, 9, 2.2], [11, 5.5, 2.1], [17, 5.5, 2.1], [22, 9.5, 2.2]]) {
    const toe = document.createElementNS(namespace, "circle");
    toe.setAttribute("cx", String(cx));
    toe.setAttribute("cy", String(cy));
    toe.setAttribute("r", String(radius));
    toe.setAttribute("fill", "currentColor");
    icon.append(toe);
  }
  const pad = document.createElementNS(namespace, "path");
  pad.setAttribute("d", "M9.5 12.5c-2.1.7-4.2 3.4-4.2 5.5 0 1.9 1.4 2.8 3.4 2.2l3.4-1 3.4 1c2 .6 3.4-.3 3.4-2.2 0-2.2-2.5-5.5-4.9-5.8-1.5-.2-2.8-.2-4.5.3Z");
  pad.setAttribute("fill", "currentColor");
  icon.append(pad);
  const letters = document.createElementNS(namespace, "text");
  letters.setAttribute("x", "12.1");
  letters.setAttribute("y", "18.2");
  letters.setAttribute("fill", "#fff");
  letters.setAttribute("font-family", "Arial, sans-serif");
  letters.setAttribute("font-size", "5.6");
  letters.setAttribute("font-weight", "700");
  letters.textContent = "du";
  icon.append(letters);
  element.append(icon);
}

function closeEngineOptions({ returnFocus = false } = {}) {
  engineControl.append(engineOptions);
  engineOptions.hidden = true;
  engineOptions.removeAttribute("style");
  engineTrigger.setAttribute("aria-expanded", "false");
  if (returnFocus) engineTrigger.focus();
}

function openEngineOptions() {
  const anchor = engineTrigger.closest(".search-bar").getBoundingClientRect();
  const margin = 12;
  engineOptions.hidden = false;
  engineOptions.style.position = "fixed";
  engineOptions.style.width = `min(188px, calc(100vw - ${margin * 2}px))`;
  engineOptions.style.zIndex = "10000";
  document.body.append(engineOptions);
  const menu = engineOptions.getBoundingClientRect();
  const left = Math.max(margin, Math.min(anchor.left, innerWidth - menu.width - margin));
  const below = engineTrigger.getBoundingClientRect().bottom + 8;
  const top = below + menu.height <= innerHeight - margin
    ? below
    : Math.max(margin, anchor.top - menu.height - 8);
  engineOptions.style.left = `${left}px`;
  engineOptions.style.top = `${top}px`;
  engineTrigger.setAttribute("aria-expanded", "true");
}

engineTrigger.addEventListener("click", () => {
  const open = engineOptions.hidden;
  if (!open) {
    closeEngineOptions();
    return;
  }
  openEngineOptions();
  if (open) {
    engineOptions.querySelector(`[data-engine="${searchEngine.value}"]`)?.focus();
  }
});

engineOptions.addEventListener("click", (event) => {
  const option = event.target.closest(".engine-option");
  if (!option) return;
  searchEngine.value = option.dataset.engine;
  searchEngine.dispatchEvent(new Event("change", { bubbles: true }));
  closeEngineOptions({ returnFocus: true });
});

engineOptions.addEventListener("keydown", (event) => {
  const options = [...engineOptions.querySelectorAll(".engine-option")];
  const index = options.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const offset = event.key === "ArrowDown" ? 1 : -1;
    options[(index + offset + options.length) % options.length].focus();
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeEngineOptions({ returnFocus: true });
  } else if (event.key === "Tab") {
    closeEngineOptions();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".engine-control")) closeEngineOptions();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !engineOptions.hidden) closeEngineOptions({ returnFocus: true });
});

engineTrigger.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (engineOptions.hidden) {
      openEngineOptions();
    }
    engineOptions.querySelector(`[data-engine="${searchEngine.value}"]`)?.focus();
  }
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }
  const destination = `${searchEngines[searchEngine.value].url}${encodeURIComponent(query)}`;
  window.open(destination, "_blank", "noopener,noreferrer");
});

searchEngine.addEventListener("change", updateEngineSymbol);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSiteMenus();
    closeFavoriteMenus();
  }
  const target = event.target;
  const isTyping =
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName));
  if (event.code === "Space" && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "/" && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    searchInput.focus();
  }
});

function openAddLink(categoryId) {
  renderCategoryOptions(getCategories());
  formError.hidden = true;
  addForm.reset();
  if (categoryId && [...categorySelect.options].some((option) => option.value === categoryId)) {
    categorySelect.value = categoryId;
  }
  addDialog.showModal();
  addForm.elements.name.focus();
}

document.querySelector("#add-category").addEventListener("click", () => {
  categoryFormError.hidden = true;
  categoryForm.reset();
  categoryDialog.showModal();
  categoryForm.elements.name.focus();
});

document.querySelector("#close-dialog").addEventListener("click", () => addDialog.close());
addDialog.addEventListener("close", () => {
  editingSiteId = null;
  document.querySelector("#dialog-title").textContent = "添加网址";
  document.querySelector("#add-form .submit-link").innerHTML = '保存到导航 <span aria-hidden="true">↗</span>';
});
document.querySelector("#close-category-dialog").addEventListener("click", () => categoryDialog.close());
document.querySelector("#close-favorite-dialog").addEventListener("click", () => favoriteDialog.close());
document.querySelector("#close-move-favorite").addEventListener("click", () => moveFavoriteDialog.close());

favoriteDialog.addEventListener("close", () => {
  editingFavoriteId = null;
  document.querySelector("#favorite-dialog-title").textContent = "修改快捷方式";
  document.querySelector("#favorite-form .submit-link").innerHTML =
    '保存快捷方式 <span aria-hidden="true">↗</span>';
});

addDialog.addEventListener("click", (event) => {
  if (event.target === addDialog) addDialog.close();
});

categoryDialog.addEventListener("click", (event) => {
  if (event.target === categoryDialog) categoryDialog.close();
});

favoriteDialog.addEventListener("click", (event) => {
  if (event.target === favoriteDialog) favoriteDialog.close();
});

moveFavoriteDialog.addEventListener("click", (event) => {
  if (event.target === moveFavoriteDialog) moveFavoriteDialog.close();
});

moveFavoriteDialog.addEventListener("close", () => {
  movingFavorite = null;
});

moveFavoriteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!movingFavorite || !moveFavoriteCategory.value) return;
  if (!moveFavoriteToCategory(movingFavorite, moveFavoriteCategory.value)) {
    moveFavoriteError.textContent = "移动失败，目标分类可能已包含该网址。";
    moveFavoriteError.hidden = false;
    return;
  }
  moveFavoriteDialog.close();
  renderFavorites();
  renderCategories();
});

favoriteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(favoriteForm);
  const name = String(data.get("name") || "").trim();
  const url = safeExternalUrl(String(data.get("url") || ""));
  if (!name || !url) {
    favoriteFormError.textContent = "请填写名称和有效的网址链接。";
    favoriteFormError.hidden = false;
    return;
  }
  const settings = readFavoriteSettings();
  if (editingFavoriteId) {
    settings.overrides[editingFavoriteId] = {
      ...settings.overrides[editingFavoriteId],
      name,
      url,
    };
    settings.deleted = settings.deleted.filter((id) => id !== editingFavoriteId);
  } else {
    if (getFavorites().length >= 12) {
      favoriteFormError.textContent = "快捷方式最多 12 个。";
      favoriteFormError.hidden = false;
      return;
    }
    settings.custom.push({
      id: `shortcut-${crypto.randomUUID()}`,
      name,
      url,
      symbol: name.slice(0, 1),
      accent: "#a9b6ff",
    });
  }
  if (!saveFavoriteSettings(settings)) {
    favoriteFormError.textContent = "保存失败，请检查浏览器存储空间或权限。";
    favoriteFormError.hidden = false;
    return;
  }
  favoriteDialog.close();
  renderFavorites();
});

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = String(new FormData(categoryForm).get("name") || "").trim();
  if (!name) {
    categoryFormError.textContent = "请填写分类名称。";
    categoryFormError.hidden = false;
    categoryForm.elements.name.focus();
    return;
  }

  const categories = getCategories();
  if (categories.some((category) => category.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    categoryFormError.textContent = "这个分类已经存在，请换一个名称。";
    categoryFormError.hidden = false;
    categoryForm.elements.name.focus();
    return;
  }

  const id = `custom-${crypto.randomUUID()}`;
  const customCategories = readCustomCategories();
  customCategories.push({ id, name });
  try {
    localStorage.setItem(categoryStorageKey, JSON.stringify(customCategories));
  } catch (error) {
    console.error("Unable to save the new navigation category.", error);
    categoryFormError.textContent = "保存失败，请检查浏览器存储空间或权限。";
    categoryFormError.hidden = false;
    return;
  }

  categoryDialog.close();
  renderCategories();
  formError.hidden = true;
  addForm.reset();
  categorySelect.value = id;
  addDialog.showModal();
  addForm.elements.name.focus();
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(addForm);
  const url = safeExternalUrl(String(data.get("url") || ""));
  if (!url) {
    formError.hidden = false;
    addForm.elements.url.focus();
    return;
  }

  const categoryId = String(data.get("category"));
  if (!getCategories().some((category) => category.id === categoryId)) {
    formError.textContent = "请选择一个有效分类。";
    formError.hidden = false;
    return;
  }

  const customSites = readCustomSites();
  const updatedSite = {
    name: String(data.get("name")).trim(),
    description: new URL(url).hostname.replace(/^www\./, ""),
    category: categoryId,
    symbol: String(data.get("name")).trim().slice(0, 1),
    accent: "#5687a8",
    url,
  };
  try {
    if (editingSiteId) {
      const customIndex = customSites.findIndex((site) => (site.id || site.url) === editingSiteId);
      if (customIndex >= 0) {
        customSites[customIndex] = { ...customSites[customIndex], ...updatedSite, id: editingSiteId };
        localStorage.setItem(storageKey, JSON.stringify(customSites));
      } else {
        const settings = readSiteSettings();
        settings.overrides[editingSiteId] = {
          ...settings.overrides[editingSiteId],
          ...updatedSite,
          category: categoryId,
        };
        settings.deleted = settings.deleted.filter((id) => id !== editingSiteId);
        if (!saveSiteSettings(settings)) throw new Error("Unable to save website changes.");
      }
    } else {
      customSites.push({ ...updatedSite, id: crypto.randomUUID() });
      localStorage.setItem(storageKey, JSON.stringify(customSites));
    }
  } catch (error) {
    console.error("Unable to save the new navigation link.", error);
    formError.textContent = "保存失败，请检查浏览器存储空间或权限。";
    formError.hidden = false;
    return;
  }
  addDialog.close();
  renderCategories();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-menu-wrap")) closeSiteMenus();
  if (!event.target.closest(".favorite-menu-wrap")) closeFavoriteMenus();
});

favoritesRail.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".favorite-card");
  if (!card) return;
  draggedFavoriteId = card.dataset.favoriteId;
  draggedCategoryId = null;
  favoritePreviewOrder = getFavorites().map((site) => site.id);
  favoriteStartPositions = new Map();
  favoriteSlotPositions = [];
  // 记录拖拽开始时每张卡片的物理槽位；整个拖拽过程只依据这份固定几何求目标位置，
  // 不做命中测试，避免卡片滑动时光标下的元素变化导致左右横跳。
  // 坐标统一换算到栏杆的内容坐标系，这样拖拽途中栏杆自动横向滚动也不会失准。
  const origin = favoriteContentOrigin();
  [...favoritesRail.querySelectorAll(".favorite-card")].forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const left = rect.left - origin;
    favoriteStartPositions.set(item.dataset.favoriteId, { index, left });
    favoriteSlotPositions.push({ left, center: left + rect.width / 2 });
  });
  favoriteDropCommitted = false;
  favoritesRail.classList.add("is-dragging");
  const dragImage = card.cloneNode(true);
  dragImage.classList.add("favorite-drag-image");
  document.body.append(dragImage);
  event.dataTransfer.setDragImage(dragImage, card.offsetWidth / 2, card.offsetHeight / 2);
  window.setTimeout(() => dragImage.remove(), 0);
  card.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedFavoriteId);
});

favoritesRail.addEventListener("dragend", (event) => {
  event.target.closest(".favorite-card")?.classList.remove("is-dragging");
  if (!favoriteDropCommitted) {
    for (const card of favoritesRail.querySelectorAll(".favorite-card")) {
      card.style.transform = "";
    }
  }
  favoritesRail.classList.remove("is-dragging");
  draggedFavoriteId = null;
  favoritePreviewOrder = null;
  favoriteStartPositions = null;
  favoriteSlotPositions = null;
  favoriteDropCommitted = false;
});

function favoriteContentOrigin() {
  return favoritesRail.getBoundingClientRect().left - favoritesRail.scrollLeft;
}

function applyFavoritePreview() {
  if (!favoritePreviewOrder || !favoriteStartPositions || !favoriteSlotPositions) return;
  // 每张卡片（含被拖拽的那张）都移动到自己的预览槽位，保证任何时刻一个槽位只有一张卡片
  for (const card of favoritesRail.querySelectorAll(".favorite-card")) {
    const start = favoriteStartPositions.get(card.dataset.favoriteId);
    const index = favoritePreviewOrder.indexOf(card.dataset.favoriteId);
    const slot = favoriteSlotPositions[index];
    if (!start || index < 0 || !slot) continue;
    card.style.transform = `translateX(${slot.left - start.left}px)`;
  }
}

function updateFavoriteDragPreview(clientX) {
  const slots = favoriteSlotPositions;
  if (!slots || !slots.length || !favoritePreviewOrder || !draggedFavoriteId) return;
  const cursor = clientX - favoriteContentOrigin();
  let gapIndex = 0;
  while (gapIndex < slots.length && cursor > slots[gapIndex].center) gapIndex += 1;
  gapIndex = Math.min(gapIndex, slots.length - 1);
  const currentIndex = favoritePreviewOrder.indexOf(draggedFavoriteId);
  if (currentIndex < 0 || currentIndex === gapIndex) return;
  const [movedId] = favoritePreviewOrder.splice(currentIndex, 1);
  favoritePreviewOrder.splice(gapIndex, 0, movedId);
  applyFavoritePreview();
}

favoritesRail.addEventListener("dragover", (event) => {
  if (!draggedFavoriteId || !favoritePreviewOrder) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  updateFavoriteDragPreview(event.clientX);
});

favoritesRail.addEventListener("drop", (event) => {
  if (!draggedFavoriteId || !favoritePreviewOrder) return;
  event.preventDefault();
  updateFavoriteDragPreview(event.clientX);
  const settings = readFavoriteSettings();
  settings.order = [...favoritePreviewOrder];
  if (!saveFavoriteSettings(settings)) {
    window.alert("排序保存失败，请检查浏览器存储空间或权限。");
    return;
  }
  favoriteDropCommitted = true;
  renderFavorites();
});

categoryList.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".site-card");
  if (!card) return;
  draggedSiteId = card.dataset.siteId;
  draggedCategoryId = card.dataset.categoryId;
  const category = getCategories().find((item) => item.id === draggedCategoryId);
  if (!category) return;
  sitePreviewOrder = category.sites.map((site) => site.id);
  const links = card.parentElement;
  const linksRect = links.getBoundingClientRect();
  // 槽位记录成相对网格容器的坐标，页面滚动时依然有效
  siteSlotPositions = [...links.querySelectorAll(".site-card")].map((item) => {
    const rect = item.getBoundingClientRect();
    return {
      left: rect.left - linksRect.left,
      top: rect.top - linksRect.top,
      width: rect.width,
      height: rect.height,
    };
  });
  card.classList.add("is-dragging");
  const dragImage = card.cloneNode(true);
  dragImage.classList.add("site-drag-image");
  document.body.append(dragImage);
  event.dataTransfer.setDragImage(dragImage, card.offsetWidth / 2, card.offsetHeight / 2);
  window.setTimeout(() => dragImage.remove(), 0);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedSiteId);
});

categoryList.addEventListener("dragend", (event) => {
  event.target.closest(".site-card")?.classList.remove("is-dragging");
  if (sitePreviewOrder) {
    for (const card of categoryList.querySelectorAll(".site-card")) {
      if (card.dataset.categoryId !== draggedCategoryId) continue;
      card.style.order = "";
      card.style.transform = "";
    }
  }
  draggedSiteId = null;
  draggedCategoryId = null;
  sitePreviewOrder = null;
  siteSlotPositions = null;
});

function findSiteSlotIndex(x, y) {
  const slots = siteSlotPositions;
  if (!slots || !slots.length) return -1;
  let nearest = -1;
  let nearestDistance = Infinity;
  for (let index = 0; index < slots.length; index += 1) {
    const rect = slots[index];
    const right = rect.left + rect.width;
    const bottom = rect.top + rect.height;
    if (x >= rect.left && x <= right && y >= rect.top && y <= bottom) return index;
    const dx = Math.max(rect.left - x, 0, x - right);
    const dy = Math.max(rect.top - y, 0, y - bottom);
    const distance = dx * dx + dy * dy;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  }
  return nearest;
}

function updateSiteDragPreview(links, clientX, clientY) {
  if (!links || !draggedSiteId || !sitePreviewOrder || !siteSlotPositions) return;
  const linksRect = links.getBoundingClientRect();
  const x = clientX - linksRect.left;
  const y = clientY - linksRect.top;
  const hoveredIndex = findSiteSlotIndex(x, y);
  if (hoveredIndex < 0) return;
  const draggedIndex = sitePreviewOrder.indexOf(draggedSiteId);
  if (draggedIndex < 0) return;

  // 目标位置只由固定槽位几何决定：重排后光标下的元素会变，靠命中测试取参考卡片必然来回抖
  const rect = siteSlotPositions[hoveredIndex];
  const insertAfter = x >= rect.left + rect.width / 2;
  const insertIndex = Math.min(
    Math.max(hoveredIndex + (insertAfter ? 1 : 0), 0),
    sitePreviewOrder.length - 1,
  );
  if (insertIndex === draggedIndex) return;

  const cards = [...links.querySelectorAll(".site-card")];
  const previousPositions = new Map(
    cards.map((card) => [card.dataset.siteId, card.getBoundingClientRect()]),
  );
  for (const card of cards) {
    card.style.transition = "none";
    card.style.transform = "";
  }
  void links.offsetWidth;
  const [movedId] = sitePreviewOrder.splice(draggedIndex, 1);
  sitePreviewOrder.splice(insertIndex, 0, movedId);
  sitePreviewOrder.forEach((id, index) => {
    const card = cards.find((item) => item.dataset.siteId === id);
    if (card) card.style.order = String(index);
  });
  const nextPositions = new Map(
    cards.map((card) => [card.dataset.siteId, card.getBoundingClientRect()]),
  );
  for (const card of cards) {
    const previous = previousPositions.get(card.dataset.siteId);
    const next = nextPositions.get(card.dataset.siteId);
    if (previous && next) {
      card.style.transform = `translate(${previous.left - next.left}px, ${previous.top - next.top}px)`;
    }
  }
  void links.offsetWidth;
  for (const card of cards) {
    card.style.transition = "";
    card.style.transform = "";
  }
}

categoryList.addEventListener("dragover", (event) => {
  if (!draggedSiteId || !sitePreviewOrder) return;
  const links = event.target.closest(".category-links");
  if (!links || links.dataset.categoryId !== draggedCategoryId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  updateSiteDragPreview(links, event.clientX, event.clientY);
});

categoryList.addEventListener("drop", (event) => {
  if (!draggedSiteId || !sitePreviewOrder) return;
  const links = event.target.closest(".category-links");
  if (!links || links.dataset.categoryId !== draggedCategoryId) return;
  event.preventDefault();
  updateSiteDragPreview(links, event.clientX, event.clientY);
  const settings = readSiteSettings();
  settings.orders[draggedCategoryId] = [...sitePreviewOrder];
  if (!saveSiteSettings(settings)) {
    window.alert("排序保存失败，请检查浏览器存储空间或权限。");
    return;
  }
  renderCategories();
});

document.querySelector("#back-to-top").addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

renderFavorites();
renderCategories();
updateEngineSymbol();
updateClock();
window.setInterval(() => {
  if (!document.hidden) updateClock();
}, 1000);
