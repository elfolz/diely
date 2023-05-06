var maxTime = parseInt(localStorage.getItem('maxTime') || '300000')
var started = false
const worker = new Worker('./js/worker.js')

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
		if (!document.querySelector('mark').classList.contains('exceeded')) document.querySelector('mark').classList.add('exceeded')
		if (!document.querySelector('section').classList.contains('exceeded')) document.querySelector('section').classList.add('exceeded')
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

init = () => {
	document.querySelector('button').onclick = () => {
		if (started) {
			started = false
			worker.postMessage('stop')
			document.querySelector('mark').classList.remove('started')
			document.querySelector('button .material-icons').innerText = 'play_arrow'
			document.querySelector('#sand-top').style.setProperty('--h', `0`)
			document.querySelector('#sand-bottom').style.setProperty('--h', `0`)
			document.querySelector('section').innerText = '00:00'
			document.querySelector('section').classList.remove('exceeded')
			document.querySelector('mark').classList.remove('exceeded')
			document.querySelector('input').removeAttribute('disabled')
		} else {
			started = true
			worker.postMessage('start')
			document.querySelector('button .material-icons').innerText = 'pause'
			document.querySelector('input').setAttribute('disabled', 'disabled')
			setMaxTime()
		}
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