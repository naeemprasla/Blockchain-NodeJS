const express = require('express');
const app = express()
const bodypasrser = require('body-parser');
const Blockchain = require('./blockchain');
const rp = require('request-promise');
const {v4: uuidv4} = require('uuid');
const { json } = require('body-parser');

const bitcoin = new Blockchain();
const port = process.argv[2];


const nodeAddress = uuidv4().split('-').join('');

app.use(bodypasrser.json());
app.use(bodypasrser.urlencoded({extended: false}));

app.get('/blockchain', (req, res) => {
  res.send(bitcoin);
})

app.post('/transaction', (req, res) => {
    const blockindex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({none: blockindex});

});

//Mine a New Block
app.get('/mine', (req, res) => {

  
  const lastBlock = bitcoin.getLastBlock(); // Get Last Block
  const previousBlockHash = lastBlock['hash']; // Get prev Block Hash

  //Get Current Block Data
  const currentBlockData = {
    transaction: bitcoin.pendingTransactions,
    index: lastBlock['index'] + 1
  };

  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData); //Get nonce by PoW
  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce); //Get Block Hash
  
  bitcoin.createNewTransaction(10, "0000000", nodeAddress); // give reward to miners
  
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash); // Create New Block


  // const requestPromises = [];
  // bitcoin.networkNodes.forEach(networkNodeUrl => {

  //   const requestOptions = {
  //       uri: networkNodeUrl + '/recieve-new-block',
  //       method: 'POST',
  //       body: { newBlock: newBlock },
  //       json: true
  //   };

  //  requestPromises.push(rp(requestOptions)); 

  // });

  // Promise.all(requestPromises)
  // .then(data =>{

  // });

  res.json({note: newBlock});

});

app.get('/wallet', (req, res) => {
 res.sendFile(__dirname + "/index.html");
});

app.post('/wallet', (req, res) => {
  const blockindex = bitcoin.createNewTransaction(req.body.amount, req.body.senderAddress, req.body.recipientAddress);
    res.json({note: blockindex});
 });
 



//register a node and broadcast it to the network
app.post('/register-broadcast-node', (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
      const requestOptions = {
          uri: networkNodeUrl + '/register-node',
          method: 'POST',
          body: { newNodeUrl: newNodeUrl},
          json: true
      };

      regNodesPromises.push(rp(requestOptions));

    });

    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
          url: newNodeUrl + '/register-multi-node',
          method: 'POST',
          body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
          json: true
        };
        return rp(bulkRegisterOptions);
    }).then(data => {
        res.json({ note: 'New Node Registered With Network'});
    });

});


// this will register a node
app.post('/register-node', (req, res) => {

  const newNodeUrl = req.body.networkNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode  = bitcoin.currentNodeUrl !== newNodeUrl;
  if(nodeNotAlreadyPresent && notCurrentNode)  bitcoin.networkNodes.push(newNodeUrl);

  res.json({note: 'New Node Registered'})

});

//this will register multi nodes
app.post('/register-multi-node', (req, res) => {

   const allNetworkNodes =  req.body.allNetworkNodes;

    allNetworkNodes.forEach(networkNodeUrl => {

      const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
      const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
      if(nodeNotAlreadyPresent && notCurrentNode)  bitcoin.networkNodes.push(networkNodeUrl);


   });

   res.json({note: 'Multi Nodes Registered'});
});




app.listen(port, () => { 
    console.log(`Server Started on  ${port}`);
});