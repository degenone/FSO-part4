pwRegex =
    /^(?=.*[A-ZÖÄÅ])(?=.*[a-zöäå])(?=.*\d)(?=.*[@$!%*#?&|'",.<>_-])[A-ZÄÖÅa-zöäå\d@$!%*#?&|'",.<>_-]{8,}$/;
passwordError =
    'password must be at least 8 characters, contain one uppercase letter, one lowercase letter, one number and one special character: @$!%*#?&|\'",.<>_-';
const validate = (password) => pwRegex.test(password);
module.exports = { passwordError, validate };
