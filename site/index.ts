console.log('hey world')

new EventSource('/reload').onmessage = () => location.reload()
