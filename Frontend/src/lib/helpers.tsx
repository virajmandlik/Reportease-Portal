export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export const handleClickScroll = (id: string): void => {
  const element = document.getElementById(id);
  if (element) {
    // Scroll smoothly to the target element
    element.scrollIntoView({ behavior: "smooth" });
  }
};
