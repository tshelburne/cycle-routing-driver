import React, {useContext} from 'react'
import cx from 'classnames'

const RouteContext = React.createContext()

export const Router = ({route, children}) => {
	return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
}

export const Route = ({match, children}) => {
	const route = useRoute()
	const isMatch = (typeof match === `string` && pageMatches(match, route)) || routeMatches(match, route)

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

function pageMatches(page, route) {
	const matcher = new RegExp(`^${page.replace(`.`, `\.`)}(\.\w*)*$`)
	return matcher.test(route.page)
}

function routeMatches({page, data, query}, route) {
	return !!page && pageMatches(page, route) &&
		keysMatch(route.data, data) &&
		keysMatch(route.query, query)
}

function keysMatch(actual, expected) {
	if (!expected) return true

	return Object.entries(expected).reduce((acc, [key, value]) => {
		return acc && actual[key] === value
	}, true)
}