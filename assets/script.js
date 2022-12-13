function initPage() {
    var cityElement = document.getElementById("cityEntry");
    var searchElement = document.getElementById("searchButton");
    var clearElement = document.getElementById("clearSearchHistory");
    var cityNameElement = document.getElementById("nameOfCity");
    var windElement = document.getElementById("wind");
    var weatherIconElement = document.getElementById("weatherIcon");
    var tempElement = document.getElementById("temp");
    var currentHumidityEl = document.getElementById("humidity");
    var historyListElement = document.getElementById("history");
    var forecastElement = document.getElementById("forecastHeader");
    var nowWeatherElement = document.getElementById("currentWeather");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    // Variable containing the API Key
    var apiKey = "9c14c44bc7985c94d60f05b0774db552";

    function getWeather(cityName) {
        // Execute a current weather get request from the openweathermap api
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
        axios.get(queryURL)

            .then(function (response) {

                nowWeatherElement.classList.remove("d-none");

                // Parse out all the current day's weather data and format reading accordingly (with % or speed or whatever's needed)
                var currentDate = new Date(response.data.dt * 1000); 
                var day = currentDate.getDate();
                var month = currentDate.getMonth() + 1;
                var year = currentDate.getFullYear();
                cityNameElement.innerHTML = response.data.name+" Weather Today ("+month+"/"+day+"/"+year+")";
                let weatherPic = response.data.weather[0].icon;
                weatherIconElement.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                weatherIconElement.setAttribute("alt", response.data.weather[0].description);
                tempElement.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
                currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                windElement.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
                
                // API call to get the 5 day forecast for city requested by the end user
                let cityID = response.data.id;
                let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + apiKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        forecastElement.classList.remove("d-none");
                        
                        // Parse out the forecasted weather data and format reading accordingly (with % or speed or whatever's needed)
                        var futureForecastElements = document.querySelectorAll(".forecast");
                        // For-loop to loop through each of the next 5 days-worth of forecast data
                        for (i = 0; i < futureForecastElements.length; i++) {
                            futureForecastElements[i].innerHTML = "";
                            var forecastIndex = i * 8 + 4;
                            var forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            var forecastDay = forecastDate.getDate();
                            var forecastMonth = forecastDate.getMonth() + 1;
                            var forecastYear = forecastDate.getFullYear();
                            var forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            futureForecastElements[i].append(forecastDateEl);
                            var forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            futureForecastElements[i].append(forecastWeatherEl);
                            var forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                            futureForecastElements[i].append(forecastTempEl);
                            var forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            futureForecastElements[i].append(forecastHumidityEl);
                        }
                    })
            });
    }

    // Function that converts the api's default temp reading (Kelvin) to Farenheight
    function k2f(K) {
        return Math.floor((K - 273.15) * 1.8 + 32);
    }

    // Function to add the currently searched city, to the search history, once the button is clicked
    searchElement.addEventListener("click", function () {
        var searchTerm = cityElement.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    // Adds formatting for each item within the search history area
    function renderSearchHistory() {
        historyListElement.innerHTML = "";
        for (let i = 0; i < searchHistory.length; i++) {
            var historyItem = document.createElement("input");
            
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-secondary text-light border-dark");
            historyItem.setAttribute("value", searchHistory[i]);
            
            // Plugs the history search item's text, back into the API call above, so that the user can re-search any of their previous searches
            historyItem.addEventListener("click", function () {
                getWeather(this.value);
            })
            
            // Builds the list of search history via appends
            historyListElement.append(historyItem);
        }
    }

    // Function to clear the search history area, when the "Clear Search History" button is clicked by the end user
    clearElement.addEventListener("click", function () {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    })

    // Loads the user's search history at the time of navigation to the page
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
    
}

initPage();
