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
		policyHolder:{
			partyId: String
		},
		agent:{
			agentId: String,
			node: String
		}
  });
     
  mongoose.model('Transaction', Transaction);
  
  fn();
}

exports.defineModels = defineModels; 