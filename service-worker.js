self.addEventListener('install', event => {
	self.skipWaiting()
})

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.open('diely')
		.then(cache => {
			return cache.match(event.request)
			.then(cachedResponse => {
				fetchedResponse = fetchNewData(event, cache)
				return cachedResponse || fetchedResponse
			})
		})
		.catch(() => {
			return fetch(event.request)
		})
	)
})

function fetchNewData(event, cache) {
	return fetch(event.request)
	.then(networkResponse => {
		if (networkResponse.status == 200) cache.put(event.request, networkResponse.clone())
		if (event.clientId) {
			self.clients.get(event.clientId)
			.then(client => {
				client?.postMessage('update')
			})
		}
		return networkResponse
	})
}