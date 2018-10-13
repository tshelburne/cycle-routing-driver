import {captureClicks, makeHistoryDriver} from '@cycle/history'
import qs from 'qs'

function makeRoutingDriver(...routerArgs) {
	const historyDriver = captureClicks(makeHistoryDriver())
	const router = createRouter(...routerArgs)

	return function routingDriver(routeUpdate_) {
		const historyUpdate_ = routeUpdate_.map(router.toHistory).map(h => ({
			type: `push`,
			pathname: `${h.pathname}${h.search}`,
		}))

		const history_ = historyDriver(historyUpdate_)

		return history_.map(router.fromHistory).map(route => ({
			...route,
			toUrl: next => router.toUrl({...route, ...next}),
		}))
	}
}

export default makeRoutingDriver

export function createRouter(routes, config = {}) {
	const id = v => v

	const internalRoutes = createInternalRoutes(routes)

	return {
		toHistory,
		toUrl(route) {
			const {pathname, search} = toHistory(route)

			return `${pathname}${search !== `?` ? search : ``}`
		},
		fromHistory,
	}

	function toHistory({page, data, query}) {
		const route = internalRoutes.find(route => route.page === page)
		if (!route) return {pathname: `/notfound`, search: ``}

		const search = query ? `?${qs.stringify(query)}` : ``
		const pathname = route.params.reduce((pathname, name) => {
			const toParam = route.paramMappers[name]
				? route.paramMappers[name].toParam
				: id
			return pathname.replace(`:${name}`, toParam(data[name]))
		}, route.path)

		return {pathname, search}
	}

	function fromHistory({pathname, search}) {
		const query = qs.parse(search.replace(/^\?/, ``))

		const route = internalRoutes.find(({pathRegex}) => pathRegex.test(pathname))
		if (!route) return {page: `404`, data: {}, query}

		const page = route.page
		const paramValues = pathname.match(route.pathRegex).slice(1)
		const data = route.params.reduce((data, name, i) => {
			const toData = route.paramMappers[name]
				? route.paramMappers[name].toData
				: id
			return {...data, [name]: toData(paramValues[i])}
		}, {})

		return {page, data, query}
	}

	// HELPER

	function createInternalRoutes(routes, base = {}) {
		return routes.reduce((allRoutes, route) => {
			const fullRoute = createInternalRoute(route, base)
			const subRoutes = createInternalRoutes(route.subs || [], fullRoute)

			if (route.index) {
				const indexRoute = subRoutes.find(
					({page}) => page === `${fullRoute.page}.${route.index}`
				)
				return allRoutes.concat(...subRoutes, {
					...indexRoute,
					page: fullRoute.page,
				})
			}

			return allRoutes.concat(fullRoute, ...subRoutes)
		}, [])
	}

	function createInternalRoute(external, base = {}) {
		const [preBasePage, preBasePath] =
			typeof external === `string`
				? [external, `/${external}`]
				: [external.page, external.path || `/${external.page}`]

		const path = `${base.path || ``}${preBasePath}`
		const pathRegex = new RegExp(`^${path.replace(/:\w*/g, `(\\w*)`)}\/?$`)
		const page = `${base.page ? `${base.page}.` : ``}${preBasePage}`
		const params = (path.match(/:\w*/g) || []).map(str => str.slice(1))
		const paramMappers = {
			...(config.params || {}),
			...(base.params || {}),
			...(external.params || {}),
		}

		return {path, pathRegex, page, params, paramMappers}
	}
}

// function to create a route configuration with template literals rather than unwieldy objects
export function routes(strings, ...paramsValues) {
	// map to route shapes
	const indentedRoutes = strings.reduce((indentedRoutes, str, i) => {
		const lines = str.split(`\n`).filter(v => /\w/.test(v))
		const newRoutes = lines.map((line, j) => {
			const [_, indent, page, __, path, ___, index] =
				line.match(/^(\t*)([^\s]*)( \(([^\)]*)\))?( -> (\S*))? ?$/) || []
			const params =
				i < strings.length - 1 && j === lines.length - 1
					? paramsValues[i]
					: undefined
			return {
				route: {page, path, index, params, subs: []},
				indent: indent.match(/\t/g).length,
			}
		})
		return indentedRoutes.concat(newRoutes)
	}, [])

	// build subrouting
	let routes = []
	let stack = []
	indentedRoutes.forEach(current => {
		if (stack.length == 0) {
			stack.push(current)
			return routes.push(current.route)
		}

		const prev = stack.pop()

		if (prev.indent < current.indent) {
			stack.push(prev, current)
			return prev.route.subs.push(current.route)
		}

		if (prev.indent > current.indent) {
			stack = stack.slice(0, prev.indent - current.indent)
		}

		const parent =
			stack.length === 0 ? routes : stack[stack.length - 1].route.subs
		stack.push(current)
		return parent.push(current.route)
	})

	return routes
}