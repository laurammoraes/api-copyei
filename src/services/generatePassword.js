export function generatePassword() {
    const minLength = 6;
    const maxLength = 12;

    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "@.#$!%*?&^";

    const requiredChars = [
        letters[Math.floor(Math.random() * letters.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
    ];

    const allChars = letters + numbers + specialChars;
    const remainingLength = Math.floor(
        Math.random() * (maxLength - minLength + 1) + minLength
    ) - requiredChars.length;

    for (let i = 0; i < remainingLength; i++) {
        requiredChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    const shuffledPassword = requiredChars
        .sort(() => Math.random() - 0.5)
        .join("");

    return shuffledPassword;
}

