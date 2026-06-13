document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  if (!popup) return;

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateX(-50%) translateY(-15px)";
    popup.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    setTimeout(() => {
      popup.style.display = "none";
    }, 300);
  }, 3000);
});