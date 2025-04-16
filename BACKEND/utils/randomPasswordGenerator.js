module.exports.passwordGenerator = (input, length = 100)=> {
    const charSet = "!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charTypes = {
        symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        digits: "0123456789"
    };

    let baseString = Array.from(input).map(char => char.charCodeAt(0).toString(36)).join('');
    let password = "";
    let hasSymbol = false, hasUpper = false, hasLower = false, hasDigit = false;

    for (let i = 0; password.length < length; i++) {
        let charCode = baseString.charCodeAt(i % baseString.length);
        let index = ((charCode * (i + 1)) ^ (charCode >> 3) + i * 7) % charSet.length;
        password += charSet[index];

        
        if (charSet[index].match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) hasSymbol = true;
        if (charSet[index].match(/[A-Z]/)) hasUpper = true;
        if (charSet[index].match(/[a-z]/)) hasLower = true;
        if (charSet[index].match(/[0-9]/)) hasDigit = true;
    }

    
    if (!hasSymbol) password = password.replace(/[^A-Za-z0-9]/, charTypes.symbols[Math.floor(Math.random() * charTypes.symbols.length)]);
    if (!hasUpper) password = password.replace(/[^A-Za-z0-9]/, charTypes.uppercase[Math.floor(Math.random() * charTypes.uppercase.length)]);
    if (!hasLower) password = password.replace(/[^A-Za-z0-9]/, charTypes.lowercase[Math.floor(Math.random() * charTypes.lowercase.length)]);
    if (!hasDigit) password = password.replace(/[^A-Za-z0-9]/, charTypes.digits[Math.floor(Math.random() * charTypes.digits.length)]);

    return password;
}