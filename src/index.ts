import { ALPHABET } from "./constants";
import { VignereDecryptor } from "./VigenereDecryptor";

function vigenereEncrypt(plaintext, keyword) {
    let ciphertext = '';
    plaintext = plaintext.toUpperCase();
    keyword = keyword.toUpperCase();
    
    for (let i = 0, j = 0; i < plaintext.length; i++) {
        const plaintextChar = plaintext.charAt(i);
        if (ALPHABET.indexOf(plaintextChar) !== -1) {
            const plaintextPos = ALPHABET.indexOf(plaintextChar);
            const keywordPos = ALPHABET.indexOf(keyword.charAt(j % keyword.length));
            const cipherPos = (plaintextPos + keywordPos) % 26;
            ciphertext += ALPHABET.charAt(cipherPos);
            j++;
        } else {
            ciphertext += plaintextChar;
        }
    }
    return ciphertext;
}

const encryptedText = vigenereEncrypt('thesunandthemaninthemoon', 'KING');

const decryptor = new VignereDecryptor(encryptedText)

decryptor.run()
