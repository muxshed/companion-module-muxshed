export function initActions(self) {
	const sceneChoices = self.choices.scenes.length
		? self.choices.scenes
		: [{ id: '', label: '(no scenes — check connection)' }]
	const sourceChoices = self.choices.sources.length
		? self.choices.sources
		: [{ id: '', label: '(no sources — check connection)' }]
	const overlayChoices = self.choices.overlays.length
		? self.choices.overlays
		: [{ id: '', label: '(no overlays)' }]

	self.setActionDefinitions({
		go_live: {
			name: 'Go Live',
			options: [],
			callback: () => self.request('/stream/start'),
		},
		end_stream: {
			name: 'End Stream',
			options: [],
			callback: () => self.request('/stream/stop'),
		},
		cut_scene: {
			name: 'Activate Scene',
			options: [
				{
					type: 'dropdown',
					id: 'scene',
					label: 'Scene',
					choices: sceneChoices,
					default: sceneChoices[0].id,
				},
			],
			callback: (a) => self.request(`/scenes/${a.options.scene}/activate`),
		},
		cut_source: {
			name: 'Cut to Source',
			options: [
				{
					type: 'dropdown',
					id: 'source',
					label: 'Source',
					choices: sourceChoices,
					default: sourceChoices[0].id,
				},
			],
			callback: (a) => self.request(`/cut/${a.options.source}`),
		},
		bleep: {
			name: 'Bleep',
			options: [],
			callback: () => self.request('/delay/bleep'),
		},
		record_start: {
			name: 'Start Recording',
			options: [],
			callback: () => self.request('/record/start'),
		},
		record_stop: {
			name: 'Stop Recording',
			options: [],
			callback: () => self.request('/record/stop'),
		},
		record_toggle: {
			name: 'Toggle Recording',
			options: [],
			callback: () => self.request(self.state.recording ? '/record/stop' : '/record/start'),
		},
		overlay_show: {
			name: 'Show Overlay',
			options: [
				{
					type: 'dropdown',
					id: 'overlay',
					label: 'Overlay',
					choices: overlayChoices,
					default: overlayChoices[0].id,
				},
			],
			callback: (a) => self.request(`/overlays/${a.options.overlay}/show`),
		},
		overlay_hide: {
			name: 'Hide Overlay',
			options: [
				{
					type: 'dropdown',
					id: 'overlay',
					label: 'Overlay',
					choices: overlayChoices,
					default: overlayChoices[0].id,
				},
			],
			callback: (a) => self.request(`/overlays/${a.options.overlay}/hide`),
		},
		refresh: {
			name: 'Refresh scenes / sources / overlays',
			options: [],
			callback: () => self.refreshChoices(),
		},
	})
}
