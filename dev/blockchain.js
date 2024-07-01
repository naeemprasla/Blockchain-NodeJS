const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];


//Constructor 
function Blockchain(){

    this.chain = [];
    this.pendingTransactions = [];

    //Genisis Block
    this.createNewBlock(100,'DUMMYYY','DUMMYYY');
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
}

// Create New Blocks
Blockchain.prototype.createNewBlock = function(nonce, prevBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions : this.pendingTransactions,
        nonce : nonce,
        prevBlockHash: prevBlockHash,
        hash: hash

    }

this.pendingTransactions = []; // Pending Transactions Data Array
this.chain.push(newBlock); // Add To Chain Array

return newBlock;

}


// Get Last Block From Chain
Blockchain.prototype.getLastBlock = function(){
        return this.chain[this.chain.length - 1];
}

// Create New Transaction
Blockchain.prototype.createNewTransaction = function(amount,sender,recipient){

    const newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient
    };
    //Add To Pending Transaction Array
    this.pendingTransactions.push(newTransaction);

    //Add Pending Transaction Next Block 
    return this.getLastBlock()['index'] + 1;

}


//Convert Block into Hash encryption
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData,nonce){
   //Join All Parametert and convert Info Hash Encryption
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    return sha256(dataAsString);

}

//Proof Work Validation
Blockchain.prototype.proofOfWork = function(prevBlockHash, currblockData){

    let nonce = 0;
    let hash = this.hashBlock(prevBlockHash, currblockData, nonce);

    //run the hash block until we get "0000" in start of our hash
    while (hash.substring(0,4) != '0000') {
         nonce++;
         hash = this.hashBlock(prevBlockHash, currblockData, nonce); 
         //console.log(hash);  
    }

    return nonce;

}



module.exports = Blockchain;
