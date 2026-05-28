'use strict';

function validate(validatorFn) {
  return function (req, res, next) {
    const error = validatorFn(req.body, req.params, req.query);

    if (error) {
      return res.status(400).json({
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    next();
  };
}

module.exports = validate;
