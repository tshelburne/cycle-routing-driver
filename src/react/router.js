import React, {useContext} from 'react'
import cx from 'classnames'

const RouteContext = React.createContext()

export const Router = ({route, children}) => {
	return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
}

export const Route = ({match, children}) => {
	const route = useRoute()
	const isMatch = routeMatches(match, route)

	return isMatch ? <React.Fragment>{children}</React.Fragment> : null
}

export const Link = ({to, activeClassName, className, ...props}) => {
	const route = useRoute()

	const toRoute = typeof to === `string` ? {page: to} : to
	const active = routeMatches(toRoute, route)
	const href = route.toUrl(toRoute)
	const classes = cx(className, {[activeClassName]: active}) || null

	return <a {...props} className={classes} href={href} />
}

export function useRoute() {
	return useContext(RouteContext)
}

// HELPERS

function routeMatches(check, route) {
	switch (typeof check) {
		case `string`: return pageMatches(check, route)
		case `function`: return check(route)
		case `object`:
		default:
			return !!check.page && pageMatches(check.page, route) &&
					keysMatch(route.data, check.data) &&
					keysMatch(route.query, check.query)
	}
}

function pageMatches(page, route) {
	const matcher = new RegExp(`^${page.replace(`.`, `\.`)}(\.\w*)*$`)
	return matcher.test(route.page)
}

function keysMatch(actual, expected) {
	if (!expected) return true

	return Object.entries(expected).reduce((acc, [key, value]) => {
		return acc && actual[key] === value
	}, true)
}