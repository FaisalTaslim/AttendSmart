const buttons_array = ["btn generate-qr-submit-btn"];

for (const element of buttons_array) {
    let fetchElement = document.querySelector("." + element);
    fetchElement.disabled = true;
    fetchElement.innerText = "Generating Qr...";

    setTimeout(() => {
        fetchElement.disabled = false;
        fetchElement.innerText = "Generate Qr";
    }, 10000);
}