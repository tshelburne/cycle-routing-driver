declare module 'cycle-routing-driver' {
	type Page = {
		to: string
	}
	export type Route = {
		page: string
		data: { [key: string]: any }
		query: { [key: string]: any }
	}

	export const Router: (args: {
		route: Route,
		children?: ReactNode[]
	}) => React.Context
	export const Route: (args: {
		match: (string | function | object),
		strict: boolean,
		children?: ReactNode[]
	}) => (ReactNode | null)
	export const Link = <T = ReactNode>(args: {
		to: (string | Page),
		activeClassName: string,
		className: string
		props?: Props<T>
	}) => ReactNode
}