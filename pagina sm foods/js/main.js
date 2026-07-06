/* SM Foods landing interactions: header state, sliders, filters and animations. */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const productCards = document.querySelectorAll(".product-card");
  const quoteModal = document.getElementById("quoteModal");
  const recipeModal = document.getElementById("recipeModal");
  const whatsappLink = document.querySelector("[data-whatsapp]");

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 80
    });
  }

  const productSwiper = window.Swiper
    ? new Swiper(".product-swiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: false,
        speed: 650,
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        },
        navigation: {
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom"
        },
        breakpoints: {
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 3 }
        }
      })
    : null;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      productCards.forEach((card) => {
        const isVisible = selectedCategory === "all" || card.dataset.category === selectedCategory;
        card.style.display = isVisible ? "" : "none";
      });

      productSwiper?.update();
      productSwiper?.slideTo(0);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    });
  });

  document.querySelectorAll(".navbar .nav-link, .navbar .btn").forEach((link) => {
    link.addEventListener("click", () => {
      const navCollapse = document.querySelector(".navbar-collapse.show");
      if (navCollapse && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });

  quoteModal?.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget;
    const productName = trigger?.dataset.product || "Producto SM Foods";
    const productField = quoteModal.querySelector("[data-product-field]");

    if (productField) {
      productField.value = productName;
    }
  });

  recipeModal?.addEventListener("show.bs.modal", (event) => {
    const recipeId = event.relatedTarget?.dataset.recipe;
    const recipe = recipes[recipeId];

    if (!recipe) return;

    recipeModal.querySelector("[data-recipe-category]").textContent = recipe.category;
    recipeModal.querySelector("[data-recipe-title]").textContent = recipe.title;
    renderList(recipeModal.querySelector("[data-recipe-ingredients]"), recipe.ingredients, "li");
    renderList(recipeModal.querySelector("[data-recipe-steps]"), recipe.steps, "li");
  });

  document.querySelectorAll(".contact-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());
      const type = form.dataset.formType;
      const feedback = form.querySelector(".form-feedback");
      const subject = type === "catalogo" ? "Solicitud de catalogo SM Foods" : `Cotizacion ${data.producto || "SM Foods"}`;
      const message = buildMessage(type, data);
      const mailto = `mailto:info@smfoodscompany.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

      feedback.textContent = "Abriendo tu correo para enviar la solicitud...";
      window.location.href = mailto;
    });
  });

  whatsappLink?.addEventListener("click", () => {
    whatsappLink.href = buildWhatsappUrl("Hola SM Foods, quiero recibir informacion del portafolio para mi negocio.");
  });
});

function buildMessage(type, data) {
  if (type === "catalogo") {
    return [
      "Hola SM Foods, quiero solicitar el catalogo comercial.",
      "",
      `Nombre: ${data.nombre || ""}`,
      `Empresa: ${data.empresa || ""}`,
      `Telefono: ${data.telefono || ""}`,
      `Categoria de interes: ${data.categoria || ""}`
    ].join("\n");
  }

  return [
    "Hola SM Foods, quiero cotizar un producto.",
    "",
    `Producto: ${data.producto || ""}`,
    `Nombre: ${data.nombre || ""}`,
    `Empresa: ${data.empresa || ""}`,
    `Telefono: ${data.telefono || ""}`,
    `Mensaje: ${data.mensaje || ""}`
  ].join("\n");
}

function buildWhatsappUrl(message) {
  return `https://wa.me/573143082243?text=${encodeURIComponent(message)}`;
}

function renderList(container, items, tagName) {
  if (!container) return;

  container.innerHTML = "";
  items.forEach((item) => {
    const element = document.createElement(tagName);
    element.textContent = item;
    container.appendChild(element);
  });
}

const recipes = {
  "ceviche-chorizo": {
    category: "Chorizos",
    title: "Ceviche de Chorizo",
    ingredients: ["4 chorizos", "Cebolla morada", "Pasta de aji amarillo", "Maiz cancha", "Zumo de limon", "Cilantro"],
    steps: ["Dora los chorizos en sarten y cortalos en laminas delgadas.", "Mezcla con cebolla en julianas, cilantro picado, aji amarillo, maiz cancha y limon.", "Sirve frio o a temperatura ambiente como entrada."]
  },
  "pizza-salami": {
    category: "Salami",
    title: "Pizza de Salami",
    ingredients: ["Salami", "Queso mozzarella", "Salsa de tomate", "Oregano", "Aceite de oliva", "Harina de trigo", "Agua tibia", "Levadura fresca", "Sal"],
    steps: ["Prepara la masa con agua, aceite, levadura, harina y sal hasta obtener una textura lisa.", "Deja reposar, divide y estira la base.", "Cubre con salsa, queso, salami, oregano y aceite.", "Hornea a temperatura alta hasta dorar."]
  },
  "empanadas-jamon": {
    category: "Jamones",
    title: "Empanadas de Jamon",
    ingredients: ["Jamon", "Masa para empanadas", "Queso", "Aceite para freir"],
    steps: ["Rellena cada disco de masa con jamon y queso.", "Cierra bien los bordes para evitar que se abran.", "Frie en aceite caliente hasta lograr color dorado."]
  },
  "sandwich-mortadela": {
    category: "Mortadelas",
    title: "Sandwich de Mortadela",
    ingredients: ["Mortadela jamonada o cervecera", "Pan", "Queso", "Lechuga", "Tomate", "Mayonesa", "Toppings al gusto"],
    steps: ["Arma el sandwich con mortadela, queso, vegetales, mayonesa y toppings.", "Tuesta ligeramente con mantequilla para mejorar textura y aroma.", "Sirve caliente o tibio."]
  },
  "spaghetti-tocineta": {
    category: "Tocinetas",
    title: "Spaghetti con Tocineta",
    ingredients: ["Tocineta", "Spaghetti", "Crema de leche", "Cebolla", "Ajo", "Toppings al gusto"],
    steps: ["Cocina la pasta hasta el punto deseado.", "Saltea tocineta, ajo y cebolla; incorpora la crema.", "Agrega toppings salteados y mezcla con la pasta."]
  },
  "hamburguesa-clasica": {
    category: "Hamburguesas",
    title: "Hamburguesa Clasica",
    ingredients: ["Carne para hamburguesa", "Pan de hamburguesa", "Lechuga", "Tomate", "Tocineta", "Cebolla", "Queso", "Mayonesa", "Ketchup"],
    steps: ["Asa la carne a fuego controlado.", "Tuesta el pan ligeramente.", "Arma con vegetales, queso, salsas y tocineta.", "Puedes sumar chorizo, mortadela o jamon para una version mas completa."]
  },
  "suero-butifarra": {
    category: "Butifarras",
    title: "Suero Costeno con Butifarra",
    ingredients: ["Butifarra", "Suero costeno", "Cebolla", "Cilantro", "Limon", "Leche", "Vinagre blanco", "Sal"],
    steps: ["Calienta la leche a fuego bajo y agrega limon y vinagre sin dejar hervir.", "Deja cortar la mezcla, cuela con un pano limpio y ajusta sal.", "Licua hasta lograr cremosidad.", "Mezcla con butifarras y sirve frio."]
  },
  "huevos-salchicha": {
    category: "Salchichas",
    title: "Huevos con Salchicha",
    ingredients: ["Salchichas", "Huevos", "Cebolla", "Pimiento", "Toppings al gusto"],
    steps: ["Saltea salchichas con cebolla y pimiento.", "Agrega los huevos y revuelve hasta cocinar.", "Termina con toppings salteados si quieres mas sabor."]
  },
  "arroz-salchicha": {
    category: "Salchichas",
    title: "Arroz con Salchicha Americana",
    ingredients: ["Salchicha americana", "Arroz", "Cebolla", "Pimiento", "Ajo", "Tocineta", "Caldo de pollo", "Toppings al gusto"],
    steps: ["Saltea salchicha, cebolla, pimiento, ajo y tocineta.", "Incorpora arroz y caldo.", "Cocina a fuego lento hasta que el arroz este listo.", "Mezcla y refuerza con toppings al gusto."]
  },
  "chorizo-caramelizado": {
    category: "Chorizos",
    title: "Chorizo Caramelizado",
    ingredients: ["Chorizos", "Azucar morena", "Miel", "Salsa de soja"],
    steps: ["Carameliza el azucar en sarten.", "Agrega miel y salsa de soja para formar el glaseado.", "Cocina los chorizos en la mezcla hasta que queden brillantes y cubiertos."]
  }
};
