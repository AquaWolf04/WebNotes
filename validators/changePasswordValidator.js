const { body } = require('express-validator')

exports.changePasswordValidator = [
    body('currentPassword').notEmpty().withMessage('A jelenlegi jelszó megadása kötelező!'),

    body('newPassword').isLength({ min: 6 }).withMessage('Az új jelszónak legalább 6 karakter hosszúnak kell lennie!'),

    body('confirmPassword')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Az új jelszó és a megerősítése nem egyezik!'),
]
