function abrirPagina(pagina){
    window.location.href = pagina;
}const videoInput = document.getElementById("videoInput");

if (videoInput) {
    videoInput.addEventListener("change", function () {
        const nombre = this.files[0]?.name || "Ningún video seleccionado.";
        document.getElementById("nombreVideo").textContent = nombre;
    });
}