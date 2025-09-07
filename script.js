const API_KEY = "88cc6fb1805b60d327e88ac7f0cdabff"; // OpenWeather
const UNSPLASH_KEY = "napWYvPwBkx7XslnL_zdhBYDRVmeZe4mWDr3mEzuEoc"; // Unsplash API

const weatherDiv = document.getElementById("weather");
const loader = document.getElementById("loader");
const cityPhoto = document.getElementById("city-photo");
const weatherInfo = document.getElementById("weather-info");
const forecastDiv = document.getElementById("forecast");

let forecastChart;

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    weatherInfo.innerHTML = "<p>⚠️ Digite o nome de uma cidade!</p>";
    weatherDiv.classList.remove("hidden");
    return;
  }

  loader.classList.remove("hidden");
  weatherDiv.classList.add("hidden");
  forecastDiv.classList.add("hidden");

  try {
    // === Clima atual ===
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&lang=pt_br&units=metric`
    );
    const data = await res.json();

    loader.classList.add("hidden");

    if (data.cod !== 200) {
      weatherInfo.innerHTML = "<p>❌ Cidade não encontrada!</p>";
      weatherDiv.classList.remove("hidden");
      return;
    }

    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherInfo.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="${icon}" alt="${data.weather[0].description}">
      <p><strong>${Math.round(data.main.temp)}°C</strong></p>
      <p>${data.weather[0].description}</p>
      <p>💧 Umidade: ${data.main.humidity}%</p>
      <p>💨 Vento: ${data.wind.speed} m/s</p>
    `;

    // === Foto da cidade (Unsplash) ===
    const photoRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${city}&client_id=${UNSPLASH_KEY}&orientation=landscape&per_page=1`
    );
    const photoData = await photoRes.json();
    cityPhoto.style.backgroundImage =
      photoData.results.length > 0
        ? `url(${photoData.results[0].urls.regular})`
        : `url('https://source.unsplash.com/1600x900/?city')`;

    weatherDiv.classList.remove("hidden");

    // === Previsão 5 dias ===
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&lang=pt_br&units=metric`
    );
    const forecastData = await forecastRes.json();

    const labels = [];
    const temps = [];

    // Pega 1 previsão a cada 8h (3x por dia, 5 dias)
    forecastData.list.forEach((item, index) => {
      if (index % 8 === 0) {
        const date = new Date(item.dt * 1000);
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
        temps.push(Math.round(item.main.temp));
      }
    });

    // Renderiza gráfico
    const ctx = document.getElementById("forecastChart").getContext("2d");
    if (forecastChart) forecastChart.destroy(); // evita duplicação

    forecastChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temperatura (°C)",
            data: temps,
            borderColor: "#ff9800",
            backgroundColor: "rgba(255,152,0,0.2)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
        scales: {
          y: {
            ticks: { color: "#fff" },
          },
          x: {
            ticks: { color: "#fff" },
          },
        },
      },
    });

    forecastDiv.classList.remove("hidden");
  } catch (error) {
    loader.classList.add("hidden");
    weatherInfo.innerHTML = "<p>⚠️ Erro ao buscar os dados.</p>";
    weatherDiv.classList.remove("hidden");
  }
}
