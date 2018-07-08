module.exports = function (pInStream = process.stdin) {
  return new Promise((resolve, reject) => {
    let lInput = ''
    pInStream.resume()
    pInStream.setEncoding('utf8')
    pInStream.on('data', (pChunk) => {
      lInput += pChunk
    })
    pInStream.on('end', () => {
      try {
        pInStream.pause()
        resolve(lInput)
      } catch (e) {
        reject(e)
      }
    })
    pInStream.on('error', (e) => {
      reject(e)
    })
  })
}
