let globalScopeIso;
let interval_ID;
//to stop interval with clearInterval(ID)
function getCountryISO() {
  let country_selector = document.getElementById("countries");
  axios.get("https://countriesnow.space/api/v0.1/countries").then((json) => {
    country_selector.innerHTML =
      '<option value="" disabled selected>Country</option>';
    for (country of json.data.data) {
      country_selector.innerHTML += `<option value="${country.iso2}">${country.country}</option>`;
    }
  });
}
//---------------------------------------------------------------------------------------
let cntry_slct = document.getElementsByTagName("select")[0];
cntry_slct.addEventListener("change", (event) => {
  getCity(event.target.value);
  globalScopeIso = event.target.value;
});
//---------------------------------------------------------------------------------------
function getCity(iso, citySelected = "NULLVAlUE") {
  //EG
  let city_slc = document.getElementById("cities");
  axios.get("https://countriesnow.space/api/v0.1/countries").then((json) => {
    city_slc.innerHTML = '<option value="" disabled selected>City</option>';
    let x = json.data.data.filter(function (element) {
      return element.iso2 === iso;
    });
    for (city of x[0].cities) {
      if (citySelected.indexOf(city) !== -1) {
        city_slc.innerHTML += `<option selected value="${city}">${city}</option>`;
        display(city);
        continue;
      }
      city_slc.innerHTML += `<option value="${city}">${city}</option>`;
    }
  });
}
getCountryISO();
let city = document.getElementsByTagName("select")[1];
city.addEventListener("change", (event) => {
  let place = event.target.value;
  console.log(place);
  display(place);
});

function display(place) {
  console.log(place);
  axios
    .get(
      `https://api.aladhan.com/v1/timingsByCity?country=${globalScopeIso}&city=${place}`
    )
    .then((response) => {
      return new Promise((resolve) => {
        clearInterval(interval_ID);
        tillPrayer(response.data.data.timings);
        let time_div = document
          .getElementsByClassName("time")[0]
          .getElementsByTagName("div");
        time_div[0].innerHTML = ` <h3>Fajr</h3>    <span>${
          response.data.data.timings.Fajr + " "
        }Am</span>`;
        time_div[1].innerHTML = ` <h3>Duhr</h3>    <span>${format(
          response.data.data.timings.Dhuhr
        )}</span>`;
        time_div[2].innerHTML = ` <h3>Asr</h3>     <span>${format(
          response.data.data.timings.Asr
        )}</span>`;
        time_div[3].innerHTML = ` <h3>Maghrib</h3> <span>${format(
          response.data.data.timings.Maghrib
        )}</span>`;
        time_div[4].innerHTML = ` <h3>Ishaa</h3>   <span>${format(
          response.data.data.timings.Isha
        )}</span>`;
        format(response.data.data.timings.Isha);
        resolve(response.data.data.timings);
      });
    });
}

function format(time) {
  let num = Number(time[0] + time[1]);
  if (num > 12) {
    num -= 12;
    num = num.toString();
    let hr = time.split("");
    hr[0] = num[0];
    hr[1] = num[1];
    hr = hr.join("") + " Pm";
    return hr;
  } else if (num == 12) {
    return time + " Pm";
  }
  return time + " Am";
}

function tillPrayer(res) {
  document.getElementById("timer").innerHTML =
    "Time till Prayer <span>0:00:00</span>";
  let arrTime = new Array(
    res.Fajr.split(":"),
    res.Dhuhr.split(":"),
    res.Asr.split(":"),
    res.Maghrib.split(":"),
    res.Isha.split(":")
    // splits at : and removes it
  );

  arrTime = arrTime.map((prayTime) => {
    let time1 = new Date(); //today then adjust time using sethours
    time1.setHours(prayTime[0], prayTime[1]);
    //hr,min,sec,ms
    return time1;
  });
  //covert all string clocks without ":" to actual today clock

  interval_ID = setInterval(() => {
    let now = new Date().getTime();
    let nextPrayer;
    for (prayTime of arrTime) {
      if (now < prayTime.getTime()) {
        nextPrayer = new Date(prayTime).getTime();
        break;
      } else {
        nextPrayer = new Date(arrTime[0]);
        nextPrayer.setDate(nextPrayer.getDate() + 1);
      }
    }
    //------find name of next Prayer using keys of object of clocks------------
    let prayerVar = "Fajr";
    for (const [key, value] of Object.entries(res)) {
      if (key == "Dhuhr" || key == "Asr" || key == "Maghrib" || key == "Isha") {
        let t = new Date();
        t = t.setHours(value.split(":")[0], value.split(":")[1]);
        if (Math.abs(t-nextPrayer)<=60000) {
          //cuz not precised to seconds so i allow one minuit diffrence
          //2l t btb2a 2kbr mn 2l next prayer fee 2a5er kam d2y2a
          //34an kda 2st3mlt Math.abs()
          prayerVar = key;
          break;
        } 
      }
    }
    //------countdown from now to nextPrayer------------
    let distance = nextPrayer - now;
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (minutes < 10) minutes = "0" + minutes.toString();
    if (seconds < 10) seconds = "0" + seconds.toString();

    document.getElementById(
      "timer"
    ).innerHTML = `Time till ${prayerVar} <span> ${hours} :
    ${minutes} : ${seconds} </span>`;
  }, 1000);
}
//===========================================================================
let btnON = false;
document.getElementById("geo-btn").addEventListener("click", () => {
  if (btnON == false) {
    btnON = true;
    let crds_latitude;
    let crds_longitude;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(geoPosition);
    }
    //geoPosition is fucntion on success is called
    function geoPosition(pos) {
      coord = pos.coords;
      crds_latitude = pos.coords.latitude;
      crds_longitude = pos.coords.longitude;
      axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${crds_latitude},${crds_longitude}&sensor=true&key=AIzaSyBMyre0j8m_Z0fewsOivxFroDhaPQV0ei0`
        )
        .then((response) => {
          let index = response.data.results.length;
          let city_name =
            response.data.results[index - 2].address_components[0].short_name;
          let country_name =
            response.data.results[index - 1].address_components[0];
          for (option of cntry_slct.querySelectorAll("option"))
            if (option.textContent == country_name.long_name) {
              option.setAttribute("selected", "selected");
              globalScopeIso = country_name.short_name;
              getCity(country_name.short_name, city_name);
              //getCity has display() in it
            }
        });
    }
  } else {
    btnON = false;
  }

  //googleMaps-->apiKey=AIzaSyBMyre0j8m_Z0fewsOivxFroDhaPQV0ei0
});

/*console.log(response.data.results[7].address_components[0].short_name)
      console.log(response.data.results[7].address_components[1].long_name) */
