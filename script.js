const KEY = 'a8219287a43f4c57b07103047232707';

const wrapp = document.querySelector('.wrapp');

const searchContainer = document.createElement('div');
const searchInput = document.createElement('input');
const searchBtn = document.createElement('button');
const weatherDetail = document.createElement('div');
const weatherCardsContainer = document.createElement('div');
const sortContainer = document.createElement('div');
const sortByTemperature = document.createElement('input');
const sortByDate = document.createElement('input');
const temperatureLabel = document.createElement('label');
const dateLabel = document.createElement('label');

searchInput.placeholder = 'Type your city';
searchInput.type = 'text';

sortByTemperature.type = 'radio';
sortByTemperature.name = 'sorting';
sortByTemperature.id = 'sort-temperature';
sortByTemperature.value = 'temperature';

sortByDate.checked = true;
sortByDate.type = 'radio';
sortByDate.name = 'sorting';
sortByDate.id = 'sort-date';
sortByDate.value = 'date';

temperatureLabel.innerText = 'Sort by Temperature';
dateLabel.innerText = 'Sort by Date';
searchBtn.innerText = 'Search';

temperatureLabel.setAttribute('for', 'sort-temperature');
dateLabel.setAttribute('for', 'sort-date');

sortContainer.classList.add('sort-container');
searchContainer.classList.add('search-container');
weatherCardsContainer.classList.add('weather-container');

sortContainer.append(dateLabel, sortByDate, temperatureLabel, sortByTemperature);
searchContainer.append(searchInput, searchBtn);
wrapp.append(searchContainer);

searchBtn.addEventListener('click', async () => {
    const selectedTemperature = document.querySelector('input[name="temperature"]:checked');
    const selectedWind = document.querySelector('input[name="wind"]:checked');

    let response = await getWeather(`https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${searchInput.value}&days=7&aqi=no&alerts=no`);
    renderWeather(response, selectedTemperature.id, selectedWind.id);
});

async function getWeather(url) {
    try {
        const response = await fetch(url);
        const result = await response.json();

        return result;
    } catch (error) {
        alert(error);
    }
}

function renderWeather(data, tempScale, windScale) {
    weatherDetail.innerHTML = '';
    weatherCardsContainer.innerHTML = '';

    const date = document.createElement('p');
    const conditionsContainer = document.createElement('div');
    const temperature = document.createElement('p');
    const conditions = document.createElement('p');
    const humidity = document.createElement('p');
    const windSpeed = document.createElement('p');
    const weatherImg = document.createElement('img');

    let temp = tempScale === 'temp_c' ? '°C' : '°F';
    let wind = windScale === 'wind_kph' ? 'Km/h' : 'M/h';

    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    temperature.innerText = `Temperature is : ${data.current[tempScale]} ${temp}`;
    conditions.innerText = `Condition : ${data.current.condition.text}`;
    humidity.innerText = `Humidity : ${data.current.humidity}`;
    windSpeed.innerText = `Wind speed : ${data.current[windScale]} ${wind}`;
    weatherImg.src = data.current.condition.icon;

    weatherImg.classList.add('weather-img');
    weatherDetail.classList.add('weather-detail');
    conditionsContainer.classList.add('conditions-container');
    date.classList.add('date');

    date.innerText = `Weather in ${searchInput.value.toUpperCase()}, ${data.location.country.toUpperCase()} \n${formattedDate}:`;

    conditionsContainer.append(conditions, weatherImg);
    weatherDetail.append(date, conditionsContainer, temperature, humidity, windSpeed);
    wrapp.append(weatherDetail);

    renderWeatherCards(data, temp);
}

async function renderWeatherCards(response, temp) {

    response.forecast.forecastday.forEach(forecastday => {

        const card = document.createElement('div');
        const dateInCard = document.createElement('p');
        const temperature = document.createElement('p');
        const conditions = document.createElement('p');
        const weatherImg = document.createElement('img');

        card.classList.add('weather-card');
        dateInCard.classList.add('date');
        temperature.classList.add('temperature');

        temperature.innerText = temp === '°C' ? `Avg temp: ${forecastday.day.avgtemp_c} ${temp}`
            : `Avg temp: ${forecastday.day.avgtemp_f} ${temp}`;
        conditions.innerText = `${forecastday.day.condition.text}`;
        weatherImg.src = `${forecastday.day.condition.icon}`;
        dateInCard.innerText = `${forecastday.date}`;

        card.append(dateInCard, weatherImg, conditions, temperature);
        weatherCardsContainer.append(card);
    });

    wrapp.append(sortContainer);

    sortByTemperature.addEventListener('change', () => {
        weatherCardsContainer.innerHTML = '';

        const sortedData = sortWeatherDataByTemperature(response);
        renderWeatherCards(sortedData, temp);
    });

    sortByDate.addEventListener('change', () => {
        weatherCardsContainer.innerHTML = '';

        const sortedData = sortWeatherDataByDate(response);
        renderWeatherCards(sortedData, temp);
    });

    wrapp.append(weatherCardsContainer);

}

function sortWeatherDataByTemperature(data, tempScale) {
    let sortedData = data.forecast.forecastday.sort((a, b) => {
        const tempA = tempScale === 'temp_c' ? a.day.avgtemp_c : a.day.avgtemp_f;
        const tempB = tempScale === 'temp_c' ? b.day.avgtemp_c : b.day.avgtemp_f;
        return tempA - tempB;
    });

    data.forecast.forecastday = sortedData;
    return data;
}

function sortWeatherDataByDate(data) {
    let sortedData = data.forecast.forecastday.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

    data.forecast.forecastday = sortedData;
    return data;
}