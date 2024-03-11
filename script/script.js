// Variabel awal
const hoursTotal = 12;
let globalKey = 203166;
let hoursData = [];
let hoursTemp = [];
let hoursUnit;

function searchCity() {
  const cityName = document.querySelector("#search").value;

  if (cityName) {
    const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&q=${cityName}&language=id`;

    async function getLocationApi() {
      const api = await fetch(locationUrl);
      const data = await api.json();

      // Location Key
      globalKey = data[0].Key;

      // City
      const city = data[0].EnglishName;

      // Province
      const province = data[0].AdministrativeArea.LocalizedName;

      // Country
      const country = data[0].Country.LocalizedName;

      // Dom element
      const locationEl = document.querySelector(".location p");

      // Manupulasi Dom
      locationEl.innerHTML = `${city}, ${province} ${country}`;

      // Jalankan fungsi
      getCurrCondAPI();
      gethourlyAPI();
      getDaysAPI();

      // Keluar & jalankan fungsi
      return createChart();
    }

    // Jalankan fungsi
    getLocationApi();

  } else {
    // Keluar & Tampilkan pesan
    return alert("City not found");
  }
}

// Current Conditions Weather API
async function getCurrCondAPI() {
  const currCondUrl = `http://dataservice.accuweather.com/currentconditions/v1/${globalKey}?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&language=id&details=true`;

  const api = await fetch(currCondUrl);
  const data = await api.json();

  // Dewpoint
  const dewpointValue = data[0].DewPoint.Metric.Value;
  const dewpointUnit = data[0].DewPoint.Metric.Unit;

  // Temperature
  const tempValue = data[0].Temperature.Metric.Value;

  // Icon
  const iconValue = data[0].WeatherIcon;
  const iconText = data[0].WeatherText;

  // Wind speed
  const windValue = data[0].Wind.Speed.Metric.Value;
  const windUnit = data[0].Wind.Speed.Metric.Unit;

  // DOM element
  const iconImg = document.querySelector(".box-icon-value");
  const iconTextEl = document.querySelector(".box-icon-text");
  const tempValueEl = document.querySelector(".temp-value");
  const windValueEl = document.querySelector(".wind-value");
  const dewpointValueEl = document.querySelector(".dewpoint-value");

  // Manipulasi Dom
  iconImg.src = `assets/${iconValue}.png`;
  iconImg.alt = iconText;
  iconTextEl.innerHTML = iconText;
  tempValueEl.innerHTML = `${tempValue}<sup>o</sup>`;
  windValueEl.innerHTML = `${windValue} ${windUnit}`;
  dewpointValueEl.innerHTML = `${dewpointValue}<sup>o</sup> ${dewpointUnit}`;
}
// Jalankan Fungsi
getCurrCondAPI();

// Hourly Forecast API
async function gethourlyAPI() {
  const hourlyUrl = `http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${globalKey}?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&language=id&details=false&metric=true`;

  const api = await fetch(hourlyUrl);
  const data = await api.json();

  // Looping data API dan perbarui nilai variabel
  for (let i = 0; i < hoursTotal; i++) {
    // Epoch Date
    const hours = data[i].EpochDateTime;
    hoursData.push(changeTime(hours));

    // Temperature Value
    const hoursTempValue = data[i].Temperature.Value;
    hoursTemp.push(hoursTempValue);
  };

  // Temperature Unit
  const hoursTempUnit = data[0].Temperature.Unit;

  // Assignment
  hoursUnit = hoursTempUnit;

  // Keluar
  return createChart();
}
// Jalankan fungsi
gethourlyAPI();

// 5 days weather forecast API
async function getDaysAPI() {
  const fiveDaysUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${globalKey}?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&language=id&details=false&metric=true`;

  const api = await fetch(fiveDaysUrl);
  const data = await api.json();

  // Variabel awal
  const allTimes = [];
  const allPhrase = [];
  const allTempMin = [];
  const allTempMax = [];

  // Looping data & perbarui nilai variabel
  for (let i = 1; i < data.DailyForecasts.length; i++) {
    // Epoch Date
    const time = data.DailyForecasts[i].EpochDate;
    allTimes.push(changeDate(time));

    // Icon
    const phrase = data.DailyForecasts[i].Day.IconPhrase;
    allPhrase.push(phrase);

    // Temperature Value
    const tempMin = data.DailyForecasts[i].Temperature.Minimum.Value;
    allTempMin.push(tempMin);

    const tempMax = data.DailyForecasts[i].Temperature.Maximum.Value;
    allTempMax.push(tempMax);
  }

  // Temperature Unit
  const tempMinUnit = data.DailyForecasts[1].Temperature.Minimum.Unit;
  const tempMaxUnit = data.DailyForecasts[1].Temperature.Maximum.Unit;

  // Dom element
  const dates = document.querySelectorAll(".date");
  const texts = document.querySelectorAll(".text");
  const mins = document.querySelectorAll(".min-value");
  const maxs = document.querySelectorAll(".max-value");

  // Manipulasi Dom
  dates.forEach((date, i) => {
    date.innerHTML = allTimes[i];
  })

  texts.forEach((text, i) => {
    text.innerHTML = allPhrase[i];
  })

  mins.forEach((min, i) => {
    min.innerHTML = `${allTempMin[i]}<sup>o</sup> ${tempMinUnit}`;
  })

  maxs.forEach((max, i) => {
    max.innerHTML = `${allTempMax[i]}<sup>o</sup> ${tempMaxUnit}`;
  })

}
// Jalankan fungsi
getDaysAPI();

// Fungsi untuk mendapat waktu saat ini 
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

  return formattedTime;
}

// Fungsi untuk merubah unix stamp menjadi waktu
function changeTime(stamp) {
  const timestamp = stamp;
  const date = new Date(timestamp * 1000); // Ubah ke mm

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;

  return formattedTime;
}

// Fungsi untukmerubah unix stamp menjadi tanggal
function changeDate(stamp) {
  const timestamp = stamp;
  const date = new Date(timestamp * 1000);

  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('id-ID', options);

  return formattedDate;
}

// Fungsi untuk mendapatkan pesan salam sesuai waktu
function getGreetingMessage() {
  const hours = new Date().getHours();
  let greeting = "";

  if (hours >= 5 && hours < 12) {
    greeting = "Selamat Pagi";
  } else if (hours >= 12 && hours < 15) {
    greeting = "Selamat Siang";
  } else if (hours >= 15 && hours < 18) {
    greeting = "Selamat Sore";
  } else {
    greeting = "Selamat Malam";
  }

  return greeting;
}

// Fungsi untuk mendapat tanggal saat ini
function getCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString('id-ID', options);

  return currentDate;
}

// Fungsi untuk memperbarui element html 
function updateElements() {
  // Dom element
  const timeEl = document.querySelector(".time");
  const messageEl = document.querySelector(".message");
  const currentDate = document.querySelector(".currentDate");

  // Manipulasi Dom
  timeEl.innerHTML = getCurrentTime();
  messageEl.innerHTML = getGreetingMessage();
  currentDate.innerHTML = getCurrentDate();
}

// Jalankan setiap 1 detik
setInterval(updateElements, 1000);

// Jalankan fungsi
updateElements();

// Fungsi untuk membuat grafik menggunakan Chart.js
function createChart() {
  const ctx = document.getElementById('chart');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: hoursData,
      datasets: [{
        label: 'Temperature',
        data: hoursTemp,
        borderWidth: 5,
        pointBackgroundColor: 'rgba(255, 255, 255)',
        pointBorderColor: 'rgba(255, 255, 255)',
        borderColor: "#fa6b05"
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.5)"
          },
          ticks: {
            color: "#ffffff"
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.5)"
          },
          ticks: {
            stepSize: 10,
            color: "#ffffff",
            callback: function (value) {
              return `${value} ${hoursUnit}`;
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Hourly Forecast",
          align: "start",
          padding: {
            bottom: 20
          },
          color: "#ffffff",
          font: { size: "16px" }
        }
      }
    }
  });
}
