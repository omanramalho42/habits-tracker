// Exemplo de como adicionar seu código ao Service Worker do Workbox
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

// self.addEventListener("push", async (e) => {
// 	const { message, body, icon } = JSON.parse(e.data.text());

// 	e.waitUntil(
// 		self.registration.showNotification(message, {
// 			body,
// 			icon,
// 		})
// 	);
// });

// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força a ativação imediata
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado!');
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	// This looks to see if the current window is already open and
	// focuses if it is
	event.waitUntil(
		clients
			.matchAll({
				type: "window",
			})
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url === "/" && "focus" in client)
						return client.focus();
				}
				if (clients.openWindow) return clients.openWindow("/");
			})
	);
})

// ADICIONE ISSO NO FINAL DO ARQUIVO
self.addEventListener("push", async (e) => {
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.message, {
      body: data.body,
      icon: data.icon,
    })
  );
});