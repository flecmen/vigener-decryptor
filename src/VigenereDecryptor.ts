import { ALPHABET, LETTER_FREQUENCY } from "./constants";

export class VignereDecryptor {
    keyLength: number | null = null; // Pro uložení délky klíče
    key: string = ''; // Pro uložení dešifrovaného klíče
    cipheredText: string; // Zašifrovaný text
    resultText: string | null = null; // Pro uložení dešifrovaného textu
    repeatingSequences: { [key: string]: number[] } = {}; // Pro uložení opakujících se sekvencí a jejich vzdáleností

    constructor(cipheredText: string) {
        this.cipheredText = cipheredText.toUpperCase();
    }

    // Hlavní funkce pro spuštění procesu dešifrování
    run() {
        // Krok 1: Najít délku klíče
        this.findBestKeyLength(); 
        console.log("Key Length:", this.keyLength);

        // Krok 2: Najít klíč pomocí nalezene délky klíče
        this.findKey(); 
        console.log("Key:", this.key);

        // Krok 3: Dešifrovat zašifrovaný text pomocí nalezeného klíče
        this.vigenereDecrypt()
        console.log('Decrypted text: ', this.resultText)
    }

    // Najít nejlepší délku klíče pomocí Kasiskiho testu a Indexu shody (Index of Coincidence)
    findBestKeyLength() {
        const kasiskiKeyLength = this.findKeyLength(this.cipheredText); // Použít Kasiskiho testu k nalezení počáteční délky klíče
        const icKeyLength = this.verifyKeyLength(this.cipheredText, kasiskiKeyLength) > 0.06 ? kasiskiKeyLength : 1; // Ověřit pomocí Indexu shody
   
        for (let keyLength = 2; keyLength <= 20; keyLength++) {
            if (keyLength === icKeyLength) continue;
            const averageIc = this.verifyKeyLength(this.cipheredText, keyLength);
            if (averageIc > 0.06) {
                this.keyLength = keyLength; // Nastavit délku klíče, pokud splňuje prahovou hodnotu IC
                return
            }
        }
        
        this.keyLength = icKeyLength; // Výchozí nastavení na délku klíče podle IC, pokud není nalezena žádná jiná délka klíče
    }

    // Použití Kasiskiho testu k nalezení opakujících se sekvencí a jejich vzdáleností a určení délky klíče z těchto vzdáleností
    findKeyLength(ciphertext: string) {
        const sequences = this.findRepeatingSequences(ciphertext);
        const distances: number[] = [];
        for (const seq in sequences) {
            distances.push(...sequences[seq]);
        }
        const factors = {};
        for (const distance of distances) {
            for (let factor = 2; factor <= 20; factor++) {
                if (distance % factor === 0) {
                    if (!factors[factor]) factors[factor] = 0;
                    factors[factor]++;
                }
            }
        }
        const sortedFactors = Object.keys(factors).sort((a, b) => factors[b] - factors[a]);
        if (sortedFactors.length === 0) {
            return 1;  // Výchozí nastavení na 1, pokud nebyly nalezeny žádné faktory
        }

        return parseInt(sortedFactors[0]);
    }

    // Nalezení opakujících se sekvencí v zašifrovaném textu a zaznamenání jejich vzdáleností
    findRepeatingSequences(ciphertext: string) {
        const sequences = {};
        for (let length = 3; length <= 5; length++) {  // Hledání sekvencí délky 3 až 5
            for (let i = 0; i < ciphertext.length - length; i++) {
                const sequence = ciphertext.substring(i, i + length);
                for (let j = i + length; j < ciphertext.length - length; j++) {
                    if (ciphertext.substring(j, j + length) === sequence) {
                        if (!sequences[sequence]) sequences[sequence] = [];
                        sequences[sequence].push(j - i); // Uložit vzdálenosti mezi opakujícími se sekvencemi
                    }
                }
            }
        }
        return sequences;
    }
    
    // Výpočet Indexu shody (Index of Coincidence) pro daný textový segment
    indexOfCoincidence(text: string) {
        const frequency = {};
        let ic = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (!frequency[char]) {
                frequency[char] = 0;
            }
            frequency[char]++;
        }
        for (const char in frequency) {
            const f = frequency[char];
            ic += f * (f - 1);
        }
        ic /= text.length * (text.length - 1);

        return ic;
    }
    
    // Ověření délky klíče pomocí průměrného Indexu shody (Index of Coincidence) pro textové segmenty
    verifyKeyLength(ciphertext: string, keyLength: number) {
        let icSum = 0;
        for (let i = 0; i < keyLength; i++) {
            let segment = '';
            for (let j = i; j < ciphertext.length; j += keyLength) {
                segment += ciphertext[j];
            }
            icSum += this.indexOfCoincidence(segment);
        }
        const averageIc = icSum / keyLength;
        return averageIc;
    }

    // Inicializace prázdného objektu frekvence
    getEmptyFrequencyObject() {
        return ALPHABET.split('').reduce((acc, letter) => ({ ...acc, [letter]: 0 }), {})
    }

    // Provádí frekvenční analýzu textu a určuje relativní frekvence jednotlivých písmen
    frequencyAnalysis(text: string) {
        const frequency = this.getEmptyFrequencyObject();
        
        for (const char of text) {
            if (ALPHABET.indexOf(char) !== -1) { // je to písmeno z abecedy
                frequency[char]++;
            }
        }

        // Vypočítat relativní frekvenci jako procento
        for (const char of Object.keys(frequency)) {
            frequency[char] = Math.round((frequency[char]/text.length)*100);
        }
        
        return frequency;
    }

    // Krok 2: Najít klíč na základě určené délky klíče a frekvenční analýzy zašifrovaného textu
    findKey() {
        if(this.keyLength === null) {
            throw new Error("Key length not found");
        }
        const keyLocal: string[] = []

        for (let i = 0; i < this.keyLength; i++) {
            const segment: string[] = [];
            for (let j = i; j < this.cipheredText.length; j += this.keyLength) {
                segment.push(this.cipheredText[j]);
            }
            
            const segmentFreq = this.frequencyAnalysis(segment.join(''));
            let maxCorr = -Infinity;
            let bestShift = 0;
            
            for (let shift = 0; shift < 26; shift++) {
                let corr = 0;
                for (let k = 0; k < 26; k++) {
                    const shiftedChar = ALPHABET[(k + shift) % 26];
                    const shiftedCharFreq = Math.round(segmentFreq[shiftedChar])
                    corr += (shiftedCharFreq || 0) * (LETTER_FREQUENCY[ALPHABET[k]] || 0);
                }
                if (corr > maxCorr) {
                    maxCorr = corr;
                    bestShift = shift;
                }
            }
            
            keyLocal.push(ALPHABET[bestShift]);
        }
        
        this.key = keyLocal.join('');
    }

    // Krok 3: Dešifrovat zašifrovaný text pomocí nalezeného klíče
    vigenereDecrypt() {
        let plaintext = '';
        for (let i = 0, j = 0; i < this.cipheredText.length; i++) {
            const cipherChar = this.cipheredText.charAt(i);
            if (ALPHABET.indexOf(cipherChar) !== -1) {
                const cipherPos = ALPHABET.indexOf(cipherChar);
                const keywordPos = ALPHABET.indexOf(this.key.charAt(j % this.key.length));
                const plainPos = (cipherPos - keywordPos + 26) % 26;
                plaintext += ALPHABET.charAt(plainPos);
                j++;
            } else {
                plaintext += cipherChar;
            }
        }

        this.resultText =  plaintext;
    }
}
