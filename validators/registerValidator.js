const { body } = require('express-validator')

exports.registerValidator = [
    body('username').notEmpty().withMessage('A felhasználónév kötelező.'),
    body('email')
        .notEmpty()
        .withMessage('Az email mező nem lehet üres.')
        .isEmail()
        .withMessage('Érvényes e-mail címet adj meg.'),
    body('create_password')
        .isLength({ min: 8 })
        .withMessage('A jelszónak legalább 8 karakter hosszúnak kell lennie.')
        .matches(/[0-9]/)
        .withMessage('A jelszónak tartalmaznia kell számot.')
        .matches(/[A-Z]/)
        .withMessage('A jelszónak tartalmaznia kell nagybetűt.')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('A jelszónak tartalmaznia kell speciális karaktert.'),
    body('confirm_password')
        .custom((value, { req }) => value === req.body.create_password)
        .withMessage('A jelszavak nem egyeznek.'),
]
