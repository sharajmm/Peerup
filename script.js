document.addEventListener("DOMContentLoaded", function () {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navbar = document.querySelector(".navbar");

  if (mobileToggle) {
    mobileToggle.addEventListener("click", function () {
      navbar.classList.toggle("active");
    });
  }

  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (navbar.classList.contains("active")) {
        navbar.classList.remove("active");
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: "smooth",
        });
      }
    });
  });

  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }
  });

  const animateOnScroll = function () {
    const elements = document.querySelectorAll(".card, .step, .cta-content");

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (elementPosition < screenPosition) {
        element.classList.add("animated");
      }
    });
  };

  window.addEventListener("scroll", animateOnScroll);
  window.addEventListener("load", animateOnScroll);

  function cleanURL() {
    const currentURL = window.location.href;
    const baseURL =
      window.location.origin +
      window.location.pathname.replace(/\/[^\/]*\.html$/, "/");

    if (currentURL.includes("index.html")) {
      window.history.replaceState({ page: "home" }, document.title, baseURL);
    } else if (currentURL.includes("maintanence.html")) {
      window.history.replaceState(
        { page: "maintenance" },
        "Maintenance - PeerUp",
        baseURL + "maintenance"
      );
    }
  }

  cleanURL();

  window.addEventListener("popstate", function (event) {
    if (event.state) {
      if (event.state.page === "home") {
        window.location.href = "index.html";
      } else if (event.state.page === "maintenance") {
        window.location.href = "maintanence.html";
      }
    } else {
      window.location.href = "index.html";
    }
  });

  document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href="maintanence.html"]');
    if (link) {
      e.preventDefault();

      const baseURL =
        window.location.origin +
        window.location.pathname.replace(/\/[^\/]*\.html$/, "/");

      window.history.pushState(
        { page: "maintenance" },
        "Maintenance - PeerUp",
        baseURL + "maintenance"
      );

      window.location.href = "maintanence.html";
    }
  });
});
