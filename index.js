const http = require("http")
const fetch = require("node-fetch");
const port = 8080;
const KEYS = require("./keys.json");
const API_KEY = KEYS.nimiqx;
const API_URL = "https://api.nimiqx.com";

async function getAllTx(addr, startingAt = 0, reqSize = 100, data = []) {
  const reqUrl = API_URL + "/account-transactions/" + addr + "/" + reqSize + "/" + startingAt + "?api_key=" + API_KEY;
  console.log("fetching NX " + reqUrl);
  const nxData = await (await fetch(reqUrl)).json();
  if (nxData.error) return [JSON.stringify(nxData)];
  data = data.concat(nxData);
  if (nxData.length === reqSize) {
    return await getAllTx(addr, startingAt + reqSize, reqSize, data);
  } else {
    return data;
  }
}

const requestHandler = async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  if ((request.url.indexOf("/") === -1) || (request.url === "/")) {
    return response.end("Nimiq Smart Contract API Node v1");
  }
  var nxData = await getAllTx(request.url.split("/")[1]);
  var resData = [];
  nxData.forEach(tx => {
    resData.push({
      data: tx.message,
      sender: tx.from_address,
      receiver: tx.to_address,
      hash: tx.hash,
      blockHash: tx.block_hash,
      blockNum: tx.block_num,
      timestamp: tx.timestamp,
      amount: tx.value
    });
  });
  response.end(JSON.stringify(resData));
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log("Error setting up server", err)
  }
})
