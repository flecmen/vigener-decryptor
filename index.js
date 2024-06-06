const englishWords = ["WHITE", "KEY", "EXAMPLE", "WORD", "GUESS", "VALID", "DECRYPT", "ENCRYPT", "KING", "QUEEN"];  // Extend this with a comprehensive list

function vigenereEncrypt(plaintext, keyword) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let ciphertext = '';
    plaintext = plaintext.toUpperCase();
    keyword = keyword.toUpperCase();
    
    for (let i = 0, j = 0; i < plaintext.length; i++) {
        const plaintextChar = plaintext.charAt(i);
        if (alphabet.indexOf(plaintextChar) !== -1) {
            const plaintextPos = alphabet.indexOf(plaintextChar);
            const keywordPos = alphabet.indexOf(keyword.charAt(j % keyword.length));
            const cipherPos = (plaintextPos + keywordPos) % 26;
            ciphertext += alphabet.charAt(cipherPos);
            j++;
        } else {
            ciphertext += plaintextChar;
        }
    }
    return ciphertext;
}

function vigenereDecrypt(ciphertext, keyword) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let plaintext = '';
    ciphertext = ciphertext.toUpperCase();
    keyword = keyword.toUpperCase();
    
    for (let i = 0, j = 0; i < ciphertext.length; i++) {
        const cipherChar = ciphertext.charAt(i);
        if (alphabet.indexOf(cipherChar) !== -1) {
            const cipherPos = alphabet.indexOf(cipherChar);
            const keywordPos = alphabet.indexOf(keyword.charAt(j % keyword.length));
            const plainPos = (cipherPos - keywordPos + 26) % 26;
            plaintext += alphabet.charAt(plainPos);
            j++;
        } else {
            plaintext += cipherChar;
        }
    }
    
    return plaintext;
}

function findRepeatingSequences(ciphertext) {
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

function findKeyLength(ciphertext) {
    const sequences = findRepeatingSequences(ciphertext);
    console.log("Repeating Sequences:", sequences);
    const distances = [];
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

function indexOfCoincidence(text) {
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

function verifyKeyLength(ciphertext, keyLength) {
    let icSum = 0;
    for (let i = 0; i < keyLength; i++) {
        let segment = '';
        for (let j = i; j < ciphertext.length; j += keyLength) {
            segment += ciphertext[j];
        }
        icSum += indexOfCoincidence(segment);
    }
    const averageIc = icSum / keyLength;
    return averageIc;
}

function findBestKeyLength(ciphertext) {
    const kasiskiKeyLength = findKeyLength(ciphertext);
    const icKeyLength = verifyKeyLength(ciphertext, kasiskiKeyLength) > 0.06 ? kasiskiKeyLength : 1;

    for (let keyLength = 2; keyLength <= 20; keyLength++) {
        if (keyLength === icKeyLength) continue;
        const averageIc = verifyKeyLength(ciphertext, keyLength);
        if (averageIc > 0.06) {
            return keyLength;
        }
    }

    return icKeyLength;
}

function frequencyAnalysis(text) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const frequency = Array(26).fill(0);
    
    for (const char of text) {
        if (alphabet.indexOf(char) !== -1) {
            frequency[alphabet.indexOf(char)]++;
        }
    }
    
    return frequency;
}

function findKey(ciphertext, keyLength) {
    const key = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const englishFrequencies = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.split('');
    
    for (let i = 0; i < keyLength; i++) {
        const segment = [];
        for (let j = i; j < ciphertext.length; j += keyLength) {
            segment.push(ciphertext[j]);
        }
        
        const segmentFreq = frequencyAnalysis(segment.join(''));
        let maxCorr = -Infinity;
        let bestShift = 0;
        
        for (let shift = 0; shift < 26; shift++) {
            let corr = 0;
            for (let k = 0; k < 26; k++) {
                corr += segmentFreq[(k + shift) % 26] * (26 - englishFrequencies.indexOf(alphabet[k]));
            }
            if (corr > maxCorr) {
                maxCorr = corr;
                bestShift = shift;
            }
        }
        
        key.push(alphabet[bestShift]);
    }
    
    return key.join('');
}

function decryptVigenereWithoutKey(ciphertext) {
    const guessedKeyLength = findBestKeyLength(ciphertext);
    console.log("Guessed Key Length:", guessedKeyLength);
    // let guessedKey = findKey(ciphertext, guessedKeyLength);
    // console.log("Guessed Key:", guessedKey);

    // if (!englishWords.includes(guessedKey.toUpperCase())) {
    //     console.log("Guessed Key is not a valid English word. Trying another approach...");
    //     guessedKey = findKeyWithDictionaryCheck(ciphertext, guessedKeyLength);
    // }

    // const plaintext = vigenereDecrypt(ciphertext, guessedKey);
    // return { guessedKey, plaintext };
}

function findKeyWithDictionaryCheck(ciphertext, keyLength) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const englishFrequencies = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.split('');
    const possibleKeys = [];

    for (let i = 0; i < keyLength; i++) {
        const segment = [];
        for (let j = i; j < ciphertext.length; j += keyLength) {
            segment.push(ciphertext[j]);
        }
        
        const segmentFreq = frequencyAnalysis(segment.join(''));
        let maxCorr = -Infinity;
        let bestShift = 0;
        
        for (let shift = 0; shift < 26; shift++) {
            let corr = 0;
            for (let k = 0; k < 26; k++) {
                corr += segmentFreq[(k + shift) % 26] * (26 - englishFrequencies.indexOf(alphabet[k]));
            }
            if (corr > maxCorr) {
                maxCorr = corr;
                bestShift = shift;
            }
        }
        
        possibleKeys.push(alphabet[bestShift]);
    }

    // Check for valid English words
    for (let word of englishWords) {
        if (word.length === keyLength) {
            let isValid = true;
            for (let i = 0; i < keyLength; i++) {
                if (possibleKeys[i] !== word[i]) {
                    isValid = false;
                    break;
                }
            }
            if (isValid) {
                return word;
            }
        }
    }
    return possibleKeys.join('');
}

function main() {
    const plaintext = "thesunandthemaninthemoon";
    const keyword = "KING";
    
    // Encrypt the plaintext
    const ciphertext = vigenereEncrypt(plaintext, keyword);
    console.log("Ciphertext:", ciphertext);  // Output: DPRYEVNTNBUKWIAOXBUKWWBT
    
    // Decrypt the ciphertext without knowing the key
    const decryptionResult = decryptVigenereWithoutKey(ciphertext);
    
    // console.log("Guessed Key:", decryptionResult.guessedKey);
    // console.log("Decrypted Text:", decryptionResult.plaintext);  // Output: THESUNANDTHEMANINTHEMOON
}

// Run the main function
main();
