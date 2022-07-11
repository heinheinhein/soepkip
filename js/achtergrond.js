// achtergrond dingen
let count = 0;
let timeout = 1;

// oke maar zou het niet grappig zijn als de achtergrond een beetje was gedraaid niet heel veel maar een paar graden naar links of naar rechts gewoon voor de leuk
document.getElementById('soepkippen').style.transform = `rotate(${Math.round(Math.random() * 10) - 5}deg)`;

(function soepkip() {
    setTimeout(soepkip, timeout);

    // maak div met geluidje als je klikt
    const div = document.createElement('div');
    div.classList.add('soepkip');
    div.classList.add(Math.random() >= 0.5 ? 'soep' : 'kip');
    if (div.classList.contains('soep')) div.innerText = 'soep';
    if (div.classList.contains('kip')) div.innerText = 'kip';

    // random font
    const fonts = ['calibri', 'cascadiamono', 'chiller', 'comicsansms', 'consolas', 'cooperblack', 'copperplateblack', 'couriernew', 'futura', 'harlowsolid', 'helvetica', 'impact', 'itcavantgardegothic', 'jokerman', 'minecrafter', 'papyrus', 'rijksoverheid', 'univers', 'wingdings'];
    div.classList.add(fonts[Math.floor(Math.random() * fonts.length)]);

    // voeg random de classes toe
    if (Math.random() >= 2 / 3) div.classList.add('bold');
    if (Math.random() >= 2 / 3) div.classList.add('italic');
    if (Math.random() >= 2 / 3) div.classList.add('underlined');
    const i = Math.floor(Math.random() * 3);
    if (i === 0) div.classList.add('lowercase');
    if (i === 1) div.classList.add('uppercase');
    if (i === 2) div.classList.add('capitalize');

    // random fontsize
    div.style.fontSize = (Math.random() * 6) + 0.8 + 'vh';

    // kleurtjes
    div.style.color = Math.random() >= 0.5 ? 'white' : 'black';
    Math.random() >= 0.5 ? div.style.color = 'hsla(' + (Math.random() * 360) + ', ' + ((Math.random() * 50) + 50) + '%, 50%, 1)' : div.style.background = 'hsla(' + (Math.random() * 360) + ', ' + ((Math.random() * 50) + 50) + '%, 50%, 1)';

    // random positie
    Math.random() >= 0.5 ? div.style.left = (Math.random() * 100) + 'vw' : div.style.right = (Math.random() * 100) + 'vw';
    Math.random() >= 0.5 ? div.style.top = (Math.random() * 100) + 'vh' : div.style.bottom = (Math.random() * 100) + 'vh';

    // zet de div in de body
    document.getElementById('soepkippen').appendChild(div);

    // maak de timeout langzaam langer en denk aan de schermgrootte
    if (timeout < 1024) if (count % Math.round(innerWidth * innerHeight * 0.00005) === 0) timeout *= 2;
    count++;
})();
