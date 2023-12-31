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

var lokali, filtriraniLokali;

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
        if(i !== -1) {
            p.addEventListener("touchstart", manualSpinStart);
            p.addEventListener("touchmove", manualSpinMove);
            p.addEventListener("touchend", manualSpinEnd);
        }
        vsebnik.appendChild(p);
    }

    vsebnik.style.setProperty('--stElementov', stElementov);
    //spin();
}

function spin(smer = 1) {
    vsebnik.style.setProperty('--kurva', `0,${lerp(0.54, 0.7, Math.random())},.42,${lerp(1, 1.15, Math.random())}`);
    // vsebnik.style.setProperty('--kurva', `${lerp(0, 1, Math.random())},${lerp(-1.5, 1.5, Math.random())},${lerp(0, 1, Math.random())},${lerp(-1.5, 1.5, Math.random())}`); // Povsem randomizirana krivulja
    vsebnik.style.setProperty('--animation-time', `${lerp(2.7, 10, Math.random())}s`); // Math.max(0.7, Math.random() * 2.3) // 2.7, 10
    let rotationDeg = Math.random() * 720 * smer;
    vsebnik.style.setProperty('--rotation-deg', `${rotationDeg}deg`);

    vsebnik.classList.remove("animating");
    vsebnik.classList.remove("animating2");

    requestAnimationFrame((time) => {
        requestAnimationFrame((time) => {
          vsebnik.classList.add("animating");
        });
      });


    // vsebnik.style.transform += (`rotate(${rotationDeg}deg)`);
    //vsebnik.style.setProperty('--rotation-deg', `${90}deg`);
}


function manualSpinStart(e) {
    isManuallySpinning = true;
    vsebnik.classList.remove("animating");
    vsebnik.classList.add("animating2");
}
var isManuallySpinning = false;
var lastKot = 0;
var smer = 1;
function manualSpinMove(e) {
    e.preventDefault();
    touch = e.changedTouches[0];
    let rect = vsebnik.getBoundingClientRect();
    wx = rect.right;
    wy = rect.bottom;
    x = touch.clientX;
    y = touch.clientY;
    let kot = Math.atan2(y-wy, x-wx) * 180 / Math.PI;

    smer = (kot >= lastKot) ? 1 : -1;
    lastKot = kot;

    mydeg = parseInt(e.target.style.transform.slice(7, -4));
    
    vsebnik.style.setProperty('--rotation-deg', `${kot - mydeg}deg`);
}
function manualSpinEnd(e) {
    isManuallySpinning = false;
    spin(smer);
}


function inRange(x, min, max, willOpen = 0, willClose = 0) {
    xm = x % 100;
    x = Math.floor(x/100) + (xm/60);
    minm = min % 100;
    min = Math.floor(min/100) + ((minm-willOpen)/60);
    maxm = max % 100;
    max = Math.floor(max/100) + ((maxm-willClose)/60);
    return ((x-min) * (x-max) <= 0);
}

function filtriraj() {
    willopen = parseInt(document.getElementById("willopen").value);
    willclose = parseInt(document.getElementById("willclose").value);
    let d = new Date();
    let danes = (d.getDay() + 6) % 7;
    let cas = parseInt(`${`${d.getHours()}`.padStart(2, "0")}${`${d.getMinutes()}`.padStart(2, "0")}`);
    //console.log(danes, lokali[0].openinghours[danes].openfrom, lokali[0].openinghours[danes].opento, cas)
    filtriraniLokali = lokali.filter((x) => inRange(cas, x.openinghours[danes].openfrom, x.openinghours[danes].opento, willopen, willclose)).filter((x) => x.City == "Ljubljana");
    //imena = filtriraniLokali.flatMap((x) => x.City == "Ljubljana" ? x.Name : []) ;
    mesta = [...new Set(lokali.map((x) => x.City))];
    return(filtriraniLokali);
}

//populateWheel([" ", "  ", "   ", "    ", "     ", "      ", "       "]);
populateWheel(["Nalaganje lokalov ...".repeat(1), " ".repeat(2), " ".repeat(3), " ".repeat(4), " ".repeat(5), " ".repeat(6), " ".repeat(7), " ".repeat(8), " ".repeat(9), " ".repeat(10)]);

const URL = "https://api.modra.ninja/prehrana/lokali";
//const URL = "lokali.json";
fetch(URL).then((response) => {
    response.json().then((data) => {
        lokali = data;
        //imena = data.map((x) => x.Name);
        filtriraniLokali = filtriraj(lokali);
        populateWheel(filtriraniLokali.map((x) => x.Name));
        spin();
    });
})

async function getMenu(id) {
    let meni = await (await fetch(`https://api.modra.ninja/prehrana/meni/${id}`)).json();
    return(meni);
}

function won(e) {
    console.log(e);
    if(!e.animationName === "spin" || isManuallySpinning) return;
    // obrnjeno = (parseFloat(vsebnik.style.getPropertyValue("--rotation-deg").slice(0, -3))+90) % 360; 
    obrnjeno = (((parseFloat(vsebnik.style.getPropertyValue("--rotation-deg").slice(0, -3))+90) % 360) + 360) % 360; 
    i = Math.round((1 - obrnjeno/360) * stElementov) % stElementov;
    let ime = filtriraniLokali[i]?.["Name"] ?? "V izbranem času ni odprtih lokalov.";
    console.log(i, ime);
    let p = document.createElement("p");
    p.innerText = ime;
    p.style.margin = "0px";
    rezultat.appendChild(p);
    
    rezultat.style.backgroundColor = `hsl(${hashColor2(ime)[0] * 360}, ${hashColor2(ime)[1] * 100}%, 80%)`;
    rezultat.classList.remove("hidden");

    let a = document.createElement("a");
    let naslov = `${filtriraniLokali[i]?.["Address"]} ${filtriraniLokali[i]?.["City"]}`
    a.innerText = naslov;
    a.classList.add("address");
    a.href = `https://www.google.com/maps/search/?api=1&query=${naslov} ${ime}`;
    a.target = "_blank";
    rezultat.appendChild(a);

    zmagovalec = vsebnik.childNodes[i];
    zmagovalec.classList.add("zmagovalec");
    createDucks(20);

    getMenu(filtriraniLokali[i]?.["ID"]).then((menu) => {
        menu = menu ?? [];
        menu = menu.filter((x) => x["Date"].split("T")[0] == (new Date()).toISOString().split("T")[0]);

        let ul = document.createElement("ul");
        for(let m of menu) {
            let jed = `<span class="mainDish">${m["MainDish"]}</span>, ${m["StepOne"]}, ${m["StepTwo"]}, ${m["StepThree"]}`;
            //console.log(jed);
            let li = document.createElement("li");
            li.innerHTML = jed;
            ul.appendChild(li);
        }
        if(menu.length === 0) {
            let li = document.createElement("li");
            li.innerHTML = "Lokal za danes nima vpisanega menija.";
            ul.appendChild(li);
        }
        rezultat.appendChild(ul);
    });
    //console.log("menu", menu);

}

vsebnik.addEventListener("animationend", won, false);
// vsebnik.addEventListener("transitionend", won, false);


settings = document.getElementById("settings");
settings.addEventListener("change", () => {
    console.log("changed");
    vsebnik.classList.remove("animating");
    filtriraniLokali = filtriraj();
    if(filtriraniLokali.length === 0) {
        document.getElementById("message").classList.remove("hidden");
    } else {
        document.getElementById("message").classList.add("hidden");
    }
    populateWheel(filtriraniLokali.map((x) => x.Name));
});


const lerp = (a, b, x) => (a + x * (b - a)); // Linear interpolation
const plusminus = (p) => (Math.random() < p) ? -1 : 1; // Negate number or not (probability of negation)


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