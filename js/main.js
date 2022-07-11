console.log('soepkip')

// speel geluidje als je klikt op soep of kip
document.body.addEventListener('click', playSound);

// zodat enter in de input hetzelfde is als op de knop drukken
if (document.getElementById('input')) {
    const inputField = document.getElementById('input');
    inputField.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            // event.preventDefault();
            document.getElementById('submit').click();
        }
    });
}

// geen rechtermuisknop want dat is grappig
document.addEventListener('contextmenu', function (event) {
    if (event.target.id !== 'output') event.preventDefault();
});

// submit knop functie
function generate() {
    const userInputElement = document.getElementById('input');
    const userInput = userInputElement.value.toLowerCase().trim();
    const woord = userInput.replaceAll('?', '_');
    const kleur = document.getElementById('kleur').value;
    const regenboog = document.getElementById('regenboog').checked;

    // check of het woord goed is enzo
    if (woord === '') return;
    const tekstElement = document.getElementById('tekst');
    if (!/^[\da-z @!$?&]+$/.test(userInput)) {
        tekstElement.innerText = 'alleen letters, getallen en de tekens @&$!? zijn mogelijk :(';
        tekstElement.style.color = 'red';
        tekstElement.hidden = false;
        return;
    }

    // haal tekst weg en doe de loader
    tekstElement.hidden = true;
    userInputElement.disabled = true;
    document.getElementById('submit').disabled = true;
    document.getElementById('kleur').disabled = true;
    document.getElementById('regenboog').disabled = true;

    document.getElementById('output').hidden = true;
    document.getElementById('loader').hidden = false;
    document.getElementById('download').style.display = 'none';
    document.getElementById('title-image').hidden = true;


    // eerst afbeeldingen laden daarna kunnen we pas echt beginnen
    let imageCount = 0

    const images = [];
    for (let i = 0; i < woord.length; i++) {
        const letter = woord.charAt(i);
        for (let frame = 1; frame <= 14; frame++) {
            images[imageCount] = new Image;
            images[imageCount].src = `img/letters/arg-${letter}-${frame}.png`;
            imageCount++;
        }
    }

    let imagesLoaded = 0;
    let width = 0;
    let height = 0;

    for (let i = 0; i < imageCount; i++) {
        images[i].onload = function () {
            imagesLoaded++;

            width += this.width;
            if (this.height > height) height = this.height;

            if (imagesLoaded === imageCount) {
                width = width / 14

                const canvas = document.getElementById('canvas');

                canvas.width = width;
                canvas.height = height;

                render(woord, images, userInput, kleur, regenboog);
            }
        }
    }
}

function render(woord, images, userInput, hexKleur, regenboog) {
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // greenscreen fix zodat het een bluescreen wordt als groen de gekozen kleur is
    const greenscreen = hexKleur.toLowerCase() === '#00ff00' ? '0000FF' : '00FF00';

    const gif = new GIF({
        workers: 4, workerScript: 'js/gifjs/gif.worker.js', quality: 10, transparent: '0x' + greenscreen
    });

    gif.on('finished', function (blob) {
        const objectURL = URL.createObjectURL(blob);

        const downloadAnchor = document.getElementById('downloadAnchor');
        downloadAnchor.href = URL.createObjectURL(blob);

        downloadAnchor.download = userInput.replaceAll(' ', '-').replaceAll('@', '').replaceAll('&', '').replaceAll('$', '').replaceAll('!', '').replaceAll('?', '') + '.gif';

        const img = document.getElementById('output')
        img.src = objectURL
        img.id = 'output';
        img.title = userInput;

        document.getElementById('input').disabled = false;
        document.getElementById('submit').disabled = false;
        document.getElementById('kleur').disabled = false;
        document.getElementById('regenboog').disabled = false;
        document.getElementById('loader').hidden = true;
        document.getElementById('download').style.display = 'block';
        img.hidden = false;
    });

    // kleur omrekenen naar rgb waardes
    const rgbKleur = hexToRgb(hexKleur)

    let regenboogArray = [];
    if (regenboog) {
        // maak array met kleurtjes van de regenboog in 14 stukken
        for (let i = 1; i < 15; i++) {
            regenboogArray.push(HSVtoRGB(i / 14, 1, 1));
        }
    }

    console.log(regenboogArray)

    // voor elke frame
    for (let i = 0; i < 14; i++) {
        let letterWidthOffset = 0;

        ctx.fillStyle = '#' + greenscreen;
        ctx.fillRect(0, 0, width, height);

        // voor elke letter
        for (let j = 0; j < woord.length; j++) {

            // positie bepalen enzo
            const letterWidth = images[(j * 14) + i].width
            const letterHeight = images[(j * 14) + i].height
            const letterHeightOffset = canvas.height - letterHeight;

            ctx.drawImage(images[(j * 14) + i], letterWidthOffset, letterHeightOffset);

            // de letter uit de canvas knippen
            const imageData = ctx.getImageData(letterWidthOffset, letterHeightOffset, letterWidth, letterHeight);
            const data = imageData.data;


            // over elke pixel van de selectie itereren
            for (let k = 0; k < data.length; k += 4) {
                // data[k]          rood
                // data[k + 1]      groen
                // data[k + 2]      blauw
                // data[k + 3]      aplha

                // kijken of de pixel de kleur van de letter heeft
                // voorkant, waarom ook 1 dezelfde kleur gebruiken voor alle letters
                let voorkant = false;
                if (data[k] === 240 && data[k + 1] === 0 && data[k + 2] === 0) voorkant = true; // de meeste letters en cijfers
                if ((data[k] === 241 || data[k] === 238 || data[k] === 235 || data[k] === 234 || data[k] === 233 || data[k] === 232) && data[k + 1] === 2 && data[k + 2] === 2) voorkant = true; // $&@? tekens en nog wat kut letters

                // pixel is aan de voorkant, zet de waardes naar de gewenste kleur
                if (voorkant) {
                    if (regenboog) {
                        data[k] = regenboogArray[(i + j) % 14][0];
                        data[k + 1] = regenboogArray[(i + j) % 14][1];
                        data[k + 2] = regenboogArray[(i + j) % 14][2];
                    } else {
                        data[k] = rgbKleur[0];
                        data[k + 1] = rgbKleur[1];
                        data[k + 2] = rgbKleur[2];
                    }
                }

                // zijkant, waarom ook 1 dezelfde kleur gebruiken voor alle letters
                let zijkant = false;
                if ((data[k] === 192 || data[k] === 144) && data[k + 1] === 0 && data[k + 2] === 0) zijkant = true; // meeste letters en cijfers
                if (data[k] === 95 && data[k + 1] === 9 && data[k + 2] === 9) zijkant = true; // $ teken
                if (data[k] === 96 && data[k + 1] === 8 && data[k + 2] === 8) zijkant = true; // & teken
                if (data[k] === 93 && data[k + 1] === 10 && data[k + 2] === 10) zijkant = true; // @ teken
                if (data[k] === 147 && data[k + 1] === 3 && data[k + 2] === 3) zijkant = true; // ? teken

                // pixel is aan de zijkant, zet de waardes naar de gewenste kleur
                if (zijkant) {
                    if (regenboog) {
                        data[k] = Math.round(regenboogArray[(i + j) % 14][0] * 0.8);
                        data[k + 1] = Math.round(regenboogArray[(i + j) % 14][1] * 0.8);
                        data[k + 2] = Math.round(regenboogArray[(i + j) % 14][2] * 0.8);
                    } else {
                        data[k] = Math.round(rgbKleur[0] * 0.8);
                        data[k + 1] = Math.round(rgbKleur[1] * 0.8);
                        data[k + 2] = Math.round(rgbKleur[2] * 0.8);
                    }
                }
            }

            ctx.putImageData(imageData, letterWidthOffset, letterHeightOffset);

            letterWidthOffset += letterWidth
        }

        gif.addFrame(canvas, {
            copy: true, delay: 250,
        });
    }

    gif.render();
}

function dl() {
    return document.getElementById('downloadAnchor').click();
}

function kleurChange() {
    document.getElementById('kleur-label').style.color = document.getElementById('kleur').value;
}

function checkbox() {
    const checkboxLabel = document.getElementById('regenboog-label');
    checkboxLabel.classList.contains('rainbow-text') ? checkboxLabel.classList.remove('rainbow-text') : checkboxLabel.classList.add('rainbow-text');
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
}

function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function playSound(event) {
    if (event.target.innerHTML === 'soep') return new Audio('audio/soep.mp3').play();
    if (event.target.innerHTML === 'kip') return new Audio('audio/kip.mp3').play();
}


// favicon veranderen
const faviconCanvas = document.getElementById("favicon");
const faviconCtx = faviconCanvas.getContext('2d');
const favicon = document.querySelector("link[rel='icon']")
faviconCanvas.width = 32;
faviconCanvas.height = 32;

let faviconFrame = 0;

function drawFavicon() {
    faviconCtx.clearRect(0, 0, faviconCanvas.width, faviconCanvas.height);

    faviconCtx.drawImage(faviconFrames[faviconFrame], 0, 0, faviconFrames[faviconFrame].width, faviconFrames[faviconFrame].height, 0, 0, faviconCanvas.width, faviconCanvas.height);
    favicon.href = faviconCanvas.toDataURL('image/png');

    faviconFrame === 6 ? faviconFrame = 0 : faviconFrame += 1;
}


const faviconFrames = [];
for (let i = 0; i < 7; i++) {
    faviconFrames[i] = new Image;
    faviconFrames[i].src = `img/favicon/${i + 1}.png`;

    faviconFrames[i].onload = function () {
        if (i === 6) {

            drawFavicon();
            setInterval(drawFavicon, 500);
        }
    }
}



