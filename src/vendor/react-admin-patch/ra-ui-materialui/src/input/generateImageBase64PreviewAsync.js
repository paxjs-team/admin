export default function generateImageBase64PreviewAsync(url, previewWidth) {
  if (!url || !previewWidth || typeof url !== 'string') {
    return Promise.reject('Missing arguments')
  }

  return new Promise(resolve => {
    let img = new Image()

    img.onload = function() {
      const resizeFactor = previewWidth / this.width
      const previewHeight = this.height * resizeFactor

      let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')

      canvas.width = previewWidth
      canvas.height = previewHeight

      ctx.drawImage(this, 0, 0, previewWidth, previewHeight)

      const base64 = canvas.toDataURL('image/jpeg')

      resolve({
        preview: base64,
        imageWidth: this.width,
        imageHeight: this.height,
      })
    }

    img.src = url
  })
}
