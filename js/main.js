var maxTime = parseInt(localStorage.getItem('maxTime') || '300000')
var started = false
var audioAuthorized = false
var wakeLock
const worker = new Worker('./js/worker.js')

navigator.serviceWorker?.register('service-worker.js')
navigator.serviceWorker.onmessage = m => {
	if (m?.data == 'update') location.reload(true)
}

worker.onmessage = e => {
	if (!started) return
	const time = parseInt(e.data / 1000)
	const min = parseInt(time / 60)
	const sec = time % 60
	const h = document.querySelector('#sand-top').clientHeight
	const elapsedTime = maxTime - e.data
	const ratio = elapsedTime / maxTime
	const sandTopHeight = h * ratio
	const sandBottomHeight = h - sandTopHeight
	document.querySelector('#sand-top').style.setProperty('--h', `${sandTopHeight}px`)
	document.querySelector('#sand-bottom').style.setProperty('--h', `${sandBottomHeight}px`)
	document.querySelector('section').innerText = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
	if (!document.querySelector('mark').classList.contains('started')) document.querySelector('mark').classList.add('started')
	if (e.data > maxTime) {
		if (document.querySelector('mark').classList.contains('alert')) document.querySelector('mark').classList.remove('alert')
		if (document.querySelector('section').classList.contains('alert')) document.querySelector('section').classList.remove('alert')
		if (!document.querySelector('mark').classList.contains('exceeded')) document.querySelector('mark').classList.add('exceeded')
		if (!document.querySelector('section').classList.contains('exceeded')) document.querySelector('section').classList.add('exceeded')
	} else if (e.data >= (maxTime - 10000)) {
		if (document.querySelector('mark').classList.contains('warning')) document.querySelector('mark').classList.remove('warning')
		if (document.querySelector('section').classList.contains('warning')) document.querySelector('section').classList.remove('warning')
		if (!document.querySelector('mark').classList.contains('alert')) document.querySelector('mark').classList.add('alert')
		if (!document.querySelector('section').classList.contains('alert')) document.querySelector('section').classList.add('alert')
	} else if (e.data >= (maxTime - 14000)) {
		if (document.querySelector('audio').currentTime <= 0) {
			document.querySelector('audio').currentTime = 0
			document.querySelector('audio').volume = 1
			document.querySelector('audio').play()
		}
		if (!document.querySelector('mark').classList.contains('warning')) document.querySelector('mark').classList.add('warning')
		if (!document.querySelector('section').classList.contains('warning')) document.querySelector('section').classList.add('warning')
	}
}

setMaxTime = () =>{
	const input = document.querySelector('input').value
	if (!input) return maxTime = 300000
	const time = input.split(':')
	if (!time?.length) return maxTime = 300000
	maxTime = (parseInt(time[0]) * 60 * 1000) + (parseInt(time[1]) * 1000)
	localStorage.setItem('maxTime', maxTime)
}

toggleCount = () => {
	started ? stopCount() : startCount()
}

startCount = () => {
	if (started) return
	try { navigator.wakeLock.request('screen').then(e => wakeLock = e) } catch(e) {}
	started = true
	worker.postMessage('start')
	document.querySelector('button .material-icons').innerText = 'pause'
	document.querySelector('input').setAttribute('disabled', 'disabled')
	setMaxTime()
}

stopCount = () => {
	if (!started) return
	started = false
	worker.postMessage('stop')
	document.querySelector('audio').currentTime = 0
	document.querySelector('mark').classList.remove('started', 'warning', 'alert', 'exceeded')
	document.querySelector('button .material-icons').innerText = 'play_arrow'
	document.querySelector('#sand-top').style.setProperty('--h', `0`)
	document.querySelector('#sand-bottom').style.setProperty('--h', `0`)
	document.querySelector('section').innerText = '00:00'
	document.querySelector('section').classList.remove('warning', 'alert', 'exceeded')
	document.querySelector('input').removeAttribute('disabled')
	document.querySelector('audio').pause()
	try { wakeLock?.release() } catch(e) {}
}

init = () => {
	document.querySelector('button').onclick = () => toggleCount()
	window.onkeydown = e => {
		if (e.keyCode == 13) startCount()
		if (e.keyCode == 27) stopCount()
		if (e.keyCode == 32) toggleCount()
	}
	if (!audioAuthorized) {
		document.querySelector('audio').volume = 0
		document.querySelector('audio').play()
		document.querySelector('audio').pause()
		document.querySelector('audio').currentTime = 0
		audioAuthorized = true
	}
	IMask(document.querySelector('input'), {
		mask: '00:00',
		blocks: {
			hh: {min: 0, max: 23, mask: '00'},
			mm: {min: 0, max: 59, mask: '00'}
		}
	})
	const min = Math.floor(maxTime / 60000)
	const sec = ((maxTime % 60000) / 1000).toFixed(0)
	document.querySelector('input').value = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

document.onreadystatechange = () => {
	if (document.readyState == 'complete') init()
}