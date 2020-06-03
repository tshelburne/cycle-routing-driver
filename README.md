cycle-routing-driver
====================

[![CircleCI](https://circleci.com/gh/tshelburne/cycle-routing-driver.svg?style=svg)](https://circleci.com/gh/tshelburne/cycle-routing-driver)

Routing driver for [CycleJS](https://cycle.js.org/) that enables simple client-side routing, without worrying about
the frills that more complex routers bring. Includes a React integration to make UI route usage simple.

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
import makeRoutingDriver, {routes} from 'cycle-routing-driver'

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
 * /posts/:post
 * /posts/:post/edit
 * /posts/:post/performance (this will auto-redirect to /posts/:post/performance/dashboard)
 * /posts/:post/performance/demographics
 * /posts/:post/performance/reach
 * /posts/:post/performance/dashboard
 * /posts/:post/performance/search-ranking
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
					toParam: post => post.id || post,
				},
			},
		}
	)
})
```

## React Integration

Because I use React for nearly all my frontend work, I've added a custom integration for easy use of the
routing within a React application. See the example below, using example routes from the code above. Note
the use of the `Router`, `Route`, and `Link` components, as well as the `useRoute` hook.

```js
import {run} from '@cycle/run'
import makeReactDriver from '@sunny-g/cycle-react-driver'
import makeRoutingDriver, {routes} from 'cycle-routing-driver'
import {Router, Route, Link, useRoute} from 'cycle-routing-driver/dist/react/router'

import Modal from './ui/components/modal'
import Homepage from './ui/pages/home'
import EditPost from './ui/pages/post/edit'

const PageName = () => {
	const route = useRoute()

	return <span>Current page: {route.page}</span>
}

const App = ({actions}) => {
	return <div>
		<h1><PageName /></h1>

		<nav>
			<Link className="nav-link" to="homepage" activeClassName="active">Home</Link>
			<a className="nav-link" onClick={() => actions.modal.activate(`signup`)}>Signup</a>
			<Link className="nav-link" to={{page: `post.edit`, data: {post: {id: 1}}}} activeClassName="active">Edit Post 1</Link>
			<Link className="nav-link" to={{page: `post.edit`, data: {post: 2}}} activeClassName="active">Edit Post 2</Link>
			<Link className="nav-link" to={{page: `post.edit`, data: {post: {id: 3}}}} activeClassName="active">Edit Post 3</Link>
		</nav>

		<main>
			<Route match="homepage"><Homepage /></Route>
			<Route match="post" strict>This doesn't show on subroutes (like post.edit)</Route>
			<Route match="post.edit"><EditPost /></Route>
		</main>

		<aside>
			<Route match={{page: "post.edit", data: {post: {id: 1}}}}>
				Always save the first post!
			</Route>
		</aside>

		<Route match={({query}) => !!query.modal}>
			<Modal active onClose={actions.modal.deactivate} />
		</Route>
	</div>
}

function main(sources) {
	const actions = {
		modal: {
			activate: sources.react.handler(`modal.activate`),
			deactivate: sources.react.handler(`modal.deactivate`),
		}
	}

	return {
		// other stuff...,
		route: xs.merge(
			sources.route.filter(({page}) => page === `404`).mapTo({page: `homepage`}),
			sources.react.event(`modal.activate`).map((modal) => ({query: {modal}})),
			sources.react.event(`modal.deactivate`).mapTo({query: {modal: null}}),
		),
		react: sources.route.map((route) =>
			<Router route={route}>
				<App actions={actions}/>
			</Router>
		),
	}
}

run(main, {
	// other stuff...,
	route: makeRoutingDriver(/*route definition...*/),
	react: makeReactDriver(document.getElementById(`app`)),
})
````
