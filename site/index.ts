import Matter from 'matter-js'

console.log('hey world', Matter)

new EventSource('/reload').onmessage = () => location.reload()
