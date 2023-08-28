// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
        var hash = 0, i, chr;
        for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
});

function hashColor(s) {
    return (s.hashCode().toString(16) + "111111").slice(0, 6);
}

function hashColor2(s) {
    a = `${s.hashCode()}111111`.slice(0,3);
    b = `${s.hashCode()}111111`.slice(3,6);
    return([a/999, b/999]);
}

vsebnik = document.getElementById("vsebnik");
rezultat = document.getElementById("rezultat");
function populateWheel(vsebina) {
    // Clear vsebnik
    vsebnik.replaceChildren();

    // Create a <p> element for each member of the array:
    stElementov = vsebina.length;
    for (let i = 0; i < stElementov; i++) {
        var p = document.createElement("p");
        p.innerHTML = vsebina[i];
        p.classList.add("polje");
        //p.style.backgroundColor = "hsl(" + (360 / stElementov * i) + ", 100%, 80%)";
        // Colour each field randomly
        //p.style.backgroundColor = `hsl(${Math.random() * 360}, ${Math.random() * 100}%, 80%)`;
        //p.style.backgroundColor = `#${hashColor(vsebina[i])}`;
        p.style.backgroundColor = `hsl(${hashColor2(vsebina[i])[0] * 360}, ${hashColor2(vsebina[i])[1] * 100}%, 80%)`;
        p.style.transform = "rotate(" + (360 / stElementov * i) + "deg)";
        vsebnik.appendChild(p);
    }

    vsebnik.style.setProperty('--stElementov', stElementov);
    spin();
}

function spin() {
    vsebnik.style.setProperty('--kurva', `0,${lerp(0.54, 0.7, Math.random())},.42,${lerp(1, 1.15, Math.random())}`);
    // vsebnik.style.setProperty('--kurva', `${lerp(0, 1, Math.random())},${lerp(-1.5, 1.5, Math.random())},${lerp(0, 1, Math.random())},${lerp(-1.5, 1.5, Math.random())}`); // Povsem randomizirana krivulja
    vsebnik.style.setProperty('--animation-time', `${lerp(2.7, 10, Math.random())}s`); // Math.max(0.7, Math.random() * 2.3) // 2.7, 10
    let rotationDeg = Math.random() * 720;
    vsebnik.style.setProperty('--rotation-deg', `${rotationDeg}deg`);
    // vsebnik.style.transform += (`rotate(${rotationDeg}deg)`);
    //vsebnik.style.setProperty('--rotation-deg', `${90}deg`);
}


function inRange(x, min, max, willOpen = 0, willClose = 0) {
    return ((x-min+willOpen) * (x-max-willClose) <= 0);
}

//const URL = "https://api.modra.ninja/prehrana/lokali";
const URL = "lokali.json";
fetch(URL).then((response) => {
    lokali = response.json().then((data) => {
        oa = data;
        //imena = data.map((x) => x.Name);
        let d = new Date();
        let danes = (d.getDay() + 6) % 7;
        let cas = `${`${d.getHours()}`.padStart(2, "0")}${`${d.getMinutes()}`.padStart(2, "0")}`;
        console.log(danes, oa[0].openinghours[danes].openfrom, oa[0].openinghours[danes].opento, cas)
        data = data.filter((x) => inRange(cas, x.openinghours[danes].openfrom, x.openinghours[danes].opento, 15, 30));
        imena = data.flatMap((x) => x.City == "Ljubljana" ? x.Name : []) ;
        mesta = [...new Set(data.map((x) => x.City))];
        populateWheel(imena);
    });
})

function won(e) {
    console.log(e);
    // obrnjeno = (parseFloat(vsebnik.style.getPropertyValue("--rotation-deg").slice(0, -3))+90) % 360; 
    obrnjeno = (parseFloat(vsebnik.style.getPropertyValue("--rotation-deg").slice(0, -3))+90) % 360; 
    i = Math.round((1 - obrnjeno/360) * stElementov);
    console.log(i, imena[i]);
    rezultat.innerHTML = imena[i];
    rezultat.style.backgroundColor = `hsl(${hashColor2(imena[i])[0] * 360}, ${hashColor2(imena[i])[1] * 100}%, 80%)`;
    rezultat.classList.remove("hidden");

    zmagovalec = vsebnik.childNodes[i];
    zmagovalec.classList.add("zmagovalec");
    createDucks(20);
}

vsebnik.addEventListener("animationend", won, false);
// vsebnik.addEventListener("transitionend", won, false);

const lerp = (a, b, x) => (a + x * (b - a)); // Linear interpolation


// Konfeti, https://markoandzan.eu/pai
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function createDucks(count = 10) {
    for(let i = 0; i < count; i++) {
        let d = document.createElement("p");
        d.innerText = "🎊";
        d.style.left = `${clamp(Math.round(Math.random()*100), 5, 85)}vw`;
        d.style.top = `${clamp(Math.round(Math.random()*100), 5, 85)}vh`;
        d.classList.add("raca");
        d.style.animationDelay = `${Math.random()*0.3}s`;
        // d.style.animationDuration = `${lerp(0.3, 1.1, Math.random())}s`;
        d.style.animationDuration = `${lerp(0.3, 1.1, Math.random())}s`;
        d.addEventListener("click", foundDuck);
        document.body.appendChild(d);
    }
}

function foundDuck(duck) {
    duck.target.remove();
}