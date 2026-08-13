// Applicazione del tema.

// Il contratto con il CSS è l'attributo data-theme su <html>: "light" e "dark" sono espliciti, "auto" lascia decidere a prefers-color-scheme.

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}
