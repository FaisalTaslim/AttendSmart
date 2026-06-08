const getBtn = document.getElementById("start-session-btn");
const contentsContainer2 = document.getElementsByClassName("dashboard-contents")[0];
const overlay2 = document.getElementsByClassName("overlay")[0];

getBtn.addEventListener("click", async () => {
  try {
    overlay2.style.display = "flex";
  } catch {
    alert("Something went wrong.");
  }
});