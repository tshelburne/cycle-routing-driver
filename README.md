cycle-routing-driver
====================

[![CircleCI](https://circleci.com/gh/tshelburne/cycle-routing-driver.svg?style=svg)](https://circleci.com/gh/tshelburne/cycle-routing-driver)

Routing driver for [CycleJS](https://cycle.js.org/) that enables simple client-side routing.

```js
npm install --save cycle-routing-driver
```

## Usage

Updating the location bar and clicking links already works, so most of the work is hands-off. If you do need
to force a route change based on an event, just stream it in via the sinks.

```js
import {run} from '@cycle/run'
import makeRoutingDriver, {routes} from 'lib/cyclejs/routing-driver'

function main(sources) {
	// in addition to path data and parameters, we get query string data so your page can render accordingly
	const modal_ = sources.route.map(({query}) => query.modal)

	return {
		// other stuff...,
		route: xs.merge(
			// if you would prefer to just bounce bad urls somewhere, you can!
			sources.route.filter(({page}) => page === `404`).mapTo({page: `homepage`}),

			// updating the URL always happens contextually - what streams through is reduced into the existing route
			sources.DOM.select(`.signup-modal`).events(`click`).mapTo({query: {modal: `signup`}}),

			// mapping query values to null removes them entirely
			sources.DOM.select(`.modal-close`).events(`click`).mapTo({query: {modal: null}}),
		),
	}
}

run(main, {
	// other stuff...,
	route: makeRoutingDriver(
		// the routes DSL provides a clean interface for defining basic routes
		routes`
		homepage
		about
		post (/posts/:post) -> view
			view
			edit
			performance -> dashboard
				demographics
				reach
				dashboard
				search-ranking
		`,
		{
			params: {
				post: {
					toData: _ => _,
					toParam: data => data.id || data,
				},
			},
		}
	)
})

```
