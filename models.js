var Transaction;

function defineModels(mongoose, fn) {
	var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

   /**
    * Model: Item
    */
  Transaction = new Schema({
		policyId: String,
		productId: String,
		policyHolder: String,
		agent:{
			agentId: String
		}
  });
     
  mongoose.model('Transaction', Transaction);
  
  fn();
}

exports.defineModels = defineModels; 