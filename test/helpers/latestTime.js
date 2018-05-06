// Returns the time of the last mined block in seconds
module.exports = async function latestTime () {
  var latestBlock = await web3.eth.getBlock('latest')
  return latestBlock.timestamp;
}
