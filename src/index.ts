import { ALPHABET } from "./constants";
import { VignereDecryptor } from "./VigenereDecryptor";

function vigenereEncrypt(plaintext, keyword) {
    let ciphertext = '';
    plaintext = plaintext.toUpperCase().replaceAll(' ', '');
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

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter plain text (default: diverttroopstoeastridge): ', (text) => {
    const plainText = text.length > 0 ? text : 'diverttroopstoeastridge';

    readline.question('Enter key (default: KING): ', (key) => {
        const keyword = key.length > 0 ? key : 'KING';

        const encryptedText = vigenereEncrypt(plainText, keyword);
        console.log(`Encrypting ${plainText} with ${keyword}...`);
        console.log(`Encrypted text: ${encryptedText}`);
        readline.close();
    
        const decryptor = new VignereDecryptor(encryptedText)
        
        decryptor.run()
    })
});


