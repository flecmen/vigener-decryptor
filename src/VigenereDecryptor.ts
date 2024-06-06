import { ALPHABET, LETTER_FREQUENCY } from "./constants";

export class VignereDecryptor {
    keyLength: number | null = null;
    key: string = '';
    cipheredText: string;
    resultText: string | null = null;
    repeatingSequences: { [key: string]: number[] } = {};
    relativeLetterFrequency: { [key: string]: number } = {}

    constructor(cipheredText: string) {
        this.cipheredText = cipheredText.toUpperCase();
        this.resetLetterFrequency();
    }

    run() {
        this.runFrequencyAnalysis();
        this.findBestKeyLength();
        console.log("Key Length:", this.keyLength);

        this.runFrequencyAnalysis();

        this.findKey();
        console.log("Key:", this.key);
    }

    findBestKeyLength() {
        const kasiskiKeyLength = this.findKeyLength(this.cipheredText);
        const icKeyLength = this.verifyKeyLength(this.cipheredText, kasiskiKeyLength) > 0.06 ? kasiskiKeyLength : 1;
    
        for (let keyLength = 2; keyLength <= 20; keyLength++) {
            if (keyLength === icKeyLength) continue;
            const averageIc = this.verifyKeyLength(this.cipheredText, keyLength);
            if (averageIc > 0.06) {
                this.keyLength = keyLength;
                return
            }
        }
        
        this.keyLength = icKeyLength;
    }

    findKeyLength(ciphertext: string) {
        const sequences = this.findRepeatingSequences(ciphertext);
        console.log("Repeating Sequences:", sequences);
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
        console.log("Factors:", factors);
        if (sortedFactors.length === 0) {
            return 1;  // Default to 1 if no factors found
        }
        return parseInt(sortedFactors[0]);
    }

    findRepeatingSequences(ciphertext: string) {
        const sequences = {};
        for (let length = 3; length <= 5; length++) {  // Adjust the range if necessary
            for (let i = 0; i < ciphertext.length - length; i++) {
                const sequence = ciphertext.substring(i, i + length);
                for (let j = i + length; j < ciphertext.length - length; j++) {
                    if (ciphertext.substring(j, j + length) === sequence) {
                        if (!sequences[sequence]) sequences[sequence] = [];
                        sequences[sequence].push(j - i);
                    }
                }
            }
        }
        return sequences;
    }
    
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

    resetLetterFrequency() {
        this.relativeLetterFrequency = this.getEmptyFrequencyObject();
    }

    getEmptyFrequencyObject() {
        return ALPHABET.split('').reduce((acc, letter) => ({ ...acc, [letter]: 0 }), {})
    }

    runFrequencyAnalysis() {  
        this.relativeLetterFrequency = this.frequencyAnalysis(this.cipheredText);
    }

    frequencyAnalysis(text: string) {
        const frequency = this.getEmptyFrequencyObject();
        
        for (const char of text) {
            if (ALPHABET.indexOf(char) !== -1) { // is a letter of alphabet
                frequency[char]++;
            }
        }

        for (const letter of text) {
            frequency[letter] /= text.length;
        }
        
        return frequency;
    }

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
                    console.log("Shifted Char:", shiftedChar, "Segment Freq:", segmentFreq[shiftedChar], "Letter Freq:", LETTER_FREQUENCY[ALPHABET[k]])
                    corr += (segmentFreq[shiftedChar]) * (LETTER_FREQUENCY[ALPHABET[k]]);
                    // console.log("Shifted Char:", shiftedChar, "Segment Freq:", segmentFreq[shiftedChar], "Letter Freq:", LETTER_FREQUENCY[ALPHABET[k]]);
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
}