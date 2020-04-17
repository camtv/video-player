// Classe che contiene i metodi per lanciare e eventi
export default class EventsClass {
	events = {
		"error": null
	}

	trigger(evt, ...args) {
		if (evt == null || !this.events || !this.events[evt])
			return this;

		// Inserisco currentTarget e target nei parametri reindirizzati
		var params = [{ currentTarget: this, target: this }, ...args];

		// Chiamo le callback
		this.events[evt]
			.filter(el => typeof el.callback == "function")
			.forEach(el => {
				el.callback(...params);
			});
		// console.log("triggered: " + evt, ...args);

		// Chaining calls
		return this;
	}

	on(evts, callback) {
		if (!evts || typeof callback !== "function") return this;

		evts.split(" ").forEach(el => {
			const evt = el.split(".")[0];
			const id = el.split(".")[1] || parseInt(Math.random() * 9999999999999999);

			if (!this.events[evt])
				this.events[evt] = [];
			this.events[evt].push({ id, callback });
		});

		return this;
	}

	off(evts) {
		// Disattivo tutti gli eventi
		if (!evts) {
			Object.keys(this.events).forEach((evt) => {
				this.events[evt] = null;
			});
			return this;
		}

		// Disattivo solo per un tipo di evento
		evts.split(" ").forEach(el => {
			const evt = el.split(".")[0];
			const id = el.split(".")[1];

			// Se non c'è un id di evento cancello tutti quelli dell'evento, altrimenti filtro solo gli altri
			if (!id || !this.events[evt]) // Se faccio l'off di un evento non ancora definito con l'on, allora evito di fare l'analisi per id
				this.events[evt] = null;
			else
				this.events[evt] = this.events[evt].filter(evtSingle => evtSingle.id !== id);
		})

		return this;
	}
}