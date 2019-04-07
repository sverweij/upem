module.exports = function (pInStream = process.stdin) {
  return new Promise((resolve, reject) => {
    let lInput = ''
    pInStream
      .resume()
      .setEncoding('utf8')
      .on('data', (pChunk) => {
        lInput += pChunk
      })
      .on('end', () => {
        try {
          pInStream.pause()
          resolve(lInput)
        } catch (e) {
          reject(e)
        }
      })
      .on('error', (e) => {
        reject(e)
      })
  })
}
