cycle-routing-driver
====================

[![CircleCI](https://circleci.com/gh/tshelburne/cycle-routing-driver.svg?style=svg)](https://circleci.com/gh/tshelburne/cycle-routing-driver)

Routing driver for [CycleJS](https://cycle.js.org/) that enables simple client-side routing, without worrying about
the frills that more complex routers bring.

## Intention

This library considers data-loading and rendering outside of its scope - this is all about converting back and forth
between `window.location` and a route object, with some extra goodness to make it fun to use.

A route object is a simple bundle of three properties - `page`, `data`, and `query`. Every route has a name which is set
in the `page` property, and is generated according to the configuration used when creating the router. When there are url
parameters in the configuration, those values are mapped into the `data` property. And finally, any query string info is
mapped into the `query` property.

In addition to the properties mentioned above, a route object also has a function called `toUrl`. This function can be
called with a "route-like" argument to generate the URL for another route, while preserving the rest of the current routes
details. For example, `postViewRoute.toUrl({page: "post.edit"})` would preserve the data for the post being viewed, (eg. the
post id parameter in the URL) but change the path to match the post edit route. This is useful when generating links in
markup which relate to the current route.

## Usage

```js
npm install --save cycle-routing-driver
```

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

/*
 * the configuration below supports the following route structure:
 * /homepage
 * /about
 * /post/:post
 * /post/:post/edit
 * /post/:post/performance (this will auto-redirect to /post/:post/performance/dashboard)
 * /post/:post/performance/demographics
 * /post/:post/performance/reach
 * /post/:post/performance/dashboard
 * /post/:post/performance/search-ranking
 */
run(main, {
	// other stuff...,
	route: makeRoutingDriver(
		// the `routes` DSL provides a clean interface for defining basic routes
		routes`
		homepage
		about
		post (/posts/:post)
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
