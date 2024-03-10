let globalKey = 203166;

function searchCity() {
  const cityName = document.querySelector("#search").value;

  if (cityName) {
    const apiUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&q=${cityName}&language=id`;

    async function getAPI() {
      const api = await fetch(apiUrl);
      const data = await api.json();

      console.log(data)
      // Key
      globalKey = data[0].Key;

      // Kota 
      const city = data[0].EnglishName;

      // Provinsi
      const localized = data[0].AdministrativeArea.LocalizedName;

      // Negara
      const country = data[0].Country.LocalizedName;

      // Dom element
      const locationEl = document.querySelector(".location p");

      locationEl.innerHTML = `${city}, ${localized} ${country}`;

      currCondAPI()
      hourlyAPI()
      daysAPI()

      return createChart()
    }

    getAPI();
  } else {
    return;
  }
}

// Current Conditions Weather API
async function currCondAPI() {
  const weatherCurrCond = `http://dataservice.accuweather.com/currentconditions/v1/${globalKey}?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&language=id&details=true`;

  const api = await fetch(weatherCurrCond);
  const data = await api.json();

  // Dewpoint
  const dewpointValue = data[0].DewPoint.Metric.Value;
  const dewpointUnit = data[0].DewPoint.Metric.Unit;

  // Temp
  const tempValue = data[0].Temperature.Metric.Value;

  // Icon
  const iconValue = data[0].WeatherIcon;
  const iconText = data[0].WeatherText;

  // Wind speed
  const windValue = data[0].Wind.Speed.Metric.Value;
  const windUnit = data[0].Wind.Speed.Metric.Unit;

  // DOM element
  const iconTextEl = document.querySelector(".box-icon-text");
  const iconImg = document.querySelector(".box-icon-value");
  const tempValueEl = document.querySelector(".temp-value");
  const windValueEl = document.querySelector(".wind-value");
  const dewpointValueEl = document.querySelector(".dewpoint-value");

  // Mengganti atribut src dengaan nilai dari API
  iconImg.src = `assets/${iconValue}.png`;
  iconImg.alt = iconText;

  // Memasukkan nilai dari API ke dalam element HTML
  iconTextEl.innerHTML = iconText;
  tempValueEl.innerHTML = `${tempValue}<sup>o</sup>`;
  windValueEl.innerHTML = `${windValue} ${windUnit}`;
  dewpointValueEl.innerHTML = `${dewpointValue}<sup>o</sup> ${dewpointUnit}`;
}

currCondAPI();

// Variabel awal
const hoursTotal = 12;
let hoursData = [];
let hoursTemp = [];
let hoursUnit;

// Hourly Forecast API
async function hourlyAPI() {
  const hourlyForecast = `http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${globalKey}?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&language=id&details=false&metric=true`;

  const api = await fetch(hourlyForecast);
  const data = await api.json();

  for (let i = 0; i < hoursTotal; i++) {
    const hours = data[i].EpochDateTime;
    hoursData.push(changeTime(hours));

    const hoursTempValue = data[i].Temperature.Value;
    hoursTemp.push(hoursTempValue);
  };

  const hoursTempUnit = data[0].Temperature.Unit;
  hoursUnit = hoursTempUnit;

  return createChart();
}

hourlyAPI();

// 5 days weather forecast API
async function daysAPI() {
  const fiveDaysForecast = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${globalKey}?apikey=wyZKXWXdTrhOxaXK6UOMKSqoo0PRSDRV&language=id&details=false&metric=true`;

  const api = await fetch(fiveDaysForecast);
  const data = await api.json();

  // Variabel awal
  const allTimes = [];
  const allPhrase = [];
  const allTempMin = [];
  const allTempMax = [];

  // Get data from API
  for (let i = 1; i < data.DailyForecasts.length; i++) {
    const time = data.DailyForecasts[i].EpochDate;
    allTimes.push(changeDate(time));

    const phrase = data.DailyForecasts[i].Day.IconPhrase;
    allPhrase.push(phrase);

    const tempMin = data.DailyForecasts[i].Temperature.Minimum.Value;
    allTempMin.push(tempMin);

    const tempMax = data.DailyForecasts[i].Temperature.Maximum.Value;
    allTempMax.push(tempMax);
  }

  const tempMinUnit = data.DailyForecasts[1].Temperature.Minimum.Unit;
  const tempMaxUnit = data.DailyForecasts[1].Temperature.Maximum.Unit;

  // Dom element
  const dates = document.querySelectorAll(".date");
  const texts = document.querySelectorAll(".text");
  const mins = document.querySelectorAll(".min-value");
  const maxs = document.querySelectorAll(".max-value");

  // Mengganti nilai dari API ke dalam elemen HTML
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

daysAPI();

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
  const timeEl = document.querySelector(".time");
  const messageEl = document.querySelector(".message");
  const currentDate = document.querySelector(".currentDate");

  timeEl.innerHTML = getCurrentTime();
  messageEl.innerHTML = getGreetingMessage();
  currentDate.innerHTML = getCurrentDate();
}

// Jalankan setiap 1 detik
setInterval(updateElements, 1000);

// Memanggil fungsi updateElements
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
