// Transition types carried by links (see <Link transitionTypes>), mapped to the CSS classes in globals.css.
// Opening a project: the page recedes, the card image morphs into the hero, the new page rises in.
export const pageTransition = {
  enter: { "project-open": "page-in", "nav-back": "page-in", default: "none" },
  exit: { "project-open": "page-out", "nav-back": "page-out", default: "none" },
  default: "none",
} as const;
