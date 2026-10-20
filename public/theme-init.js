

(function () {
  const STORAGE_KEY = "theme";
  const THEME_ATTR = "data-theme";

  function getInitialTheme() {
    try {

      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }

      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }

      return "light";
    } catch (e) {
      return "light";
    }
  }

  const theme = getInitialTheme();

  document.documentElement.setAttribute(THEME_ATTR, theme);

  document.documentElement.style.backgroundColor =
    theme === "dark" ? "#060D12" : "#FCFBFA";
  document.documentElement.style.colorScheme = theme;
})();
