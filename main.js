import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import WebSocket from 'ws'
import { initActions } from './actions.js'
import { initFeedbacks } from './feedbacks.js'
import { initVariables, updateVariables } from './variables.js'
import { initPresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'

class MuxshedInstance extends InstanceBase {
	async init(config) {
		this.config = config
		this.state = { pipeline: 'idle', recording: false, startedAt: null, activeScene: '' }
		this.choices = { scenes: [], sources: [], overlays: [] }
		this.ws = null
		this.reconnectTimer = null
		this.uptimeTimer = null

		this.updateStatus(InstanceStatus.Connecting)
		initActions(this)
		initFeedbacks(this)
		initVariables(this)
		initPresets(this)

		await this.refreshChoices()
		this.connect()
		this.uptimeTimer = setInterval(() => {
			if (this.state.pipeline === 'live') updateVariables(this)
		}, 1000)
	}

	async destroy() {
		this.stopReconnect()
		if (this.uptimeTimer) clearInterval(this.uptimeTimer)
		this.closeSocket()
	}

	async configUpdated(config) {
		this.config = config
		this.closeSocket()
		await this.refreshChoices()
		this.connect()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Muxshed',
				value: 'Control a self-hosted Muxshed instance. Create an API key in the studio under Settings → API Keys.',
			},
			{ type: 'textinput', id: 'host', label: 'Host / IP', width: 6, default: '127.0.0.1' },
			{ type: 'number', id: 'port', label: 'Port', width: 3, default: 8080, min: 1, max: 65535 },
			{ type: 'textinput', id: 'apikey', label: 'API key', width: 12, default: '', required: true },
		]
	}

	get host() {
		return this.config?.host || '127.0.0.1'
	}
	get port() {
		return this.config?.port || 8080
	}
	baseUrl() {
		return `http://${this.host}:${this.port}/api/v1`
	}

	/** REST call to the Muxshed API. Returns parsed JSON, {} on empty, or null on failure. */
	async request(path, method = 'POST', body) {
		const headers = { 'X-API-Key': this.config?.apikey || '' }
		if (body !== undefined) headers['Content-Type'] = 'application/json'
		try {
			const res = await fetch(`${this.baseUrl()}${path}`, {
				method,
				headers,
				body: body !== undefined ? JSON.stringify(body) : undefined,
			})
			if (!res.ok) {
				const txt = await res.text().catch(() => '')
				this.log('warn', `${method} ${path} → ${res.status} ${txt}`)
				return null
			}
			const t = await res.text()
			return t ? JSON.parse(t) : {}
		} catch (e) {
			this.log('error', `request failed: ${e.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, e.message)
			return null
		}
	}

	/** Pull scenes / sources / overlays so action dropdowns are populated. */
	async refreshChoices() {
		const map = (arr) =>
			Array.isArray(arr) ? arr.map((x) => ({ id: x.id, label: x.name || x.id })) : []
		const [scenes, sources, overlays] = await Promise.all([
			this.request('/scenes', 'GET'),
			this.request('/sources', 'GET'),
			this.request('/overlays', 'GET'),
		])
		this.choices.scenes = map(scenes)
		this.choices.sources = map(sources)
		this.choices.overlays = map(overlays)
		initActions(this) // re-publish actions with fresh dropdown choices
	}

	// ── Live state over WebSocket ──
	connect() {
		this.closeSocket()
		const key = encodeURIComponent(this.config?.apikey || '')
		const url = `ws://${this.host}:${this.port}/api/v1/ws?key=${key}`
		try {
			this.ws = new WebSocket(url)
		} catch (e) {
			this.log('debug', `ws connect failed: ${e.message}`)
			this.scheduleReconnect()
			return
		}
		this.ws.on('open', () => {
			this.updateStatus(InstanceStatus.Ok)
			this.log('info', 'connected to Muxshed')
		})
		this.ws.on('message', (data) => {
			try {
				this.handleEvent(JSON.parse(data.toString()))
			} catch {
				// ignore non-JSON frames
			}
		})
		this.ws.on('close', () => {
			this.updateStatus(InstanceStatus.Disconnected)
			this.scheduleReconnect()
		})
		this.ws.on('error', (e) => this.log('debug', `ws error: ${e.message}`))
	}

	closeSocket() {
		if (this.ws) {
			try {
				this.ws.removeAllListeners()
				this.ws.close()
			} catch {
				// already closed
			}
			this.ws = null
		}
	}

	scheduleReconnect() {
		this.stopReconnect()
		this.reconnectTimer = setTimeout(() => this.connect(), 3000)
	}
	stopReconnect() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	handleEvent(evt) {
		switch (evt?.type) {
			case 'pipeline_state':
				this.state.pipeline = evt.payload?.state ?? 'idle'
				this.state.startedAt = evt.payload?.started_at ?? null
				this.checkFeedbacks('on_air', 'pipeline_state')
				updateVariables(this)
				break
			case 'recording_state':
				this.state.recording = !!evt.payload?.recording
				this.checkFeedbacks('recording')
				updateVariables(this)
				break
			case 'scene_changed':
				this.state.activeScene = evt.payload?.scene_id ?? ''
				updateVariables(this)
				break
			default:
				break
		}
	}
}

runEntrypoint(MuxshedInstance, UpgradeScripts)
