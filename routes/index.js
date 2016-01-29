
/*
 * GET home page.
 */

var _ = require('underscore'),
	logger = require('../winston');

exports.getContracts = function (req, res, next) {
	logger.info('get contracts', req.query.clientId);
	Transaction.find({policyHolder: req.query.clientId}, function(err, contracts) {
		if (err) { next(err); }
//        logger.info(contracts);
		res.json(contracts);
	});
};

exports.getSingleContract = function (req, res, next) {
	logger.info('get contract', req.query.clientId, req.params.contractId);
	Transaction.find({policyHolder: req.query.clientId, policyId: req.params.contractId}, function(err, contracts) {
		if (err) { next(err); }
        res.json(contracts);
	});
};