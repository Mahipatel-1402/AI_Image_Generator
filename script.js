const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const modelselect = document.getElementById("model-select");
const countselect = document.getElementById("count-select");
const ratioselect = document.getElementById("ratio-select");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "hf_xxxxxxxxxxxxxxxxxxxxx";

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains"
];

(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || !savedTheme;
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
  })();

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};


const getImageDimensions = (aspectRatio) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  // Base size 512, scaled by ratio (simplified logic)
  if (aspectRatio === "1/1") return { width: 1024, height: 1024 };
  if (aspectRatio === "16/9") return { width: 1024, height: 576 };
  if (aspectRatio === "9/16") return { width: 576, height: 1024 };
  return { width: 1024, height: 1024 };
}
const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  if (!imgCard) return;
  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}" class="result-img"/>
                  <div class="img-overlay">
                      <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                         <i class="fa-solid fa-download"></i>
                         </a>
                   </div>`;
}
const generateImages = async (selectModel, imageCount, aspectRatio, promptText) => {
  const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectModel}`;
  const { width, height } = getImageDimensions(aspectRatio);

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          options: { wait_for_model: true, user_cache: false },
        }),
      });
      if (!response.ok) throw new Error((await response.json())?.error);
      const result = await response.blob();
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      if (imgCard) {
        imgCard.classList.remove("loading");
        imgCard.classList.add("error");
        imgCard.querySelector(".status-text").innerText = error.message;
      }
    }
  })
  await Promise.allSettled(imagePromises);
};

const createImageCards = (selectModel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                            <div class="status-container">
                               <div class="spinner"></div>
                                <i class="fa-solid"></i>
                               <p class="status-text">Generating...</p>
                            </div>
                            </div>`;
  }

  generateImages(selectModel, imageCount, aspectRatio, promptText);
}

const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectModel = modelselect.value;
  const imageCount = parseInt(countselect.value) || 1;
  const aspectRatio = ratioselect.value || "1/1";
  const promptText = promptInput.value.trim();

  console.log(selectModel, imageCount, aspectRatio, promptText);
  createImageCards(selectModel, imageCount, aspectRatio, promptText);
}

promptForm.addEventListener("submit", handleFormSubmit);

const updateGenerateBtnState = () => {
  generateBtn.disabled = promptInput.value.trim() === "";
};

updateGenerateBtnState();
promptInput.addEventListener("input", updateGenerateBtnState);

promptBtn.addEventListener("click", () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  updateGenerateBtnState();
  promptInput.focus();
})

themeToggle.addEventListener("click", toggleTheme);