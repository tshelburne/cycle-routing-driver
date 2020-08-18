declare module 'cycle-routing-driver' {
	export type Route = {
		page: string
		data: { [key: string]: any }
		query: { [key: string]: any }
	}
}