
/*
 * GET home page.
 */

var _ = require('underscore'),
	logger = require('../winston');

exports.getContracts = function (req, res, next) {
	logger.info('get contracts', req.query.clientId);
	
    logger.info('AgentId', req.headers['agentid']);
    
    var queryObj = {
        policyHolder: req.query.clientId,
    };
    if (req.headers['agentid']) { 
        queryObj['agent.agentId'] = req.headers['agentid'];
    }
    console.log(queryObj);
    
    Transaction.find(queryObj).lean().exec( function(err, contracts) {
		if (err) { next(err); }
//        logger.info(contracts);
		res.json(contracts);
	});
};

exports.getSingleContract = function (req, res, next) {
	logger.info('get contract', req.query.clientId, req.params.contractId);
	Transaction.find({policyHolder: req.query.clientId, policyId: req.params.contractId}).lean().exec( function(err, contracts) {
		if (err) { next(err); }
        res.json(contracts);
	});
};