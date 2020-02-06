let firstCountries = document.getElementById("level-1");
let countryBase = document.getElementById("countryBase");
let plan = document.getElementById("visitedCountries");
let level = 0
let visitedCountries = [];

document.getElementById("chooseName").disabled = true;
document.getElementById("save").disabled = true;

document.getElementById("fName").addEventListener("keyup", checkName);
document.getElementById("chooseName").addEventListener("click", generateFirsts);

function checkName(e) {
    var name = document.getElementById("fName").value;
    if(name.length>=2){
        document.getElementById("chooseName").disabled = false;
    }
    else{
        document.getElementById("chooseName").disabled = true;
    }
}

// Generate first set of random countries after the user has given their name
function generateFirsts(){
    document.getElementById("row").setAttribute("class", "row");

    var name = document.getElementById("fName").value
    document.getElementById("suunnitelmaOtsikko").textContent = "Käyttäjän " + name + " matkasuunnitelma:";
    document.getElementById("largeHeader").textContent = "Käyttäjän " + name + " reitti:";

    var row = document.getElementById("askName");
    row.parentNode.removeChild(row);

    fetch('https://restcountries.eu/rest/v2/all')
    .then(
        function(response) {
            if (response.status !== 200) {
                alert('Could not get the data. Status Code: ' +
                response.status);
            }
            return response.json();
        })

    .then(function(data) {
        level += 1;
        let countryList = _.shuffle(_.filter(data,function(a) { return a["borders"].length > 1; }));
        for(let i = 0; i<3; i++) {
            var m = countryList[i];
            firstCountries.appendChild(generateCountries(document, m));
        }
    });
}

// Given a reference to a document and country to be added (m).
// Generates a column with a card that has all the country information
function generateCountries(document, m){
    var card = document.createElement("div");
    var col = document.createElement("div");
    
    let flag = document.createElement("img");
    flag.classList.add("card-img-top");
    flag.setAttribute("src", m.flag.toString());

    var countryName = document.createElement("h5");
    var capital = document.createElement("p");
    var currency = document.createElement("p");
    var neighbors = document.createElement("p");
    
    var countryInfo = document.createElement("div");
    
    countryName.setAttribute("class", "card-title");
    capital.setAttribute("class", "card-text");
    currency.setAttribute("class", "card-text");
    neighbors.setAttribute("class", "card-text");
    
    countryInfo.setAttribute("class", "card-body");
    card.setAttribute("class", "card h-100 taso-".concat(level));
    card.setAttribute("style", "max-width:30rem;");
    
    countryName.textContent =(m['name']) + ": ";
    capital.textContent = (m['capital']) + " ";
    currency.textContent = JSON.stringify(((m['currencies'])[0])['name']) + ": " + JSON.stringify(((m['currencies'])[0])['code']);
    for(let a = 0; a<(m['borders']).length; a++){
       neighbors.textContent += (m['borders'][a]);
       if(a<(m['borders']).length-1){
          neighbors.textContent += ", "
       }
    }    
    countryInfo.appendChild(countryName);
    countryInfo.appendChild(capital);
    countryInfo.appendChild(currency);
    countryInfo.appendChild(neighbors);
    card.appendChild(flag);
    card.appendChild(countryInfo);
    card.addEventListener('click', chooseCountry);
    col.appendChild(card);
    col.setAttribute("class", "col");
    return col;
}

// Adds a new country to the list or deletes a country from list
// when user clicks the card of the flag
function chooseCountry() {
    if(this.getAttribute("class") == "card h-100 taso-" + level){
        addToPlan(this.children[1].children[0]);
        this.parentNode.setAttribute("class", "col chosen");
        var chosenNeighbors = this.children[1].children[3];
        fetch('https://restcountries.eu/rest/v2/all')
        .then(
            function(response) {
                if (response.status !== 200) {
                    alert('Could not get the data. Status Code: ' +
                    response.status);
                    
                }
                return response.json();
            })

        .then(function(data) {
            level += 1;
            var levelHeader = document.createElement("h2");
            levelHeader.setAttribute("class", "card-title");
            levelHeader.setAttribute("id", "taso-"+level);
            levelHeader.textContent = "Taso " + level

            var row = document.createElement("div");
            row.setAttribute("class", "row");
            row.setAttribute("id", "taso-".concat(level))
            var empty = true;
            for(let i = 0; i<data.length; i++) {
                var m = data[i];
                //var col = document.createElement("div");
                //col.setAttribute("class", "col");
                if(chosenNeighbors.textContent.includes(m['alpha3Code']) && !(visitedCountries.includes(m['alpha3Code']))){
                    empty = false;
                    row.appendChild(generateCountries(document, m));
                }
            }
            if(empty){
                alert("Ei enempää maita täällä!");
            }
            else{
                countryBase.appendChild(levelHeader);
                countryBase.appendChild(row);
            }
        });
    }
    // If the user chooses a previously chosen country, delete that and
    // the ones that come after it from the plan.
    else if(this.parentNode.getAttribute("class") == "col chosen"){
        this.parentNode.setAttribute("class", "col");
        level = Number(this.getAttribute("class").slice(16));
        for(let i = 0; i<countryBase.children.length; i++){
            if (countryBase.children[i].hasAttribute("id")){
                if(Number(countryBase.children[i].getAttribute("id").slice(5)) > Number(level)){
                    countryBase.removeChild(countryBase.children[i]);
                    i--;
                }
            }
        }
        removeFromPlan(this.children[1].children[0].textContent.slice(0, -2));
    }
}

function addToPlan(country){
    document.getElementById("save").disabled = false;
    countryName = country.textContent.slice(0, -2);
    fetch('https://restcountries.eu/rest/v2/name/' + countryName + '?fullText=true')
    .then(
        function(response) {
            if (response.status !== 200) {
                alert('Could not get the data. Status Code: ' +
                response.status);
            }
            return response.json();
        })
    .then(
        function(data) {
            var country = document.createElement("p");
            country.textContent = data[0]['alpha3Code'];
            plan.appendChild(country);
            visitedCountries.push(data[0]['alpha3Code'])
        });
}

function removeFromPlan(removeCountry){

    fetch('https://restcountries.eu/rest/v2/name/' + removeCountry + '?fullText=true')
    .then(
        function(response) {
            if (response.status !== 200) {
                alert('Could not get the data. Status Code: ' +
                response.status);
            }
            return response.json();
        })
    .then(
        function(data) {
            removeCode = data[0]['alpha3Code'];
            for(var i = 0; i<visitedCountries.length; i++){
                if(visitedCountries[i] === removeCode){
                    while(i<visitedCountries.length){
                        visitedCountries.splice(i, 1);
                        plan.removeChild(plan.children[i]);
                    }
                }
            }
            if(visitedCountries.length===0){
                document.getElementById("save").disabled = true;
            }
        
        });

}


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("save");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
    var plan = document.getElementById("finalPlan")

    fetch('https://restcountries.eu/rest/v2/all')
    .then(
        function(response) {
            if (response.status !== 200) {
                alert('Could not get the data. Status Code: ' +
                response.status);
            }
            return response.json();
        })
    .then (function(data){
        for(var i = 0; i<visitedCountries.length; i++){
            for(var j = 0; j<data.length; j++){
                var m = data[j];
                if (m.alpha3Code === visitedCountries[i]){
                    var flag = document.createElement("img");
                    var country = document.createElement("div");
                    var countryName = document.createElement("span");
                    var capital = document.createElement("span");
                    var region = document.createElement("span");
                    var currencies = document.createElement("span");
                    var language = document.createElement("span");
                    var pop = document.createElement("span");
                    var number = document.createElement("span");

                    country.setAttribute("class", "country");

                    flag.setAttribute("src", m.flag.toString());
                    flag.setAttribute("class", "smallFlag");
                    flag.classList.add("card-img-top");

                    countryName.setAttribute("class", "countryName");
                    countryName.textContent = m.name;
                    number.textContent = i+1 + ".";
                    pop.textContent = "Väkiluku:" + m.population;
                    capital.textContent = "Pääkaupunki:" + m.capital;
                    region.textContent = "Alue:" + m.subregion;
                    currencies.textContent = "Valuutta:" + m.currencies[0].name + " (" + m.currencies[0].symbol + ")";
                    language.textContent = "Kieli:" + m.languages[0].name;

                    country.appendChild(number);
                    country.appendChild(flag);
                    country.appendChild(countryName);
                    country.appendChild(pop);
                    country.appendChild(capital);
                    country.appendChild(currencies);
                    country.appendChild(language);
                    country.appendChild(region);
                    plan.appendChild(country);
                }
            }
    
        }
    })
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
    var myNode = document.getElementById("finalPlan");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    var myNode = document.getElementById("finalPlan");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

  }
}