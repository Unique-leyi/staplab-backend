exports.generateSecurePassword = () => {
    const lowercaseCharset = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numericCharset = "0123456789";
    const specialCharset = "!@#$%^&*()-_";
    const passwordLength = 8;

    let password = '';

    // Ensure at least one character from each character set
    password += getRandomCharacter(lowercaseCharset);
    password += getRandomCharacter(uppercaseCharset);
    password += getRandomCharacter(numericCharset);
    password += getRandomCharacter(specialCharset);

    // Fill the rest of the password with random characters
    for (let i = 4; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * (lowercaseCharset + uppercaseCharset + numericCharset + specialCharset).length);
        password += (lowercaseCharset + uppercaseCharset + numericCharset + specialCharset)[randomIndex];
    }

    // Shuffle the password to ensure randomness
    password = shuffleString(password);

    return password;
}

const getRandomCharacter = (charset) => {
    const randomIndex = Math.floor(Math.random() * charset.length);
    return charset[randomIndex];
}

const shuffleString = (str) => {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}
